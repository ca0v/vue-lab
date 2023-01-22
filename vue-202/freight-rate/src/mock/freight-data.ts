import type { FreightRate } from "../@types/FreightRate"
import {
  addDay,
  addMonth,
  asZulu,
  INFINITY_DATE,
  inputToZulu,
  round2,
} from "../lib/fun"

export const samplePorts = ["LB", "NY"]

export function createSamplePortRate(port: string) {
  return { port, rate: round2(1000 + Math.random() * 100) }
}

// inject sample data for the last 12 months
export function injectSampleRates(before: number) {
  const sampleRateHistoryData: Array<FreightRate> = []
  const offload_rate = round2(1000 + Math.random() * 100)
  const port_rates = samplePorts.map(createSamplePortRate)

  for (let i = 1; i <= 12; i++) {
    const start_date = addMonth(before, -i)
    const end_date = addDay(addMonth(before, -i), -1)
    sampleRateHistoryData.push({
      start_date,
      end_date,
      port_rates,
      offload_rate,
    })
  }

  return sampleRateHistoryData
}
