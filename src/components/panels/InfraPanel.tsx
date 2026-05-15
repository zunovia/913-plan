'use client'

import { Cable, Loader2, Server, Zap } from 'lucide-react'
import useSWR from 'swr'

interface PowerGridStatus {
  region: string
  company: string
  usage: number
  capacity: number
  percentage: number
  updatedAt: string
}

interface InfraData {
  powerGrid: PowerGridStatus[]
  submarineCables: number
  dataCenters: number
  updatedAt: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getUsageColor(pct: number): string {
  if (pct >= 95) return 'text-red-400'
  if (pct >= 85) return 'text-orange-400'
  if (pct >= 70) return 'text-yellow-400'
  return 'text-green-400'
}

function getBarColor(pct: number): string {
  if (pct >= 95) return 'bg-red-500'
  if (pct >= 85) return 'bg-orange-500'
  if (pct >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

export function InfraPanel() {
  const { data, isLoading } = useSWR<InfraData>('/api/infrastructure/status', fetcher, {
    refreshInterval: 300_000,
  })

  return (
    <div className="p-3 space-y-4">
      {/* Power Grid */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-yellow-400" />
          <h3 className="text-xs font-medium text-gray-300">電力使用状況</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-3">
            <Loader2 size={14} className="animate-spin text-gray-500" />
          </div>
        ) : data?.powerGrid && data.powerGrid.length > 0 ? (
          <div className="space-y-2">
            {data.powerGrid.map((pg) => (
              <div key={pg.region} className="p-2 rounded bg-gray-800/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-300">{pg.company}</span>
                  <span
                    className={`text-[11px] font-mono font-semibold ${getUsageColor(pg.percentage)}`}
                  >
                    {pg.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBarColor(pg.percentage)}`}
                    style={{ width: `${Math.min(100, pg.percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-gray-600">
                    {pg.usage.toLocaleString()}万kW / {pg.capacity.toLocaleString()}万kW
                  </span>
                  <span className="text-[9px] text-gray-600">
                    {new Date(pg.updatedAt).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-gray-500 p-2">電力データを取得できませんでした</p>
        )}
      </div>

      {/* Submarine Cables */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Cable size={14} className="text-cyan-400" />
          <h3 className="text-xs font-medium text-gray-300">海底ケーブル</h3>
        </div>
        <div className="p-2 rounded bg-gray-800/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">日本着陸ケーブル</span>
            <span className="text-[11px] font-mono text-cyan-400">
              {data?.submarineCables ?? '...'} 本
            </span>
          </div>
          <p className="text-[9px] text-gray-600 mt-1">レイヤー切替で地図上に表示</p>
        </div>
      </div>

      {/* Data Centers */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Server size={14} className="text-purple-400" />
          <h3 className="text-xs font-medium text-gray-300">データセンター</h3>
        </div>
        <div className="p-2 rounded bg-gray-800/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">国内主要DC</span>
            <span className="text-[11px] font-mono text-purple-400">
              {data?.dataCenters ?? '...'} 拠点
            </span>
          </div>
          <p className="text-[9px] text-gray-600 mt-1">レイヤー切替で地図上に表示</p>
        </div>
      </div>

      {data?.updatedAt && (
        <p className="text-[10px] text-gray-600 text-right">
          更新: {new Date(data.updatedAt).toLocaleTimeString('ja-JP')}
        </p>
      )}
    </div>
  )
}
