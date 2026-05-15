'use client'

import { useMapStore } from '@/stores/mapStore'
import { Map, Globe } from 'lucide-react'

export function MapModeSwitcher() {
  const { mode, setMode } = useMapStore()

  return (
    <div className="absolute top-4 left-16 z-10 flex bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 p-0.5">
      <button
        onClick={() => setMode('2d')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          mode === '2d' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <Map size={14} />
        2D
      </button>
      <button
        onClick={() => setMode('3d')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          mode === '3d' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <Globe size={14} />
        3D
      </button>
    </div>
  )
}
