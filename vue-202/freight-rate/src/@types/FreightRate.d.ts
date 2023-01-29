export type FreightRate = {
  _hiliteHack?: Set<HiliteFields>
  pk: number
  start_date: number
  end_date: number
  offload_rate: number
  port1_rate: number
  port2_rate: number
  average?: number
}

export type DiffGram = {
  inserts: number[]
  updates: number[]
  deletes: number[]
}
