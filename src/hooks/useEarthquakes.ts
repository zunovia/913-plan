import useSWR from 'swr'
import type { Earthquake } from '@/types/earthquake'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useEarthquakes() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Earthquake[]; updatedAt: string }>(
    '/api/disasters/earthquakes',
    fetcher,
    { refreshInterval: 60_000, revalidateOnFocus: true },
  )

  return {
    earthquakes: data?.data ?? [],
    updatedAt: data?.updatedAt,
    isLoading,
    isError: !!error,
    refresh: mutate,
  }
}
