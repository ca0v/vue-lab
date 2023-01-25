import type { FreightRate } from "../@types/FreightRate"
import { addMonth, asDate, asZulu, inputToZulu, ONE_DAY } from "../lib/fun"

const API_URL = localStorage.getItem("API_URL") || "/aiq/api/"
localStorage.setItem("API_URL", API_URL)

// to build a collection of freight rates is called a "freight store"
export async function more(start_date = 0) {
  console.log("more", start_date)
  if (!start_date) {
    // get the latest rates
    const response = await fetch(`${API_URL}rates/12`)
    const data = (await response.json()) as Array<FreightRate>
    if (data.length) {
      start_date = data[data.length - 1].start_date
    }
    return data
  }

  // get next 12 rates
  const data = await getRates(start_date - ONE_DAY, 12)
  if (data.length) {
    start_date = data[data.length - 1].start_date
  }
  return data
}

// get the rates from the services at http://localhost:3003/api/rates/2022-01-01/12
export async function getRates(start_date: number, count = 12) {
  console.log("getRates", start_date, count)
  // convert the dates to strings
  const url = `${API_URL}rates/${asDate(start_date)}/${count}`
  const response = await fetch(url)
  console.log("getRates", response)
  const data = (await response.json()) as Array<FreightRate>
  console.log("getRates", data)
  return data
}

export async function updateRate(primaryKey: number, rate: FreightRate) {
  const url = `${API_URL}rates/${primaryKey}`

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rate),
  })
  console.log("updateRate", response)
  if (!response.ok) {
    throw new Error("updateRate failed")
  }
  return response
}

export async function insertRate(rate: FreightRate) {
  console.log("insertRate", rate)
  const url = `${API_URL}rates`
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rate),
  })
  console.log("insertRate", response)
  if (!response.ok) {
    throw new Error("insertRate failed")
  }
  return response
}

export async function deleteRate(start_date: number) {
  const url = `${API_URL}rates/${start_date}`
  const response = await fetch(url, {
    method: "DELETE",
  })
  console.log("deleteRate", response)
  if (!response.ok) {
    throw new Error("deleteRate failed")
  }
  return response
}
