'use client'

import { useMarketData } from '@/hooks/useMarketData'
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react'

export function MarketPanel() {
  const { marketData, isLoading } = useMarketData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      {/* Forex */}
      <div>
        <h3 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">為替</h3>
        <div className="space-y-1">
          {marketData?.forex.map((fx) => (
            <div key={`${fx.from}-${fx.to}`} className="flex items-center justify-between p-2 rounded bg-gray-800/30">
              <span className="text-xs text-gray-300">{fx.from}/{fx.to}</span>
              <span className="text-sm font-mono text-gray-200">{fx.rate.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Indices */}
      <div>
        <h3 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">指数</h3>
        <div className="space-y-1">
          {marketData?.indices.map((idx) => (
            <div key={idx.symbol} className="flex items-center justify-between p-2 rounded bg-gray-800/30">
              <div>
                <span className="text-xs text-gray-300">{idx.name}</span>
                <span className="text-[10px] text-gray-600 ml-1">{idx.symbol}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono text-gray-200">
                  {idx.price > 0 ? idx.price.toLocaleString() : '---'}
                </span>
                {idx.change !== 0 && (
                  <div className={`flex items-center gap-0.5 text-[10px] ${idx.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {idx.change > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {idx.changePercent.toFixed(2)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {marketData?.updatedAt && (
        <p className="text-[10px] text-gray-600 text-right">
          更新: {new Date(marketData.updatedAt).toLocaleTimeString('ja-JP')}
        </p>
      )}
    </div>
  )
}
