export const ONE_DAY = 24 * 60 * 60 * 1000
export const INFINITY_DATE = "2100-12-31"

export function round2(value: number): number {
  // round a number to 2 decimal places
  return Math.round(value * 100) / 100
}

export function asDecimal(value: number): string {
  // return a number as a string with 2 decimal places
  return value.toFixed(2)
}

export function addDay(start_date: number, days = 1): number {
  // return the day before the start_date
  return start_date + days * ONE_DAY
}

export function asZulu(year: number, month: number, day: number): number {
    // return a date as a zulu time
    return Date.UTC(year, month - 1, day)
  }
  
  export function inputToZulu(date: string): number {
  // convert a date string in yyyy-mm-dd format to zulu time
  const [year, month, day] = date.split("-").map((s) => parseInt(s))
  return asZulu(year, month, day)
}

export function asDate(zulu: number): string {
  // convert a zulu time to a date string in yyyy-mm-dd format
  return new Date(zulu).toISOString().slice(0, 10)
}

export function today() {
  return asDate(Date.now())
}
