'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, GripHorizontal, Maximize2, Minimize2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { create } from 'zustand'

const MIN_W = 320
const MIN_H = 220
const DEFAULT_W = 420
const DEFAULT_H = 280

interface FrameLayout {
  x: number
  bottomY: number
  w: number
  h: number
}

interface MediaFrameState {
  url: string | null
  externalUrl: string | null
  title: string
  isExpanded: boolean
  layout: FrameLayout
  open: (url: string, title: string, externalUrl?: string) => void
  close: () => void
  toggleExpand: () => void
  setLayout: (layout: Partial<FrameLayout>) => void
}

const DEFAULT_LAYOUT: FrameLayout = { x: 56, bottomY: 44, w: DEFAULT_W, h: DEFAULT_H }

export const useMediaFrame = create<MediaFrameState>((set) => ({
  url: null,
  externalUrl: null,
  title: '',
  isExpanded: false,
  layout: DEFAULT_LAYOUT,
  // Resetting layout here avoids calling setState inside useEffect
  open: (url, title, externalUrl) =>
    set({
      url,
      externalUrl: externalUrl ?? null,
      title,
      isExpanded: false,
      layout: DEFAULT_LAYOUT,
    }),
  close: () =>
    set({ url: null, externalUrl: null, title: '', isExpanded: false, layout: DEFAULT_LAYOUT }),
  toggleExpand: () =>
    set((s) => {
      const next = !s.isExpanded
      return {
        isExpanded: next,
        layout: { ...s.layout, w: next ? 800 : DEFAULT_W, h: next ? 500 : DEFAULT_H },
      }
    }),
  setLayout: (patch) => set((s) => ({ layout: { ...s.layout, ...patch } })),
}))

function toEmbedUrl(url: string): string {
  const ytWatch = url.match(/youtube\.com\/watch\?v=([^&]+)/)
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}?autoplay=1&rel=0`

  const ytShort = url.match(/youtu\.be\/([^?]+)/)
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?autoplay=1&rel=0`

  const ytLive = url.match(/youtube\.com\/live\/([^?]+)/)
  if (ytLive) return `https://www.youtube.com/embed/${ytLive[1]}?autoplay=1&rel=0`

  return url
}

function isEmbeddable(url: string): boolean {
  return /youtube\.com|youtu\.be|maps\.google\.com/.test(url)
}

function toExternalUrl(url: string): string {
  // Convert Google Maps embed URL to a normal browseable URL
  const mapsEmbed = url.match(/maps\.google\.com\/maps\?q=([^&]+)/)
  if (mapsEmbed) {
    return `https://www.google.com/maps/search/${mapsEmbed[1]}`
  }

  // Convert YouTube embed URL back to watch URL
  const ytEmbed = url.match(/youtube\.com\/embed\/([^?]+)/)
  if (ytEmbed) {
    return `https://www.youtube.com/watch?v=${ytEmbed[1]}`
  }

  return url
}

export function MediaFrame() {
  const { url, externalUrl, title, close, toggleExpand, isExpanded, layout, setLayout } =
    useMediaFrame()

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })
  const resizeStart = useRef({ mx: 0, my: 0, ow: 0, oh: 0 })
  const frameRef = useRef<HTMLDivElement>(null)

  // Drag handlers
  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: rect.left, oy: rect.top }
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mx
      setLayout({ x: dragStart.current.ox + dx, bottomY: -1 })
    }
    const onUp = () => setIsDragging(false)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, setLayout])

  // Resize handlers (bottom-right corner)
  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)
      resizeStart.current = { mx: e.clientX, my: e.clientY, ow: layout.w, oh: layout.h }
    },
    [layout.w, layout.h],
  )

  useEffect(() => {
    if (!isResizing) return

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.current.mx
      const dy = e.clientY - resizeStart.current.my
      setLayout({
        w: Math.max(MIN_W, resizeStart.current.ow + dx),
        h: Math.max(MIN_H, resizeStart.current.oh + dy),
      })
    }
    const onUp = () => setIsResizing(false)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isResizing, setLayout])

  if (!url) return null

  const embedUrl = toEmbedUrl(url)
  const canEmbed = isEmbeddable(url)
  const linkUrl = externalUrl || toExternalUrl(url)
  const headerH = 32
  const iframeH = layout.h - headerH

  const style: React.CSSProperties =
    layout.bottomY >= 0
      ? { left: layout.x, bottom: layout.bottomY, width: layout.w, height: layout.h }
      : { left: layout.x, top: layout.bottomY * -1, width: layout.w, height: layout.h }

  return (
    <AnimatePresence>
      <motion.div
        ref={frameRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="absolute z-40 shadow-2xl rounded-lg overflow-hidden border border-gray-700/50 bg-gray-900"
        style={style}
      >
        {/* Header — draggable */}
        <div
          role="toolbar"
          aria-label="メディアフレームヘッダー"
          onMouseDown={onDragStart}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-800/90 border-b border-gray-700/50 select-none"
          style={{ cursor: isDragging ? 'grabbing' : 'grab', height: headerH }}
        >
          <GripHorizontal size={12} className="text-gray-600 shrink-0" />
          <p className="flex-1 text-[11px] text-gray-300 truncate">{title}</p>
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-0.5 rounded hover:bg-gray-700/50 text-gray-500 hover:text-gray-300"
            title="新規タブで開く"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <ExternalLink size={12} />
          </a>
          <button
            type="button"
            onClick={toggleExpand}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-0.5 rounded hover:bg-gray-700/50 text-gray-500 hover:text-gray-300"
            title={isExpanded ? '縮小' : '拡大'}
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            type="button"
            onClick={close}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-0.5 rounded hover:bg-gray-700/50 text-gray-500 hover:text-gray-300"
          >
            <X size={12} />
          </button>
        </div>

        {/* Content */}
        {canEmbed ? (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full bg-black"
            style={{ height: iframeH, pointerEvents: isDragging || isResizing ? 'none' : 'auto' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-3 bg-gray-950"
            style={{ height: iframeH }}
          >
            <p className="text-xs text-gray-500 text-center px-4">
              このサイトは埋め込み表示に対応していません
            </p>
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600/30 text-blue-400 text-xs hover:bg-blue-600/40 transition-colors"
            >
              <ExternalLink size={12} />
              新規タブで開く
            </a>
          </div>
        )}

        {/* Resize handle (bottom-right corner) */}
        <button
          type="button"
          aria-label="リサイズ"
          onMouseDown={onResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-transparent border-0 p-0"
          style={{ zIndex: 50 }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className="absolute bottom-1 right-1 text-gray-500"
            aria-hidden="true"
          >
            <path
              d="M9 1L1 9M9 5L5 9M9 9L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
