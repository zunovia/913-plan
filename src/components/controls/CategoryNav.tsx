'use client'

import {
  AlertTriangle,
  CloudSun,
  Newspaper,
  Plane,
  Server,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react'
import Image from 'next/image'
import { usePanelStore } from '@/stores/panelStore'
import type { PanelType } from '@/types/layers'

const CATEGORIES: { key: PanelType; icon: typeof Newspaper; label: string }[] = [
  { key: 'news', icon: Newspaper, label: 'ニュース' },
  { key: 'disaster', icon: AlertTriangle, label: '災害' },
  { key: 'weather', icon: CloudSun, label: '天気' },
  { key: 'market', icon: TrendingUp, label: '市場' },
  { key: 'transport', icon: Plane, label: '交通' },
  { key: 'cyber', icon: ShieldAlert, label: 'サイバー' },
  { key: 'infra', icon: Server, label: 'インフラ' },
]

export function CategoryNav() {
  const { activePanel, togglePanel } = usePanelStore()

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 z-30 flex flex-row items-center justify-around bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 md:absolute md:left-0 md:top-0 md:bottom-0 md:right-auto md:h-auto md:w-12 md:flex-col md:justify-start md:py-3 md:gap-1 md:border-t-0 md:border-r md:bg-gray-900/90">
      {CATEGORIES.map(({ key, icon: Icon, label }) => (
        <button
          type="button"
          key={key}
          onClick={() => togglePanel(key)}
          title={label}
          className={`w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-lg transition-all ${
            activePanel === key
              ? 'bg-blue-600/30 text-blue-400'
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
          }`}
        >
          <Icon size={18} />
        </button>
      ))}

      {/* Company Logo */}
      <div className="hidden md:block md:mt-auto">
        <a
          href="https://surc.online/"
          target="_blank"
          rel="noopener noreferrer"
          title="SUR COMMUNICATION"
          className="block w-9 h-9 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.jpg"
            alt="SUR COMMUNICATION"
            width={36}
            height={36}
            className="w-full h-full object-cover rounded-lg"
          />
        </a>
      </div>
    </div>
  )
}
