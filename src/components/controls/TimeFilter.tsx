'use client'

import { useFilterStore } from '@/stores/filterStore'

const TIME_OPTIONS = [
  { value: '1h', label: '1時間' },
  { value: '6h', label: '6時間' },
  { value: '24h', label: '24時間' },
  { value: '7d', label: '7日間' },
  { value: '30d', label: '30日間' },
] as const

export function TimeFilter() {
  const { timeRange, setTimeRange } = useFilterStore()

  return (
    <div className="absolute bottom-24 left-16 z-10 flex gap-0.5 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 p-1">
      {TIME_OPTIONS.map(({ value, label }) => (
        <button
          type="button"
          key={value}
          onClick={() => setTimeRange(value)}
          className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            timeRange === value
              ? 'bg-blue-600/40 text-blue-300'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
