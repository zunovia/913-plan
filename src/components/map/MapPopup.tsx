'use client'

import { ExternalLink, X } from 'lucide-react'
import { useMapStore } from '@/stores/mapStore'
import type { Earthquake } from '@/types/earthquake'
import type { Flight } from '@/types/flight'
import type { Vessel } from '@/types/vessel'

const SHIP_TYPE_NAMES: Record<number, string> = {
  30: '漁船',
  60: '旅客船',
  70: '貨物船',
  80: 'タンカー',
}

function getShipTypeName(type: number): string {
  const base = Math.floor(type / 10) * 10
  return SHIP_TYPE_NAMES[base] ?? '船舶'
}

export function MapPopup() {
  const { selectedFeature, clearSelection } = useMapStore()
  if (!selectedFeature) return null

  const typeLabels: Record<string, string> = {
    earthquakes: '地震',
    flights: '航空機',
    vessels: '船舶',
  }

  return (
    <div className="absolute top-20 left-16 z-30 w-72 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-xl">
      <div className="flex items-center justify-between p-2 border-b border-gray-700/50">
        <span className="text-xs text-gray-400">
          {typeLabels[selectedFeature.type] ?? selectedFeature.type}
        </span>
        <button
          type="button"
          onClick={clearSelection}
          className="p-0.5 rounded hover:bg-gray-700/50 text-gray-500"
        >
          <X size={14} />
        </button>
      </div>
      <div className="p-3">
        {selectedFeature.type === 'earthquakes' && (
          <EarthquakeDetail data={selectedFeature.data as Earthquake} />
        )}
        {selectedFeature.type === 'flights' && (
          <FlightDetail data={selectedFeature.data as Flight} />
        )}
        {selectedFeature.type === 'vessels' && (
          <VesselDetail data={selectedFeature.data as Vessel} />
        )}
        {!['earthquakes', 'flights', 'vessels'].includes(selectedFeature.type) && (
          <pre className="text-[10px] text-gray-400 overflow-auto max-h-40">
            {JSON.stringify(selectedFeature.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

function EarthquakeDetail({ data }: { data: Earthquake }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-orange-400">M{data.magnitude.toFixed(1)}</span>
        {data.intensity && (
          <span className="text-xs px-1.5 py-0.5 bg-orange-900/30 text-orange-300 rounded">
            震度{data.intensity}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-300">{data.place}</p>
      <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500">
        <span>深さ: {data.depth}km</span>
        <span>震源: {data.source.toUpperCase()}</span>
        <span className="col-span-2">{new Date(data.time).toLocaleString('ja-JP')}</span>
      </div>
      {data.tsunami && <p className="text-xs text-red-400 font-medium">⚠ 津波注意</p>}
      <a
        href={`https://www.google.com/maps/@${data.latitude},${data.longitude},12z`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 mt-1"
      >
        <ExternalLink size={10} />
        Google Mapsで詳細を見る
      </a>
    </div>
  )
}

function FlightDetail({ data }: { data: Flight }) {
  const altFt = Math.round(data.altitude * 3.281)
  const speedKt = Math.round(data.velocity * 1.944)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono font-bold text-blue-300">{data.callsign || '---'}</span>
        <span className="text-[10px] text-gray-500">{data.icao24}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
        <span>高度: {altFt.toLocaleString()} ft</span>
        <span>速度: {speedKt} kt</span>
        <span>方位: {Math.round(data.heading)}°</span>
        <span>
          垂直: {data.verticalRate > 0 ? '↑' : data.verticalRate < 0 ? '↓' : '→'}{' '}
          {Math.abs(Math.round(data.verticalRate))} m/s
        </span>
        <span className="col-span-2">国籍: {data.originCountry}</span>
      </div>
      <div className="flex flex-col gap-1 mt-1">
        <a
          href={`https://www.flightradar24.com/${data.callsign?.trim()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-yellow-400 hover:text-yellow-300"
        >
          <ExternalLink size={10} />
          Flightradar24で追跡
        </a>
        <a
          href={`https://www.google.com/maps/@${data.latitude},${data.longitude},10z`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300"
        >
          <ExternalLink size={10} />
          Google Mapsで詳細を見る
        </a>
      </div>
    </div>
  )
}

function VesselDetail({ data }: { data: Vessel }) {
  const speedKt = data.speed.toFixed(1)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-green-300">{data.name}</span>
        <span className="text-[10px] px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded">
          {getShipTypeName(data.shipType)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
        <span>MMSI: {data.mmsi}</span>
        <span>速度: {speedKt} kt</span>
        <span>進路: {Math.round(data.course)}°</span>
        <span>船首: {data.heading !== 511 ? `${data.heading}°` : '---'}</span>
        {data.destination && <span className="col-span-2">目的地: {data.destination}</span>}
        {data.eta && <span className="col-span-2">ETA: {data.eta}</span>}
      </div>
      <div className="flex flex-col gap-1 mt-1">
        <a
          href={`https://www.marinetraffic.com/en/ais/details/ships/mmsi:${data.mmsi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-green-400 hover:text-green-300"
        >
          <ExternalLink size={10} />
          MarineTrafficで追跡
        </a>
        <a
          href={`https://www.google.com/maps/@${data.latitude},${data.longitude},12z`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300"
        >
          <ExternalLink size={10} />
          Google Mapsで詳細を見る
        </a>
      </div>
    </div>
  )
}
