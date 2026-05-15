'use client'

import { Cable, Server, Zap } from 'lucide-react'

export function InfraPanel() {
  return (
    <div className="p-3 space-y-4">
      {/* Submarine Cables */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Cable size={14} className="text-cyan-400" />
          <h3 className="text-xs font-medium text-gray-300">海底ケーブル</h3>
        </div>
        <p className="text-[10px] text-gray-500 p-2">
          地図上のケーブルレイヤーを有効にすると表示されます
        </p>
      </div>

      {/* Data Centers */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Server size={14} className="text-purple-400" />
          <h3 className="text-xs font-medium text-gray-300">データセンター</h3>
        </div>
        <p className="text-[10px] text-gray-500 p-2">
          DCレイヤーを有効にすると主要データセンターの位置を表示します
        </p>
      </div>

      {/* Power Grid */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-yellow-400" />
          <h3 className="text-xs font-medium text-gray-300">電力使用状況</h3>
        </div>
        <p className="text-[10px] text-gray-500 p-2">
          電力会社APIとの連携を設定すると電力使用率を表示します
        </p>
      </div>
    </div>
  )
}
