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
export function injectSampleRates(start_date: number) {
  const sampleRateHistoryData: Array<FreightRate> = []
  const offload_rate = round2(1000 + Math.random() * 100)
  let end_date = addDay(addMonth(start_date, -1), -1)

  for (let i = 1; i <= 12; i++) {
    const port_rates = samplePorts.map(createSamplePortRate)
    sampleRateHistoryData.push({
      start_date,
      end_date,
      port_rates,
      offload_rate,
    })
    end_date = addDay(start_date, -1)
    start_date = addMonth(start_date, -1)
  }

  return sampleRateHistoryData
}
