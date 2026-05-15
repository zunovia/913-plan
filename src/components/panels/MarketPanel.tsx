'use client'

import { Loader2, TrendingDown, TrendingUp } from 'lucide-react'
import { useMarketData } from '@/hooks/useMarketData'

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
      {/* Indices */}
      {marketData?.indices && marketData.indices.length > 0 && (
        <div>
          <h3 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
            株価指数
          </h3>
          <div className="space-y-1">
            {marketData.indices.map((idx) => (
              <div key={idx.symbol} className="p-2 rounded bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-gray-200">{idx.name}</span>
                  </div>
                  <span className="text-sm font-mono font-semibold text-gray-100">
                    {idx.price > 0
                      ? idx.price.toLocaleString('ja-JP', { maximumFractionDigits: 2 })
                      : '---'}
                  </span>
                </div>
                {idx.price > 0 && (
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-gray-600">{idx.symbol}</span>
                    <div
                      className={`flex items-center gap-1 text-[11px] font-mono ${idx.change >= 0 ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {idx.change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      <span>
                        {idx.change >= 0 ? '+' : ''}
                        {idx.change.toFixed(2)}
                      </span>
                      <span>
                        ({idx.changePercent >= 0 ? '+' : ''}
                        {idx.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forex */}
      {marketData?.forex && marketData.forex.length > 0 && (
        <div>
          <h3 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
            為替
          </h3>
          <div className="space-y-1">
            {marketData.forex.map((fx) => (
              <div
                key={`${fx.from}-${fx.to}`}
                className="flex items-center justify-between p-2 rounded bg-gray-800/30"
              >
                <span className="text-xs text-gray-300">
                  {fx.from}/{fx.to}
                </span>
                <span className="text-sm font-mono font-semibold text-gray-100">
                  {fx.rate.toLocaleString('ja-JP', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {marketData?.indices?.length === 0 && marketData?.forex?.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-4">市場データを取得できませんでした</p>
      )}

      {marketData?.updatedAt && (
        <p className="text-[10px] text-gray-600 text-right">
          更新: {new Date(marketData.updatedAt).toLocaleTimeString('ja-JP')}
        </p>
      )}
    </div>
  )
}
