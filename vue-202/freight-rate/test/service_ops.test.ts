import { Api } from "../src/data/freight-store"
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import type { DiffGram } from "../src/@types/FreightRate"
import {
  asDate,
  asLocaleDate,
  asZulu,
  inputToZulu,
  addDay,
  ONE_DAY,
  INFINITY_DATE,
  addMonth,
  asDecimal,
  round2,
  today,
} from "../src/lib/fun"

const services = new Api("http://localhost:5000/aiq/api/")

// ticks as of 2020-01-01
const START_DATE = Date.UTC(2020, 0, 1).valueOf()

describe("fun tests", () => {
  it("date formatting", () => {
    expect(START_DATE).toBe(1577836800000)
    expect(ONE_DAY).toBe(86400000)

    expect(asLocaleDate(START_DATE)).toBe("Jan 1, 2020")
    expect(asDate(START_DATE)).toBe("2020-01-01")
    expect(inputToZulu("2020-01-01")).toBe(START_DATE)
    expect(asZulu(2020, 1, 1)).toBe(START_DATE)

    expect(addDay(START_DATE)).toBe(START_DATE + ONE_DAY)
    expect(addDay(START_DATE, -1)).toBe(START_DATE - ONE_DAY)
    expect(INFINITY_DATE).toBe("2100-12-31")
    expect(asDate(addMonth(START_DATE))).toBe("2020-02-01")
    expect(asDate(addMonth(START_DATE, 2))).toBe("2020-03-01")
    expect(asDecimal(1.234)).toBe("1.23")
    expect(round2(1.234)).toBe(1.23)
    expect(today()).toBe(asDate(Date.now()))
  })
})

// define a vitest test suite
describe("freight-store", () => {
  beforeAll(async () => {
    await deleteAllRows()
  })

  // define a test
  it("getRates", async () => {
    // call the function
    const data = await services.getRates(0, 1)
    // check the result
    expect(data.length, "no data").toBe(0)
  })

  it("more", async () => {
    const data = await services.more(0, 1)
    expect(data.length, "no data").toBe(0)
  })

  it("insertRate", async () => {
    const response = await services.insertRate({
      pk: 0,
      start_date: START_DATE,
      end_date: 0,
      offload_rate: 0,
      port1_rate: 0,
      port2_rate: 0,
    })
    expect(response.status).toBe(200)
    const data = (await response.json()) as DiffGram
    expect(data.inserts.length, "inserts").toBe(1)
    expect(data.updates.length, "updates").toBe(0)
    expect(data.deletes.length, "deletes").toBe(0)

    expect(data.inserts[0], "primary key").toBe(1)
  })

  it("updateRate", async () => {
    /*
    we are updating the primary key so really this is a delete and an insert
    but that is a bad UX so we need to a primary key on the server
    */
    const response = await services.updateRate(1, {
      pk: 0,
      start_date: START_DATE + ONE_DAY,
      end_date: 0,
      offload_rate: 0,
      port1_rate: 0,
      port2_rate: 0,
    })
    expect(response.status, "status").toBe(200)
    const data = (await response.json()) as DiffGram
    expect(data.inserts.length, "inserts").toBe(0)
    expect(data.updates.length, "updates").toBe(1)
    expect(data.deletes.length, "deletes").toBe(1)
    expect(data.updates[0]).toBe(1)
  })

  it("deleteRate", async () => {
    const response = await services.deleteRate(1)
    expect(response.status).toBe(200)
    const data = (await response.json()) as DiffGram
    expect(data.inserts.length, "inserts").toBe(0)
    expect(data.updates.length, "updates").toBe(0)
    expect(data.deletes.length, "deletes").toBe(1)
  })
})

describe("diffgram tests", () => {
  beforeAll(async () => {
    await deleteAllRows()
    const doit = async (key: number) => {
      const response = await services.insertRate({
        pk: 0,
        start_date: START_DATE + key * ONE_DAY,
        end_date: 0,
        offload_rate: 0,
        port1_rate: 0,
        port2_rate: 0,
      })
      expect(response.status).toBe(200)
      const data = (await response.json()) as DiffGram
      return data
    }

    let data = await doit(10)
    expect(data.inserts.length, "inserts").toBe(1)
    expect(data.updates.length, "updates").toBe(0)
    expect(data.deletes.length, "deletes").toBe(0)
    expect(data.inserts[0], "inserts.0").toBe(1)

    data = await doit(20)
    expect(data.inserts.length, "inserts").toBe(1)
    expect(data.updates.length, "updates").toBe(1)
    expect(data.deletes.length, "deletes").toBe(0)
    expect(data.inserts[0], "inserts.0").toBe(2)
    expect(data.updates[0], "update.0").toBe(1)
  })

  it("inserts between day 10 and day 20", async () => {
    const response = await services.insertRate({
      pk: 0,
      start_date: START_DATE + 15 * ONE_DAY,
      end_date: 0,
      offload_rate: 0,
      port1_rate: 0,
      port2_rate: 0,
    })
    expect(response.status).toBe(200)
    const data = (await response.json()) as DiffGram
    expect(data.inserts.length, "inserts").toBe(1)
    expect(data.updates.length, "updates").toBe(1)
    expect(data.deletes.length, "deletes").toBe(0)
    expect(data.inserts[0], "inserts.0").toBe(3)
    expect(data.updates[0], "updates.0").toBe(1)
  })

  it("inserts after day 20", async () => {
    const response = await services.insertRate({
      pk: 0,
      start_date: START_DATE + 25 * ONE_DAY,
      end_date: 0,
      offload_rate: 0,
      port1_rate: 0,
      port2_rate: 0,
    })
    expect(response.status).toBe(200)
    const data = (await response.json()) as DiffGram
    expect(data.inserts.length, "inserts").toBe(1)
    expect(data.updates.length, "updates").toBe(1)
    expect(data.deletes.length, "deletes").toBe(0)
    expect(data.inserts[0], "inserts.0").toBe(4)
    expect(data.updates[0], "updates.0").toBe(2)
  })
})

it("inserts before day 10", async () => {
  const response = await services.insertRate({
    pk: 0,
    start_date: START_DATE + 5 * ONE_DAY,
    end_date: 0,
    offload_rate: 0,
    port1_rate: 0,
    port2_rate: 0,
  })
  expect(response.status).toBe(200)
  const data = (await response.json()) as DiffGram
  expect(data.inserts.length, "inserts").toBe(1)
  expect(data.updates.length, "updates").toBe(0)
  expect(data.deletes.length, "deletes").toBe(0)
  expect(data.inserts[0], "inserts.0").toBe(5)
})

async function deleteAllRows() {
  const rates = await services.more(0, 100)

  for (let i = 0; i < rates.length; i++) {
    const rate = rates[i]
    console.log("deleting", rate.pk)
    const response = await services.deleteRate(rate.pk)
    expect(response.status).toBe(200)
    const data = (await response.json()) as DiffGram
    expect(data.inserts.length, "inserts").toBe(0)
    expect(data.deletes.length, "deletes").toBe(1)
  }
}
