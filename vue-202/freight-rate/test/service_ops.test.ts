import { Api } from "../src/data/freight-store"
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import type { DiffGram } from "../src/@types/FreightRate"

const services = new Api("http://localhost:5000/aiq/api/")

// ticks as of 2020-01-01
// { START_DATE: 1577854800000, ONE_DAY: 86400000 }
const START_DATE = new Date(2020, 0, 1).getTime()
const ONE_DAY = 24 * 60 * 60 * 1000

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
    await Promise.all(
      [20].map(async (key, i) => {
        const response = await services.insertRate({
          pk: 0,
          start_date: START_DATE + key * ONE_DAY,
          end_date: key + 2,
          offload_rate: 0,
          port1_rate: 0,
          port2_rate: 0,
        })
        expect(response.status).toBe(200)
        const data = (await response.json()) as DiffGram
        expect(data.inserts.length).toBe(1)
        expect(data.updates.length).toBe(0)
        expect(data.deletes.length).toBe(0)
        expect(data.inserts[0], "inserts.0").toBe(i + 1)

        return data
      })
    )
  })

  it("inserts", async () => {
    const response = await services.insertRate({
      pk: 0,
      start_date: START_DATE + 1,
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
    expect(data.inserts[0], "inserts.0").toBe(2)
  })
})

async function deleteAllRows() {
  const response = await services.more(0, 100)
  return await Promise.all(
    response.map(async (rate) => {
      console.log("deleting", rate.pk)
      const response = await services.deleteRate(rate.pk)
      expect(response.status).toBe(200)
      const data = (await response.json()) as DiffGram
      expect(data.inserts.length, "inserts").toBe(0)
      expect(data.deletes.length, "deletes").toBe(1)
      return data
    })
  )
}
