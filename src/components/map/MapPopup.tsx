'use client'

import { useMapStore } from '@/stores/mapStore'
import { X, ExternalLink } from 'lucide-react'
import type { Earthquake } from '@/types/earthquake'
import type { Flight } from '@/types/flight'

export function MapPopup() {
  const { selectedFeature, clearSelection } = useMapStore()
  if (!selectedFeature) return null

  return (
    <div className="absolute top-20 left-16 z-30 w-72 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-xl">
      <div className="flex items-center justify-between p-2 border-b border-gray-700/50">
        <span className="text-xs text-gray-400 uppercase">{selectedFeature.type}</span>
        <button onClick={clearSelection} className="p-0.5 rounded hover:bg-gray-700/50 text-gray-500">
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
        {!['earthquakes', 'flights'].includes(selectedFeature.type) && (
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
        {data.intensity && <span className="text-xs px-1.5 py-0.5 bg-orange-900/30 text-orange-300 rounded">震度{data.intensity}</span>}
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
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-mono text-blue-300">{data.callsign || data.icao24}</p>
      <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500">
        <span>高度: {Math.round(data.altitude)}m</span>
        <span>速度: {Math.round(data.velocity)}m/s</span>
        <span>方位: {Math.round(data.heading)}°</span>
        <span>国: {data.originCountry}</span>
      </div>
      <a
        href={`https://www.google.com/maps/@${data.latitude},${data.longitude},10z`}
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
