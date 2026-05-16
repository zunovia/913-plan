'use client'

import { MapPin, Moon, Settings, Sun } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useSettingsStore } from '@/stores/settingsStore'

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  useClickOutside(containerRef, () => { if (isOpen) setIsOpen(false) })
  const { theme, tileProvider, setTheme, setTileProvider, autoRotateGlobe, setAutoRotateGlobe } =
    useSettingsStore()

  return (
    <div ref={containerRef} className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 md:p-2 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 text-gray-400 hover:text-white transition-colors"
      >
        <Settings size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700/50 p-3 space-y-3">
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">テーマ</span>
            <div className="flex gap-1 mt-1">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Moon size={12} /> ダーク
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${theme === 'light' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Sun size={12} /> ライト
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              タイルプロバイダー
            </span>
            <div className="flex gap-1 mt-1">
              <button
                type="button"
                onClick={() => setTileProvider('openfreemap')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${tileProvider === 'openfreemap' ? 'bg-blue-600/30 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <MapPin size={12} /> OpenFreeMap
              </button>
              <button
                type="button"
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

          <div className="pt-2 border-t border-gray-700/50">
            <a
              href="https://surc.online/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <Image
                src="/logo.jpg"
                alt="SUR COMMUNICATION"
                width={16}
                height={16}
                className="w-4 h-4 rounded-sm object-cover"
              />
              surc.online
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
