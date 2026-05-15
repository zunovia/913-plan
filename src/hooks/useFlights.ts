import useSWR from 'swr'
import type { Flight } from '@/types/flight'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useFlights() {
  const { data, error, isLoading } = useSWR<{ data: Flight[]; count: number }>(
    '/api/transport/flights',
    fetcher,
    { refreshInterval: 15_000 }
  )

  return {
    flights: data?.data ?? [],
    count: data?.count ?? 0,
    isLoading,
    isError: !!error,
  }
}
