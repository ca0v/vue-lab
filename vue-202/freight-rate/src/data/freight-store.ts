import type { DiffGram, FreightRate } from "../@types/FreightRate"
import { asDate } from "../lib/fun"

class Api {
  constructor(private API_URL: string) {}

  // to build a collection of freight rates is called a "freight store"
  async more(start_date: number, count = 12) {
    if (!start_date) {
      // get the latest rates
      const response = await fetch(`${this.API_URL}rates/${count}`)
      const data = (await response.json()) as Array<FreightRate>
      return data
    }

    // get next 12 rates
    const data = await this.getRates(start_date, count)
    return data
  }

  async getRate(pk: number) {
    // convert the dates to strings
    const url = `${this.API_URL}rate/${pk}`
    const response = await fetch(url)
    const data = (await response.json()) as FreightRate
    return data
  }

  async getRates(start_date: number, count = 12) {
    // convert the dates to strings
    const url = `${this.API_URL}rates/${asDate(start_date)}/${count}`
    const response = await fetch(url)
    const data = (await response.json()) as Array<FreightRate>
    return data
  }

  async updateRate(primaryKey: number, rate: FreightRate) {
    const url = `${this.API_URL}rates/${primaryKey}`

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rate),
    })
    if (!response.ok) {
      switch (response.status) {
        case 404:
          throw "rate item not found"
        default:
          throw (
            response.statusText ||
            "failed to update the freight rate for an unknown reason"
          )
      }
    }
    const data = (await response.json()) as DiffGram
    return data
  }

  async insertRate(rate: FreightRate) {
    const url = `${this.API_URL}rates`
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rate),
    })
    if (!response.ok) {
      switch (response.status) {
        case 409:
          throw "duplicate rate item"
        default:
          console.log(response.status, response.statusText)
          throw (
            response.statusText ||
            "failed to insert the freight rate for an unknown reason"
          )
      }
    }
    const data = (await response.json()) as DiffGram
    return data
  }

  async deleteRate(pk: number) {
    const url = `${this.API_URL}rates/${pk}`
    const response = await fetch(url, {
      method: "DELETE",
    })
    if (!response.ok) {
      switch (response.status) {
        case 404:
          throw "rate item not found"
        default:
          throw (
            response.statusText ||
            "failed to delete the freight rate for an unknown reason"
          )
      }
    }
    const data = (await response.json()) as DiffGram
    return data
  }
}

export { Api }
