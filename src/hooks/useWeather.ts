import useSWR from 'swr'
import type { WeatherArea } from '@/types/weather'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useWeather() {
  const { data, error, isLoading } = useSWR<{ data: WeatherArea[] }>(
    '/api/disasters/weather',
    fetcher,
    { refreshInterval: 600_000 },
  )

  return {
    weather: data?.data ?? [],
    isLoading,
    isError: !!error,
  }
}
