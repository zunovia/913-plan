'use client'

import { ChevronDown, Eye, EyeOff, GripVertical, Layers } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { LAYER_REGISTRY } from '@/components/map/layers/registry'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useMapStore } from '@/stores/mapStore'

export function LayerToggle() {
  const { visibleLayers, toggleLayer, hideAllLayers, showAllLayers, mode } = useMapStore()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  useClickOutside(containerRef, () => { if (isOpen) setIsOpen(false) })
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 })
  const moved = useRef(false)

  const onGripPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true
      moved.current = false
      dragStart.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      e.preventDefault()
      e.stopPropagation()
    },
    [pos],
  )

  const onGripPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true
    setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy })
  }, [])

  const onGripPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  const availableLayers = LAYER_REGISTRY.filter((l) =>
    l.renderers.includes(mode === '2d' ? 'flat' : 'globe'),
  )

  const hasVisible = visibleLayers.size > 0

  return (
    <div
      ref={containerRef}
      className="absolute bottom-20 right-3 md:bottom-24 md:right-4 z-10"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    >
      <div className="flex items-center gap-0">
        {/* Drag handle — pointer events are isolated here */}
        <div
          className="hidden md:flex items-center px-1 py-2 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 transition-colors"
          onPointerDown={onGripPointerDown}
          onPointerMove={onGripPointerMove}
          onPointerUp={onGripPointerUp}
        >
          <GripVertical size={12} />
        </div>
        <button
          type="button"
          onClick={() => {
            if (!moved.current) setIsOpen(!isOpen)
            moved.current = false
          }}
          className="flex items-center gap-1.5 px-3.5 py-2.5 md:px-3 md:py-2 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 text-gray-300 hover:text-white transition-colors text-xs"
        >
          <Layers size={14} />
          レイヤー
          <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2 space-y-0.5">
          {/* Toggle all button */}
          <button
            type="button"
            onClick={() => (hasVisible ? hideAllLayers() : showAllLayers())}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-gray-800/50 text-xs transition-colors"
          >
            {hasVisible ? (
              <>
                <EyeOff size={12} className="text-gray-500" />
                <span className="text-gray-400">全て非表示</span>
              </>
            ) : (
              <>
                <Eye size={12} className="text-blue-400" />
                <span className="text-blue-400">全て表示</span>
              </>
            )}
          </button>
          <div className="border-t border-gray-700/30 my-1" />

          {availableLayers.map((layer) => (
            <label
              key={layer.key}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-800/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={visibleLayers.has(layer.key)}
                onChange={() => toggleLayer(layer.key)}
                className="w-3 h-3 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-xs text-gray-300">{layer.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
