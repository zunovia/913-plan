import useSWR from 'swr'
import type { Vessel } from '@/types/vessel'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useVessels() {
  const { data, error, isLoading } = useSWR<{ data: Vessel[]; count: number }>(
    '/api/transport/vessels',
    fetcher,
    { refreshInterval: 300_000 },
  )

  return {
    vessels: data?.data ?? [],
    count: data?.count ?? 0,
    isLoading,
    isError: !!error,
  }
}
