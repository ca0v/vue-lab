import type { FreightRate } from "../@types/FreightRate"
import { addDay, asZulu, INFINITY_DATE, inputToZulu, round2 } from "../lib/fun"

export const samplePorts = ["LB", "NY"]

export function createSamplePortRate(port: string) {
  return { port, rate: round2(1000 + Math.random() * 100) }
}

// inject sample data for the last 12 months
export function injectSampleRates() {
  const sampleRateHistoryData: Array<FreightRate> = []
  // generate for today and go backward 12 months
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = 1
  const offload_rate = round2(1000 + Math.random() * 100)
  let start_date = asZulu(year, month, day)
  let end_date = inputToZulu(INFINITY_DATE)

  for (let i = 1; i <= 12; i++) {
    const port_rates = samplePorts.map(createSamplePortRate)
    sampleRateHistoryData.push({
      start_date,
      end_date,
      port_rates,
      offload_rate,
    })
    end_date = addDay(start_date, -1)
    start_date = asZulu(year, month - i, day)
  }

  return sampleRateHistoryData
}
