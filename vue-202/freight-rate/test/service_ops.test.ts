import * as services from "../src/data/freight-store"
import { describe, it, expect } from "vitest"

// define a vitest test suite
describe("freight-store", () => {
  // define a test
  it("getRates", async () => {
    // call the function
    const data = await services.getRates(0, 0)
    // check the result
    expect(data.length).toBe(0)
  })

  it("more", async () => {
    const data = await services.more()
    expect(data.length).toBe(0)
  })

  it("insertRate", async () => {
    const data = await services.insertRate({
      start_date: 0,
      end_date: 0,
      offload_rate: 0,
      port1_rate: 0,
      port2_rate: 0,
    })
    expect(data.status).toBe(200)
  })

  it("updateRate", async () => {
    const data = await services.updateRate({
      start_date: 0,
      end_date: 0,
      offload_rate: 0,
      port1_rate: 0,
      port2_rate: 0,
    })
    expect(data.status).toBe(200)
  })

  it("deleteRate", async () => {
    const data = await services.deleteRate(0)
    expect(data.status).toBe(200)
  })
})