'use client'

import { Loader2, Plane, Ship } from 'lucide-react'
import { getAltitudeColor, getAltitudeLabel } from '@/components/map/layers/FlightLayer'
import { getShipColor, getShipTypeName } from '@/components/map/layers/VesselLayer'
import { useFlights } from '@/hooks/useFlights'
import { useVessels } from '@/hooks/useVessels'
import { useMapStore } from '@/stores/mapStore'
import type { Flight } from '@/types/flight'
import type { Vessel } from '@/types/vessel'

function rgbaToCSS(c: [number, number, number, number]): string {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

function FlightItem({
  flight,
  isSelected,
  onSelect,
}: {
  flight: Flight
  isSelected: boolean
  onSelect: () => void
}) {
  const color = getAltitudeColor(flight.altitude)
  const altFt = Math.round(flight.altitude * 3.281)
  const speedKt = Math.round(flight.velocity * 1.944)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-1.5 rounded transition-colors ${
        isSelected
          ? 'bg-blue-900/40 ring-1 ring-blue-500/50'
          : 'bg-gray-800/30 hover:bg-gray-800/60'
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Color indicator matching map icon */}
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: rgbaToCSS(color), boxShadow: `0 0 4px ${rgbaToCSS(color)}` }}
        />
        <span className="text-[11px] text-gray-200 font-mono font-medium truncate">
          {flight.callsign?.trim() || flight.icao24}
        </span>
        <span className="text-[9px] text-gray-500 ml-auto shrink-0">{flight.originCountry}</span>
      </div>
      <div className="flex items-center gap-2 mt-0.5 ml-[18px]">
        <span className="text-[9px] font-mono" style={{ color: rgbaToCSS(color) }}>
          {altFt.toLocaleString()} ft
        </span>
        <span className="text-[9px] text-gray-500">{speedKt} kt</span>
        <span className="text-[9px] text-gray-600">{Math.round(flight.heading)}°</span>
        <span
          className="text-[8px] px-1 py-px rounded"
          style={{ backgroundColor: `${rgbaToCSS(color)}20`, color: rgbaToCSS(color) }}
        >
          {getAltitudeLabel(flight.altitude)}
        </span>
      </div>
    </button>
  )
}

function VesselItem({
  vessel,
  isSelected,
  onSelect,
}: {
  vessel: Vessel
  isSelected: boolean
  onSelect: () => void
}) {
  const color = getShipColor(vessel.shipType)
  const typeName = getShipTypeName(vessel.shipType)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-1.5 rounded transition-colors ${
        isSelected
          ? 'bg-green-900/40 ring-1 ring-green-500/50'
          : 'bg-gray-800/30 hover:bg-gray-800/60'
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Color indicator matching map icon */}
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: rgbaToCSS(color), boxShadow: `0 0 4px ${rgbaToCSS(color)}` }}
        />
        <span className="text-[11px] text-gray-200 truncate font-medium">
          {vessel.name || vessel.mmsi}
        </span>
        <span
          className="text-[8px] px-1 py-px rounded shrink-0"
          style={{ backgroundColor: `${rgbaToCSS(color)}20`, color: rgbaToCSS(color) }}
        >
          {typeName}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-0.5 ml-[18px]">
        <span className="text-[9px] font-mono" style={{ color: rgbaToCSS(color) }}>
          {vessel.speed.toFixed(1)} kt
        </span>
        <span className="text-[9px] text-gray-500">進路 {Math.round(vessel.course)}°</span>
        {vessel.destination && (
          <span className="text-[9px] text-gray-500 truncate">→ {vessel.destination}</span>
        )}
      </div>
    </button>
  )
}

