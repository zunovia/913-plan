'use client'

import dynamic from 'next/dynamic'
import { CategoryNav } from '@/components/controls/CategoryNav'
import { PanelContainer } from '@/components/panels/PanelContainer'
import { LayerToggle } from '@/components/controls/LayerToggle'
import { TimeFilter } from '@/components/controls/TimeFilter'
import { SettingsMenu } from '@/components/controls/SettingsMenu'
import { NewsTicker } from '@/components/ticker/NewsTicker'
import { AlertBanner } from '@/components/ticker/AlertBanner'

const MapContainer = dynamic(() => import('@/components/map/MapContainer').then((m) => m.MapContainer), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-950">
      <div className="text-gray-500 text-sm animate-pulse">地図を読み込み中...</div>
    </div>
  ),
})

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      {/* Alert Banner */}
      <AlertBanner />

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Left Category Nav */}
        <CategoryNav />

        {/* Map Area */}
        <div className="absolute inset-0 ml-12">
          <MapContainer />
        </div>

        {/* Map Controls */}
        <LayerToggle />
        <TimeFilter />
        <SettingsMenu />

        {/* Right Panel */}
        <PanelContainer />
      </div>

      {/* Bottom Ticker */}
      <NewsTicker />
    </div>
  )
}
