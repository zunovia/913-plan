import { NextResponse } from 'next/server'
import { cachedFetch } from '@/lib/cache/redis'
import type { CyberThreat } from '@/types/cyber'

export const runtime = 'nodejs'

async function fetchJPCERT(): Promise<CyberThreat[]> {
  try {
    const res = await fetch('https://www.jpcert.or.jp/rss/jpcert-all.rdf', {
      next: { revalidate: 600 },
    })
    if (!res.ok) return []
    const text = await res.text()

    const items: CyberThreat[] = []
    const itemRegex = /<item[\s\S]*?<\/item>/g
    let match: RegExpExecArray | null

    while ((match = itemRegex.exec(text)) !== null) {
      const content = match[0]
      const title = content.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim()
      const link = content.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim()
      const date = content.match(/<dc:date>([\s\S]*?)<\/dc:date>/)?.[1]?.trim()
      const desc = content.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.trim()

      if (title && link) {
        items.push({
          id: `jpcert-${Buffer.from(link).toString('base64').slice(0, 12)}`,
          title,
          description: desc ?? '',
          source: 'jpcert',
          severity: 'medium',
          publishedAt: date ?? new Date().toISOString(),
          link,
        })
      }
    }

    return items
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const threats = await cachedFetch('cyber:threats', 600, async () => {
      const jpcert = await fetchJPCERT()
      return jpcert.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
    })

    return NextResponse.json({ data: threats, updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Cyber threats error:', error)
    return NextResponse.json({ data: [], error: 'Failed to fetch threats' }, { status: 500 })
  }
}
