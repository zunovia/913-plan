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

    const itemRegex = /<item[\s\S]*?<\/item>/g
    const matches = [...text.matchAll(itemRegex)]

    const items: CyberThreat[] = matches.flatMap((match) => {
      const content = match[0]
      const title = content.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim()
      const link = content.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim()
      const date = content.match(/<dc:date>([\s\S]*?)<\/dc:date>/)?.[1]?.trim()
      const desc = content.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.trim()

      if (title && link) {
        return [
          {
            id: `jpcert-${simpleHash(link)}`,
            title,
            description: desc ?? '',
            source: 'jpcert' as const,
            severity: 'medium' as const,
            publishedAt: date ?? new Date().toISOString(),
            link,
          },
        ]
      }
      return []
    })

    return items
  } catch {
    return []
  }
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return (hash >>> 0).toString(36)
}

export async function GET() {
  try {
    const threats = await cachedFetch('cyber:threats', 600, async () => {
      const jpcert = await fetchJPCERT()
      return jpcert.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
    })

    return NextResponse.json({ data: threats, updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Cyber threats error:', error)
    return NextResponse.json({ data: [], error: 'Failed to fetch threats' }, { status: 500 })
  }
}
