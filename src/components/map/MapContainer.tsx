'use client'

import { useMapStore } from '@/stores/mapStore'
import { FlatMap } from './FlatMap'
import { GlobeMap } from './GlobeMap'
import { MapModeSwitcher } from './MapModeSwitcher'
import { MapPopup } from './MapPopup'

export function MapContainer() {
  const { mode } = useMapStore()

  return (
    <div className="relative w-full h-full">
      {mode === '2d' ? <FlatMap /> : <GlobeMap />}
      <MapModeSwitcher />
      <MapPopup />
    </div>
  )
}
