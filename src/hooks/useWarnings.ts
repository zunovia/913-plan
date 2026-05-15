import useSWR from 'swr'
import type { WeatherWarning } from '@/types/warning'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useWarnings() {
  const { data, error, isLoading, mutate } = useSWR<{
    data: WeatherWarning[]
    updatedAt: string
  }>('/api/disasters/warnings', fetcher, {
    refreshInterval: 300_000, // 5分
    revalidateOnFocus: true,
  })

  return {
    warnings: data?.data ?? [],
    updatedAt: data?.updatedAt,
    isLoading,
    isError: !!error,
    refresh: mutate,
  }
}
