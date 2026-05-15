import useSWR from 'swr'
import type { CyberThreat } from '@/types/cyber'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useCyberThreats() {
  const { data, error, isLoading } = useSWR<{ data: CyberThreat[] }>(
    '/api/cyber/threats',
    fetcher,
    { refreshInterval: 600_000 }
  )

  return {
    threats: data?.data ?? [],
    isLoading,
    isError: !!error,
  }
}
