'use client'

import { ExternalLink, Loader2, PlayCircle, Rss, Sparkles } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useMediaFrame } from '@/components/map/MediaFrame'
import { useNewsFeed, useNewsSummary } from '@/hooks/useNewsFeed'

export function NewsFeedPanel() {
  const { news, isLoading } = useNewsFeed()
  const { summary, isLoading: summaryLoading } = useNewsSummary()
  const openMedia = useMediaFrame((s) => s.open)

  const handleClick = (e: MouseEvent, link: string, title: string) => {
    // Ctrl+click or middle-click: open in new tab (default browser behavior)
    if (e.ctrlKey || e.metaKey) return
    e.preventDefault()
    openMedia(link, title)
  }

  return (
    <div className="p-3 space-y-3">
      {/* AI Summary Section */}
      {summary && (
        <div className="bg-blue-900/30 border border-blue-700/30 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={14} className="text-blue-400" />
            <span className="text-xs font-medium text-blue-400">AI要約</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
            {summary.summary}
          </p>
          <p className="text-[10px] text-gray-500 mt-2">
            {summary.articleCount}件の記事から生成 ·{' '}
            {new Date(summary.generatedAt).toLocaleTimeString('ja-JP')}
          </p>
        </div>
      )}
      {summaryLoading && (
        <div className="flex items-center gap-2 text-xs text-gray-500 p-2">
          <Loader2 size={12} className="animate-spin" />
          AI要約を生成中...
        </div>
      )}

      {/* News List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="space-y-1">
          {news.slice(0, 50).map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleClick(e, item.link, item.title)}
              className="block p-2 rounded hover:bg-gray-800/50 transition-colors group"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-200 leading-snug line-clamp-2 group-hover:text-white">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {item.sourceType === 'youtube' ? (
                      <PlayCircle size={10} className="text-red-400" />
                    ) : (
                      <Rss size={10} className="text-orange-400" />
                    )}
                    <span className="text-[10px] text-gray-500">{item.source}</span>
                    <span className="text-[10px] text-gray-600">{formatTimeAgo(item.pubDate)}</span>
                    <span
                      className={`text-[10px] px-1 rounded ${item.language === 'ja' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}
                    >
                      {item.language.toUpperCase()}
                    </span>
                  </div>
                </div>
                <ExternalLink
                  size={12}
                  className="text-gray-600 group-hover:text-gray-400 mt-0.5 shrink-0"
                />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}時間前`
  const days = Math.floor(hours / 24)
  return `${days}日前`
}
