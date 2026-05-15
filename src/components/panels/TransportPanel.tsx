'use client'

import { useFlights } from '@/hooks/useFlights'
import { useVessels } from '@/hooks/useVessels'
import { Plane, Ship, Loader2 } from 'lucide-react'

export function TransportPanel() {
  const { flights, count: flightCount, isLoading: flightsLoading } = useFlights()
  const { vessels, count: vesselCount, isLoading: vesselsLoading } = useVessels()

  return (
    <div className="p-3 space-y-4">
      {/* Flights */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Plane size={14} className="text-blue-400" />
          <h3 className="text-xs font-medium text-gray-300">航空機</h3>
          <span className="text-[10px] text-gray-500 ml-auto">{flightCount}機追跡中</span>
        </div>
        {flightsLoading ? (
          <Loader2 size={14} className="animate-spin text-gray-500" />
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {flights.slice(0, 20).map((f) => (
              <div key={f.icao24} className="flex items-center justify-between p-1.5 rounded bg-gray-800/30 text-[11px]">
                <span className="text-gray-300 font-mono">{f.callsign || f.icao24}</span>
                <div className="flex items-center gap-2 text-gray-500">
                  <span>{Math.round(f.altitude)}m</span>
                  <span>{Math.round(f.velocity)}m/s</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vessels */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Ship size={14} className="text-green-400" />
          <h3 className="text-xs font-medium text-gray-300">船舶</h3>
          <span className="text-[10px] text-gray-500 ml-auto">{vesselCount}隻追跡中</span>
        </div>
        {vesselsLoading ? (
          <Loader2 size={14} className="animate-spin text-gray-500" />
        ) : vessels.length === 0 ? (
          <p className="text-[10px] text-gray-600 p-2">AIS APIキーを設定すると船舶データを表示します</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {vessels.slice(0, 20).map((v) => (
              <div key={v.mmsi} className="flex items-center justify-between p-1.5 rounded bg-gray-800/30 text-[11px]">
                <span className="text-gray-300 truncate max-w-[150px]">{v.name || v.mmsi}</span>
                <span className="text-gray-500">{v.speed.toFixed(1)}kn</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
