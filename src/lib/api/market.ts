import type { ForexRate, MarketData, MarketIndex } from '@/types/market'

const DASHBOARD_API = 'https://dashboard-olive-omega.vercel.app/api/data'

// Category mapping for display grouping
const FOREX_SYMBOLS = new Set(['JPY=X', 'EURJPY=X', 'GBPJPY=X'])

const FOREX_PAIR_MAP: Record<string, { from: string; to: string }> = {
  'JPY=X': { from: 'USD', to: 'JPY' },
  'EURJPY=X': { from: 'EUR', to: 'JPY' },
  'GBPJPY=X': { from: 'GBP', to: 'JPY' },
}

interface DashboardMarketItem {
  symbol: string
  display_name: string
  category: string
  date: string
  open: number | null
  high: number | null
  low: number | null
  close: number
  prev_close: number | null
  change_pct: number | null
  volume: number | null
}

export async function fetchMarketData(): Promise<MarketData> {
  const indices: MarketIndex[] = []
  const forex: ForexRate[] = []

  try {
    const res = await fetch(DASHBOARD_API, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      console.error('Dashboard API returned', res.status)
      return { indices, forex, updatedAt: new Date().toISOString() }
    }

    const json = await res.json()
    const items: DashboardMarketItem[] = json.market_data ?? []

    for (const item of items) {
      if (FOREX_SYMBOLS.has(item.symbol)) {
        const pair = FOREX_PAIR_MAP[item.symbol]
        if (pair) {
          forex.push({
            from: pair.from,
            to: pair.to,
            rate: item.close,
            date: item.date,
          })
        }
      } else {
        const change = item.prev_close != null ? item.close - item.prev_close : 0
        indices.push({
          symbol: item.symbol,
          name: item.display_name,
          price: item.close,
          change,
          changePercent: item.change_pct ?? 0,
          updatedAt: item.date,
        })
      }
    }
  } catch (error) {
    console.error('Failed to fetch from dashboard API:', error)
  }

  return {
    indices,
    forex,
    updatedAt: new Date().toISOString(),
  }
}
