'use client'

import type { MouseEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useMediaFrame } from '@/components/map/MediaFrame'
import { useNewsFeed } from '@/hooks/useNewsFeed'
import { useSettingsStore } from '@/stores/settingsStore'

export function NewsTicker() {
  const { news } = useNewsFeed()
  const { showTicker, tickerSpeed } = useSettingsStore()
  const openMedia = useMediaFrame((s) => s.open)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (!showTicker || news.length === 0) return

    const interval = setInterval(() => {
      setOffset((prev) => {
        if (scrollRef.current) {
          const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth
          if (prev >= maxScroll) return 0
        }
        return prev + 1
      })
    }, 100 - tickerSpeed)

    return () => clearInterval(interval)
  }, [showTicker, tickerSpeed, news.length])

  const handleClick = (e: MouseEvent, link: string, title: string) => {
    if (e.ctrlKey || e.metaKey) return
    e.preventDefault()
    openMedia(link, title)
  }

  if (!showTicker || news.length === 0) return null

  return (
    <div className="h-8 bg-gray-900/95 border-t border-gray-700/50 flex items-center overflow-hidden">
      <span className="px-2 text-[10px] font-bold text-red-400 bg-red-900/30 h-full flex items-center shrink-0">
        速報
      </span>
      <div ref={scrollRef} className="flex-1 overflow-hidden relative">
        <div
          className="flex items-center gap-8 whitespace-nowrap absolute"
          style={{ transform: `translateX(-${offset}px)` }}
        >
          {news.slice(0, 20).map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleClick(e, item.link, item.title)}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              <span className="text-gray-600 mr-1">[{item.source}]</span>
              {item.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
