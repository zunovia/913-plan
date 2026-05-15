export interface NewsItem {
  id: string
  title: string
  link: string
  pubDate: string
  source: string
  sourceType: 'rss' | 'youtube' | 'x'
  category?: string
  summary?: string
  imageUrl?: string
  language: 'ja' | 'en'
}

export interface NewsSummary {
  id: string
  headlines: string[]
  summary: string
  generatedAt: string
  articleCount: number
}
