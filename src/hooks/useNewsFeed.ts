import useSWR from 'swr'
import type { NewsItem } from '@/types/news'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useNewsFeed() {
  const { data, error, isLoading, mutate } = useSWR<{ data: NewsItem[] }>(
    '/api/news/feed',
    fetcher,
    { refreshInterval: 300_000 }
  )

  return {
    news: data?.data ?? [],
    isLoading,
    isError: !!error,
    refresh: mutate,
  }
}

export function useNewsSummary() {
  const { data, error, isLoading } = useSWR<{
    data: { summary: string; articleCount: number; generatedAt: string } | null
  }>('/api/news/summarize', fetcher, { refreshInterval: 3600_000 })

  return {
    summary: data?.data ?? null,
    isLoading,
    isError: !!error,
  }
}
