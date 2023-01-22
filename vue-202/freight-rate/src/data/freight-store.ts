import { writable } from "svelte/store"
import { addMonth, asZulu } from "../lib/fun"
import { injectSampleRates } from "../mock/freight-data"

// a collection of freight rates is called a "freight store"

export function more(start_date = 0) {
  if (!start_date) {
    // generate for today and go backward 12 months
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = 1
    start_date = asZulu(year, month, day)
  }
  const data = injectSampleRates(start_date)
  // get the oldest start_date in the store
  if (data.length) {
    start_date = data[data.length - 1].start_date
    start_date = addMonth(start_date, -1)
  }
  return data
}
