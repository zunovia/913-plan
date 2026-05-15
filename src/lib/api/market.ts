import type { MarketData, MarketIndex, ForexRate } from '@/types/market'

const FRANKFURTER_API = 'https://api.frankfurter.app'

export async function fetchForexRates(): Promise<ForexRate[]> {
  try {
    const res = await fetch(`${FRANKFURTER_API}/latest?from=USD&to=JPY,EUR,GBP,CNY`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Object.entries(data.rates as Record<string, number>).map(([to, rate]) => ({
      from: 'USD',
      to,
      rate,
      date: data.date,
    }))
  } catch {
    return []
  }
}

export async function fetchMarketData(): Promise<MarketData> {
  // Market data from yahoo-finance2 would be server-side only
  // For now, provide a structure with forex data
  const forex = await fetchForexRates()

  const indices: MarketIndex[] = [
    {
      symbol: '^N225',
      name: '日経平均',
      price: 0,
      change: 0,
      changePercent: 0,
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: '^TOPX',
      name: 'TOPIX',
      price: 0,
      change: 0,
      changePercent: 0,
      updatedAt: new Date().toISOString(),
    },
  ]

  return {
    indices,
    forex,
    updatedAt: new Date().toISOString(),
  }
}
