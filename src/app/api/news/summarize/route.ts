import { NextResponse } from 'next/server'
import { cachedFetch } from '@/lib/cache/redis'
import { summarizeNews } from '@/lib/api/groq'
import { fetchRSSFeed, getAllFeedConfigs } from '@/lib/api/rss'
import { sortNewsByDate, deduplicateNews } from '@/lib/transform/news'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const summary = await cachedFetch('news:summary', 3600, async () => {
      const configs = getAllFeedConfigs()
      const results = await Promise.all(configs.map((c) => fetchRSSFeed(c)))
      const all = sortNewsByDate(deduplicateNews(results.flat())).slice(0, 20)
      const text = await summarizeNews(all)
      return {
        summary: text,
        articleCount: all.length,
        generatedAt: new Date().toISOString(),
      }
    })

    return NextResponse.json({ data: summary })
  } catch (error) {
    console.error('Summarize error:', error)
    return NextResponse.json({ data: null, error: 'Failed to summarize' }, { status: 500 })
  }
}
