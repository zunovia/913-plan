import type { NewsItem } from '@/types/news'

interface RssFeedConfig {
  url: string
  source: string
  language: 'ja' | 'en'
}

const RSS_FEEDS: RssFeedConfig[] = [
  { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', source: 'NHK World', language: 'en' },
  { url: 'https://www.japantimes.co.jp/feed/', source: 'Japan Times', language: 'en' },
  { url: 'https://english.kyodonews.net/rss/all.xml', source: 'Kyodo News', language: 'en' },
  { url: 'https://www.nhk.or.jp/rss/news/cat0.xml', source: 'NHK', language: 'ja' },
  { url: 'https://www.asahi.com/rss/asahi/newsheadlines.rdf', source: '朝日新聞', language: 'ja' },
]

// YouTube news channels (Atom feeds)
const YOUTUBE_FEEDS: RssFeedConfig[] = [
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCuTAXTexrhetbOe3zgskJBQ', source: 'NHK NEWS (YT)', language: 'ja' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCGCZAYq5Xxojl_tSXcVJhiQ', source: 'ANN NEWS (YT)', language: 'ja' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCuTAXTexrhetbOe3zgskJBQ', source: '日テレNEWS (YT)', language: 'ja' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6AG81pAkf6Lbi_1VC5NmPA', source: 'TBS NEWS (YT)', language: 'ja' },
]

export function getAllFeedConfigs(): RssFeedConfig[] {
  return [...RSS_FEEDS, ...YOUTUBE_FEEDS]
}

export async function fetchRSSFeed(config: RssFeedConfig): Promise<NewsItem[]> {
  try {
    const res = await fetch(config.url, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const text = await res.text()
    return parseRSSXML(text, config)
  } catch {
    return []
  }
}

function parseRSSXML(xml: string, config: RssFeedConfig): NewsItem[] {
  const isYoutube = config.url.includes('youtube.com')
  const isAtom = xml.includes('<feed') && xml.includes('<entry>')
  const items: NewsItem[] = []

  if (isAtom) {
    // YouTube Atom feed format
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
    let match: RegExpExecArray | null
    while ((match = entryRegex.exec(xml)) !== null) {
      const content = match[1]
      const title = extractTag(content, 'title')
      const videoId = extractTag(content, 'yt:videoId')
      const published = extractTag(content, 'published')
      const link = videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined

      if (title && link) {
        items.push({
          id: `${config.source}-${videoId ?? Date.now()}`,
          title: decodeHTMLEntities(title),
          link,
          pubDate: published || new Date().toISOString(),
          source: config.source,
          sourceType: 'youtube',
          language: config.language,
        })
      }
    }
  } else {
    // Standard RSS format
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match: RegExpExecArray | null
    while ((match = itemRegex.exec(xml)) !== null) {
      const content = match[1]
      const title = extractTag(content, 'title')
      const link = extractTag(content, 'link')
      const pubDate = extractTag(content, 'pubDate')

      if (title && link) {
        items.push({
          id: `${config.source}-${Buffer.from(link).toString('base64').slice(0, 16)}`,
          title: decodeHTMLEntities(title),
          link,
          pubDate: pubDate || new Date().toISOString(),
          source: config.source,
          sourceType: isYoutube ? 'youtube' : 'rss',
          language: config.language,
        })
      }
    }
  }

  return items
}

function extractTag(xml: string, tag: string): string | undefined {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`)
  const cdataMatch = cdataRegex.exec(xml)
  if (cdataMatch) return cdataMatch[1].trim()

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
  const match = regex.exec(xml)
  return match?.[1]?.trim()
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}
