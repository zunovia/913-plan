'use client'

import { useEarthquakes } from '@/hooks/useEarthquakes'
import { useFilterStore } from '@/stores/filterStore'
import { filterEarthquakesByTime } from '@/lib/transform/earthquake'
import { Activity, AlertTriangle, Loader2 } from 'lucide-react'

export function DisasterPanel() {
  const { earthquakes, isLoading, updatedAt } = useEarthquakes()
  const { timeRange, minMagnitude } = useFilterStore()

  const filtered = filterEarthquakesByTime(earthquakes, timeRange).filter(
    (eq) => eq.magnitude >= minMagnitude
  )

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {filtered.length}件の地震 ({timeRange})
        </span>
        {updatedAt && (
          <span className="text-[10px] text-gray-600">
            {new Date(updatedAt).toLocaleTimeString('ja-JP')}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((eq) => (
            <div
              key={eq.id}
              className="p-2 rounded bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {eq.magnitude >= 5 ? (
                    <AlertTriangle size={14} className="text-red-400" />
                  ) : (
                    <Activity size={14} className="text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${getMagColor(eq.magnitude)}`}>
                      M{eq.magnitude.toFixed(1)}
                    </span>
                    {eq.intensity && (
                      <span className="text-[10px] px-1 bg-orange-900/30 text-orange-400 rounded">
                        震度{eq.intensity}
                      </span>
                    )}
                    {eq.tsunami && (
                      <span className="text-[10px] px-1 bg-red-900/50 text-red-300 rounded animate-pulse">
                        津波注意
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5 truncate">{eq.place}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-gray-500">
                      深さ{eq.depth}km
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(eq.time).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-gray-600 uppercase">{eq.source}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">期間内の地震データなし</p>
          )}
        </div>
      )}
    </div>
  )
}

function getMagColor(mag: number): string {
  if (mag >= 7) return 'text-red-400'
  if (mag >= 6) return 'text-red-500'
  if (mag >= 5) return 'text-orange-400'
  if (mag >= 4) return 'text-yellow-400'
  return 'text-green-400'
}
