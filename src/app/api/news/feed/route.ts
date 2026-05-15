import { NextResponse } from 'next/server'
import { fetchRSSFeed, getAllFeedConfigs } from '@/lib/api/rss'
import { cachedFetch } from '@/lib/cache/redis'
import { deduplicateNews, sortNewsByDate } from '@/lib/transform/news'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const news = await cachedFetch('news:feed', 300, async () => {
      const configs = getAllFeedConfigs()
      const results = await Promise.all(configs.map((c) => fetchRSSFeed(c)))
      const all = results.flat()
      return sortNewsByDate(deduplicateNews(all))
    })

    return NextResponse.json({ data: news, updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('News feed error:', error)
    return NextResponse.json({ data: [], error: 'Failed to fetch news' }, { status: 500 })
  }
}
