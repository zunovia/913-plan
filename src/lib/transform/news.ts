import type { NewsItem } from '@/types/news'

export function sortNewsByDate(items: NewsItem[]): NewsItem[] {
  return [...items].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )
}

export function filterNewsByLanguage(
  items: NewsItem[],
  language: 'ja' | 'en' | 'both'
): NewsItem[] {
  if (language === 'both') return items
  return items.filter((item) => item.language === language)
}

export function deduplicateNews(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 50)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
