export interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  updatedAt: string
}

export interface ForexRate {
  from: string
  to: string
  rate: number
  date: string
}

export interface MarketData {
  indices: MarketIndex[]
  forex: ForexRate[]
  updatedAt: string
}
