'use client'

import { usePanelStore } from '@/stores/panelStore'
import type { PanelType } from '@/types/layers'
import {
  Newspaper,
  AlertTriangle,
  TrendingUp,
  Plane,
  ShieldAlert,
  Server,
} from 'lucide-react'

const CATEGORIES: { key: PanelType; icon: typeof Newspaper; label: string }[] = [
  { key: 'news', icon: Newspaper, label: 'ニュース' },
  { key: 'disaster', icon: AlertTriangle, label: '災害' },
  { key: 'market', icon: TrendingUp, label: '市場' },
  { key: 'transport', icon: Plane, label: '交通' },
  { key: 'cyber', icon: ShieldAlert, label: 'サイバー' },
  { key: 'infra', icon: Server, label: 'インフラ' },
]

export function CategoryNav() {
  const { activePanel, togglePanel } = usePanelStore()

  return (
    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-900/90 backdrop-blur-sm border-r border-gray-700/50 z-20 flex flex-col items-center py-3 gap-1">
      {CATEGORIES.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => togglePanel(key)}
          title={label}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
            activePanel === key
              ? 'bg-blue-600/30 text-blue-400'
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
          }`}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  )
}
