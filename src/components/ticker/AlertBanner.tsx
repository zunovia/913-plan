'use client'

import { useEarthquakes } from '@/hooks/useEarthquakes'
import { AlertTriangle, X } from 'lucide-react'
import { useState, useMemo } from 'react'

export function AlertBanner() {
  const { earthquakes } = useEarthquakes()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const recentAlerts = useMemo(() => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000
    return earthquakes.filter(
      (eq) =>
        eq.magnitude >= 5 &&
        new Date(eq.time).getTime() > fiveMinAgo &&
        !dismissed.has(eq.id)
    )
  }, [earthquakes, dismissed])

  if (recentAlerts.length === 0) return null

  const alert = recentAlerts[0]

  return (
    <div className="absolute top-0 left-0 right-0 z-50 bg-red-900/90 backdrop-blur-sm border-b border-red-700 px-4 py-2 flex items-center gap-3 animate-pulse">
      <AlertTriangle size={18} className="text-red-300 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-red-100">
          緊急地震情報: M{alert.magnitude.toFixed(1)} - {alert.place}
        </p>
        <p className="text-xs text-red-300">
          {new Date(alert.time).toLocaleString('ja-JP')} · 深さ{alert.depth}km
          {alert.tsunami && ' · 津波注意'}
        </p>
      </div>
      <button
        onClick={() => setDismissed((prev) => new Set(prev).add(alert.id))}
        className="p-1 rounded hover:bg-red-800/50 text-red-300"
      >
        <X size={16} />
      </button>
    </div>
  )
}
