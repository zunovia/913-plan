'use client'

import { useSettingsStore } from '@/stores/settingsStore'
import { Settings, Moon, Sun, MapPin } from 'lucide-react'
import { useState } from 'react'

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, tileProvider, setTheme, setTileProvider, autoRotateGlobe, setAutoRotateGlobe } =
    useSettingsStore()

  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 text-gray-400 hover:text-white transition-colors"
      >
        <Settings size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700/50 p-3 space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider">テーマ</label>
            <div className="flex gap-1 mt-1">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Moon size={12} /> ダーク
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${theme === 'light' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Sun size={12} /> ライト
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider">タイルプロバイダー</label>
            <div className="flex gap-1 mt-1">
              <button
                onClick={() => setTileProvider('openfreemap')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${tileProvider === 'openfreemap' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <MapPin size={12} /> OpenFreeMap
              </button>
              <button
                onClick={() => setTileProvider('google')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${tileProvider === 'google' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <MapPin size={12} /> Google
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRotateGlobe}
                onChange={(e) => setAutoRotateGlobe(e.target.checked)}
                className="w-3 h-3 rounded border-gray-600 bg-gray-800 text-blue-500"
              />
              <span className="text-xs text-gray-300">3D地球儀自動回転</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
