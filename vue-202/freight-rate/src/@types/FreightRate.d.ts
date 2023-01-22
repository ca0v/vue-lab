export type PortRate = {
  port: string
  rate: number
}

export type FreightRate = {
  _hiliteHack?: Set<HiliteFields>
  start_date: number
  end_date: number
  offload_rate: number
  port_rates: Array<PortRate>
}
