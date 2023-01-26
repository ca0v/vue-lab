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
const day = (n: number) => START_DATE + n * ONE_DAY

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
    expect(inputToZulu(INFINITY_DATE)).toBe(4133894400000)
    expect(asDate(addMonth(START_DATE, 0))).toBe("2020-01-01")
    expect(asDate(addMonth(START_DATE))).toBe("2020-02-01")
    expect(asDate(addMonth(START_DATE, 2))).toBe("2020-03-01")
    expect(asDate(addMonth(START_DATE, -1))).toBe("2019-12-01")
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
    const data = await services.insertRate({
      pk: 0,
      start_date: day(0),
      end_date: 0,
      offload_rate: 0,
      port1_rate: 0,
      port2_rate: 0,
    })
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
    const data = await services.updateRate(1, {
      pk: 0,
      start_date: day(1),
      end_date: 0,
      offload_rate: 0,
      port1_rate: 0,
      port2_rate: 0,
    })
    expect(data.inserts.length, "inserts").toBe(0)
    expect(data.updates.length, "updates").toBe(1)
    expect(data.deletes.length, "deletes").toBe(0)
    expect(data.updates[0]).toBe(1)
  })

  it("deleteRate", async () => {
    const data = await services.deleteRate(1)
    expect(data.inserts.length, "inserts").toBe(0)
    expect(data.updates.length, "updates").toBe(0)
    expect(data.deletes.length, "deletes").toBe(1)
  })
})

describe("diffgram tests", () => {
  beforeAll(async () => {
    await deleteAllRows()
    const doit = async (key: number) => {
      const data = await services.insertRate({
        pk: 0,
        start_date: day(key),
        end_date: 0,
        offload_rate: 0,
        port1_rate: 0,
        port2_rate: 0,
      })
      return data
    }

    const day10 = await doit(10)
    expect(day10.inserts.length, "inserts").toBe(1)
    expect(day10.updates.length, "updates").toBe(0)
    expect(day10.deletes.length, "deletes").toBe(0)
    expect(day10.inserts[0], "inserts.0").toBe(1)

    const day20 = await doit(20)
    expect(day20.inserts.length, "inserts").toBe(1)
    expect(day20.updates.length, "updates").toBe(1)
    expect(day20.deletes.length, "deletes").toBe(0)
    expect(day20.inserts[0], "inserts.0").toBe(2)
    expect(day20.updates[0], "update.0").toBe(1)
  })

  it("confirm day 10 date range", async () => {
    const day10 = await services.getRate(1)
    expect(day10.start_date, "start_date").toBe(day(10))
    expect(day10.end_date, "end_date").toBe(day(19))
  })

  it("inserts between day 10 and day 20", async () => {
    const day15 = await services.insertRate({
      pk: 0,
      start_date: day(15),
      end_date: 0,
      offload_rate: 0,
      port1_rate: 0,
      port2_rate: 0,
    })
    expect(day15.inserts.length, "inserts").toBe(1)
    expect(day15.updates.length, "updates").toBe(1)
    expect(day15.deletes.length, "deletes").toBe(0)
    expect(day15.inserts[0], "inserts.0").toBe(3)
    expect(day15.updates[0], "updates.0").toBe(1)

    const day10 = await services.getRate(1)
    expect(day10.end_date, "end_date").toBe(day(14))

    const day15_ = await services.getRate(3)
    expect(day15_.end_date, "end_date").toBe(day(19))
  })

  it("inserts after day 20", async () => {
    const data = await services.insertRate({
      pk: 0,
      start_date: day(25),
      end_date: 0,
      offload_rate: 0,
      port1_rate: 0,
      port2_rate: 0,
    })
    expect(data.inserts.length, "inserts").toBe(1)
    expect(data.updates.length, "updates").toBe(1)
    expect(data.deletes.length, "deletes").toBe(0)
    expect(data.inserts[0], "inserts.0").toBe(4)
    expect(data.updates[0], "updates.0").toBe(2)

    const day20 = await services.getRate(2)
    expect(day20.end_date, "end_date").toBe(day(24))
  })
})

it("inserts before day 10", async () => {
  const day5 = await services.insertRate({
    pk: 0,
    start_date: day(5),
    end_date: 0,
    offload_rate: 0,
    port1_rate: 0,
    port2_rate: 0,
  })
  expect(day5.inserts.length, "inserts").toBe(1)
  expect(day5.updates.length, "updates").toBe(0)
  expect(day5.deletes.length, "deletes").toBe(0)
  expect(day5.inserts[0], "inserts.0").toBe(5)

  const day5_ = await services.getRate(5)
  expect(day5_.end_date, "end_date").toBe(day(9))
})

