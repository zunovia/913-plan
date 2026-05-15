'use client'

import {
  ChevronDown,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Droplets,
  Loader2,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react'
import { useState } from 'react'
import { useWeather } from '@/hooks/useWeather'
import type { WeatherArea, WeatherDay } from '@/types/weather'

function WeatherIcon({ weatherCode, size = 18 }: { weatherCode: string; size?: number }) {
  const code = weatherCode?.trim() ?? ''

  if (code.startsWith('1')) return <Sun size={size} className="text-yellow-400" />
  if (code.startsWith('2')) return <Cloud size={size} className="text-gray-400" />
  if (code.startsWith('3')) return <CloudRain size={size} className="text-blue-400" />
  if (code.startsWith('4')) return <CloudSnow size={size} className="text-cyan-300" />
  if (code.startsWith('5') || code.startsWith('6'))
    return <CloudLightning size={size} className="text-yellow-300" />
  return <Cloud size={size} className="text-gray-500" />
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr)
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`
}

function WeeklyForecast({ days }: { days: WeatherDay[] }) {
  if (days.length === 0) return null

  return (
    <div className="mt-1.5 pt-1.5 border-t border-gray-700/30 space-y-0.5">
      {days.map((day) => (
        <div key={day.date} className="flex items-center gap-1.5 py-0.5 px-1">
          <span className="text-[9px] text-gray-500 w-[52px] shrink-0 font-mono">
            {formatDay(day.date)}
          </span>
          <div className="shrink-0 w-4">
            <WeatherIcon weatherCode={day.weatherCode} size={12} />
          </div>
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {day.tempMax != null ? (
              <span className="text-[9px] font-mono text-orange-400 w-6 text-right">
                {day.tempMax}°
              </span>
            ) : (
              <span className="text-[9px] font-mono text-gray-600 w-6 text-right">--</span>
            )}
            <span className="text-[8px] text-gray-600">/</span>
            {day.tempMin != null ? (
              <span className="text-[9px] font-mono text-blue-400 w-6 text-right">
                {day.tempMin}°
              </span>
            ) : (
              <span className="text-[9px] font-mono text-gray-600 w-6 text-right">--</span>
            )}
          </div>
          {day.pop != null && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Droplets size={8} className="text-blue-500" />
              <span className="text-[8px] font-mono text-gray-400 w-5 text-right">{day.pop}%</span>
            </div>
          )}
          {day.reliability && (
            <span
              className={`text-[8px] font-mono w-3 text-center ${
                day.reliability === 'A'
                  ? 'text-green-500'
                  : day.reliability === 'B'
                    ? 'text-yellow-500'
                    : 'text-red-400'
              }`}
            >
              {day.reliability}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function AreaCard({ area }: { area: WeatherArea }) {
  const [expanded, setExpanded] = useState(false)
  const hasTempMax = area.tempMax != null
  const hasTempMin = area.tempMin != null
  const hasWeekly = area.weekly && area.weekly.length > 0

  return (
    <div className="rounded bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
      <button
        type="button"
        onClick={() => hasWeekly && setExpanded(!expanded)}
        className="w-full text-left p-2"
      >
        {/* Top row: icon + name + weather */}
        <div className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0">
            <WeatherIcon weatherCode={area.weatherCode} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-xs font-medium text-gray-200 truncate">{area.name}</p>
              {hasWeekly && (
                <ChevronDown
                  size={12}
                  className={`text-gray-500 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
              )}
            </div>
            <p className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">
              {area.weather}
            </p>
          </div>
        </div>

        {/* Temperature row */}
        {(hasTempMax || hasTempMin) && (
          <div className="flex items-center gap-2 mt-1.5">
            <Thermometer size={11} className="text-gray-500 shrink-0" />
            {hasTempMax && (
              <span className="text-[11px] font-mono font-semibold text-orange-400">
                {area.tempMax}&deg;
              </span>
            )}
            {hasTempMax && hasTempMin && <span className="text-[10px] text-gray-600">/</span>}
            {hasTempMin && (
              <span className="text-[11px] font-mono font-semibold text-blue-400">
                {area.tempMin}&deg;
              </span>
            )}
          </div>
        )}

        {/* Bottom row: precipitation + wind */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-0.5">
            <Droplets size={9} className="text-blue-500 shrink-0" />
            <span className="text-[9px] text-gray-400 font-mono">降水 {area.precipitation}%</span>
          </div>
          {area.wind && (
            <div className="flex items-center gap-0.5 min-w-0">
              <Wind size={9} className="text-gray-500 shrink-0" />
              <span className="text-[9px] text-gray-500 truncate">{area.wind}</span>
            </div>
          )}
        </div>
      </button>

      {/* Weekly forecast (expanded) */}
      {expanded && hasWeekly && (
        <div className="px-2 pb-2">
          <WeeklyForecast days={area.weekly} />
        </div>
      )}
    </div>
  )
}

export function WeatherPanel() {
  const { weather, isLoading } = useWeather()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-gray-500" />
      </div>
    )
  }

  if (!weather || weather.length === 0) {
    return (
      <div className="p-3">
        <p className="text-xs text-gray-500 text-center py-4">天気データを取得できませんでした</p>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-1">
      {weather.map((area) => (
        <AreaCard key={area.code} area={area} />
      ))}
    </div>
  )
}