// Color legend
function FlightLegend() {
  const levels: { label: string; alt: number }[] = [
    { label: '地上付近', alt: 500 },
    { label: '低空', alt: 2000 },
    { label: '中低空', alt: 4500 },
    { label: '中高空', alt: 7500 },
    { label: '高空', alt: 10000 },
    { label: '超高空', alt: 12000 },
  ]
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5 px-1 mb-1">
      {levels.map(({ label, alt }) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: rgbaToCSS(getAltitudeColor(alt)) }}
          />
          <span className="text-[8px] text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  )
}

function VesselLegend() {
  const types: { label: string; shipType: number }[] = [
    { label: '貨物船', shipType: 70 },
    { label: 'タンカー', shipType: 80 },
    { label: '旅客船', shipType: 60 },
    { label: '漁船', shipType: 30 },
    { label: 'その他', shipType: 0 },
  ]
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5 px-1 mb-1">
      {types.map(({ label, shipType }) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: rgbaToCSS(getShipColor(shipType)) }}
          />
          <span className="text-[8px] text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  )
}

export function TransportPanel() {
  const { flights, count: flightCount, isLoading: flightsLoading } = useFlights()
  const { vessels, count: vesselCount, isLoading: vesselsLoading } = useVessels()
  const { selectedFeature, selectFeature, setViewState } = useMapStore()

  const handleFlightClick = (f: Flight) => {
    selectFeature({ type: 'flights', id: f.icao24, data: f })
    setViewState({ longitude: f.longitude, latitude: f.latitude, zoom: 8 })
  }

  const handleVesselClick = (v: Vessel) => {
    selectFeature({ type: 'vessels', id: v.mmsi, data: v })
    setViewState({ longitude: v.longitude, latitude: v.latitude, zoom: 10 })
  }

  // Sort flights by altitude descending
  const sortedFlights = [...flights]
    .filter((f) => !f.onGround)
    .sort((a, b) => b.altitude - a.altitude)

  return (
    <div className="p-3 space-y-4">
      {/* Flights */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Plane size={14} className="text-yellow-400" />
          <h3 className="text-xs font-medium text-gray-300">航空機</h3>
          <span className="text-[10px] text-gray-500 ml-auto">{flightCount}機追跡中</span>
        </div>
        <FlightLegend />
        {flightsLoading ? (
          <Loader2 size={14} className="animate-spin text-gray-500 mx-auto" />
        ) : (
          <div className="space-y-0.5 max-h-56 overflow-y-auto">
            {sortedFlights.slice(0, 30).map((f) => (
              <FlightItem
                key={f.icao24}
                flight={f}
                isSelected={selectedFeature?.type === 'flights' && selectedFeature.id === f.icao24}
                onSelect={() => handleFlightClick(f)}
              />
            ))}
          </div>
        )}
        {sortedFlights.length > 30 && (
          <p className="text-[9px] text-gray-600 text-center mt-1">
            他 {sortedFlights.length - 30} 機
          </p>
        )}
      </div>

      {/* Vessels */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Ship size={14} className="text-green-400" />
          <h3 className="text-xs font-medium text-gray-300">船舶</h3>
          <span className="text-[10px] text-gray-500 ml-auto">{vesselCount}隻追跡中</span>
        </div>
        <VesselLegend />
        {vesselsLoading ? (
          <Loader2 size={14} className="animate-spin text-gray-500 mx-auto" />
        ) : vessels.length === 0 ? (
          <p className="text-[10px] text-gray-600 p-2">
            AIS APIキーを設定すると船舶データを表示します
          </p>
        ) : (
          <div className="space-y-0.5 max-h-56 overflow-y-auto">
            {vessels.slice(0, 30).map((v) => (
              <VesselItem
                key={v.mmsi}
                vessel={v}
                isSelected={selectedFeature?.type === 'vessels' && selectedFeature.id === v.mmsi}
                onSelect={() => handleVesselClick(v)}
              />
            ))}
          </div>
        )}
        {vessels.length > 30 && (
          <p className="text-[9px] text-gray-600 text-center mt-1">他 {vessels.length - 30} 隻</p>
        )}
      </div>
    </div>
  )
}