it("delete day 5", async () => {
  const data = await services.deleteRate(5)
  expect(data.inserts.length, "inserts").toBe(0)
  expect(data.updates.length, "updates").toBe(1)
  expect(data.deletes.length, "deletes").toBe(1)
  expect(data.updates[0], "updates.0").toBe(1)
  expect(data.deletes[0], "deletes.0").toBe(5)

  // this is an interesting case because day 10 becomes day 5
  // so it is more like we deleted day 10 and updated day 5
  const day10 = await services.getRate(1)
  expect(day10.start_date, "start_date").toBe(day(5))
})

it("delete day 15", async () => {
  const data = await services.deleteRate(3)
  expect(data.inserts.length, "inserts").toBe(0)
  expect(data.updates.length, "updates").toBe(1)
  expect(data.deletes.length, "deletes").toBe(1)
  expect(data.updates[0], "updates.0").toBe(2)
  expect(data.deletes[0], "deletes.0").toBe(3)

  // this is an interesting case because day 20 becomes day 15
  const day20 = await services.getRate(2)
  expect(day20.start_date, "start_date").toBe(day(15))
})

it("delete day 25", async () => {
  const data = await services.deleteRate(4)
  expect(data.inserts.length, "inserts").toBe(0)
  expect(data.updates.length, "updates").toBe(1)
  expect(data.deletes.length, "deletes").toBe(1)
  expect(data.updates[0], "updates.0").toBe(2)
  expect(data.deletes[0], "deletes.0").toBe(4)

  const day20 = await services.getRate(2)
  expect(asDate(day20.end_date), "end_date").toBe(INFINITY_DATE)
})

it("restore day 20 and day 10", async () => {
  const day10 = await services.getRate(1)
  expect(day10.start_date, "start_date").toBe(day(5))
  expect(day10.end_date, "end_date").toBe(day(14))

  const day20 = await services.getRate(2)
  expect(day20.start_date, "start_date").toBe(day(15))
  expect(day20.end_date, "end_date").toBe(inputToZulu(INFINITY_DATE))

  // restore the start date of day 20 (which is now day 5)
  day20.start_date = day(20)
  const diffgram = await services.updateRate(day20.pk, day20)
  const day20_ = await services.getRate(2)
  expect(day20_.start_date, "start_date").toBe(day(20))

  expect(diffgram.updates.length, "updates").toBe(2)
  expect(diffgram.updates[0], "updates.0").toBe(1)
  expect(diffgram.updates[1], "updates.1").toBe(2)

  const day10_ = await services.getRate(1)
  expect(day10_.end_date, "end_date").toBe(day(19))

  // restore day 10 (which is now day 5)
  day10.start_date = day(10)
  await services.updateRate(day10.pk, day10)
  const day10__ = await services.getRate(1)
  expect(day10__.start_date, "start_date").toBe(day(10))
})

it("inserts and then updates day 15", async () => {
  let diffgram = await services.insertRate({
    pk: 0,
    start_date: day(15),
    end_date: 0,
    offload_rate: 0,
    port1_rate: 0,
    port2_rate: 0,
  })

  expect(diffgram.inserts.length, "inserts").toBe(1)
  expect(diffgram.updates.length, "updates").toBe(1)
  expect(diffgram.deletes.length, "deletes").toBe(0)
  expect(diffgram.inserts[0], "inserts.0").toBe(3)
  expect(diffgram.updates[0], "updates.0").toBe(1)

  const day15 = await services.getRate(3)
  expect(day15.start_date, "start_date").toBe(day(15))
  expect(day15.end_date, "end_date").toBe(day(19))

  day15.start_date = day(10)
  try {
    await services.updateRate(day15.pk, day15)
    throw new Error("should not get here")
  } catch (err) {
    console.log("error", err)
  }

  day15.start_date = day(11)
  diffgram = await services.updateRate(day15.pk, day15)
  expect(diffgram.inserts.length, "inserts").toBe(0)
  expect(diffgram.updates.length, "updates").toBe(2)
  expect(diffgram.deletes.length, "deletes").toBe(0)

  const day15_ = await services.getRate(3)
  expect(day15_.start_date, "start_date").toBe(day(11))
  expect(day15_.end_date, "end_date").toBe(day(19))

  const day10 = await services.getRate(1)
  expect(day10.end_date, "end_date").toBe(day(10))
})

async function deleteAllRows() {
  const rates = await services.more(0, 100)

  for (let i = 0; i < rates.length; i++) {
    const rate = rates[i]
    console.log("deleting", rate.pk)
    const data = await services.deleteRate(rate.pk)
    expect(data.inserts.length, "inserts").toBe(0)
    expect(data.deletes.length, "deletes").toBe(1)
  }
}
