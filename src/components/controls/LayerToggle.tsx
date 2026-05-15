'use client'

import { useMapStore } from '@/stores/mapStore'
import { LAYER_REGISTRY } from '@/components/map/layers/registry'
import { Layers, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function LayerToggle() {
  const { visibleLayers, toggleLayer, mode } = useMapStore()
  const [isOpen, setIsOpen] = useState(false)

  const availableLayers = LAYER_REGISTRY.filter((l) =>
    l.renderers.includes(mode === '2d' ? 'flat' : 'globe')
  )

  return (
    <div className="absolute bottom-24 right-4 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 text-gray-300 hover:text-white transition-colors text-xs"
      >
        <Layers size={14} />
        レイヤー
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2 space-y-0.5">
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
