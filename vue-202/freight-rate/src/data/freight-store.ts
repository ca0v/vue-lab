import type { FreightRate } from "../@types/FreightRate"
import { addMonth, asDate, asZulu, inputToZulu } from "../lib/fun"
import { injectSampleRates } from "../mock/freight-data"

// to build a collection of freight rates is called a "freight store"
export async function more(start_date = 0) {
  console.log("more", start_date)
  if (!start_date) {
    // generate for today and go backward 12 months
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = 1
    start_date = asZulu(year, month, day)
  }
  const data = await getRates(start_date, addMonth(start_date, 12))
  console.log("more", data.length, "records")
  console.log("data", JSON.stringify(data, null, 2))
  // get the oldest start_date in the store
  if (data.length) {
    start_date = data[data.length - 1].start_date
    start_date = addMonth(start_date, -1)
  }
  return data
}

// get the rates from the services at http://localhost:3003/api/rates/2022-01-01/2023-01-01
export async function getRates(start_date: number, end_date: number) {
  // convert the dates to strings
  const url = `http://localhost:3003/api/rates/${asDate(start_date)}/${asDate(
    end_date
  )}`
  const response = await fetch(url)
  const data = (await response.json()) as Array<FreightRate>
  // convert the strings to numbers
  data.forEach((rate) => {
    rate.start_date = inputToZulu(<string>(<unknown>rate.start_date))
    rate.end_date = inputToZulu(<string>(<unknown>rate.end_date))
  })
  return data
}
