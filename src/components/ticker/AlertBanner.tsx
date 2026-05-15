'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEarthquakes } from '@/hooks/useEarthquakes'

export function AlertBanner() {
  const { earthquakes } = useEarthquakes()
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [tick, setTick] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Re-evaluate every 30s so stale alerts disappear
  useEffect(() => {
    intervalRef.current = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const recentAlerts = useMemo(() => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000
    const dismissed = new Set(dismissedIds)
    return earthquakes.filter(
      (eq) =>
        eq.magnitude >= 5 &&
        new Date(eq.time).getTime() > fiveMinAgo &&
        !dismissed.has(eq.id),
    )
    // tick forces re-evaluation every 30s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earthquakes, dismissedIds, tick])

  const dismiss = useCallback((id: string) => {
    setDismissedIds((prev) => [...prev, id])
  }, [])

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
        type="button"
        onClick={() => dismiss(alert.id)}
        className="p-1 rounded hover:bg-red-800/50 text-red-300"
      >
        <X size={16} />
      </button>
    </div>
  )
}
