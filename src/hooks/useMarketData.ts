import useSWR from 'swr'
import type { MarketData } from '@/types/market'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useMarketData() {
  const { data, error, isLoading } = useSWR<{ data: MarketData | null }>(
    '/api/markets/indices',
    fetcher,
    { refreshInterval: 60_000 },
  )

  return {
    marketData: data?.data ?? null,
    isLoading,
    isError: !!error,
  }
}
