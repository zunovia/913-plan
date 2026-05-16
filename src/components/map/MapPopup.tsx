'use client'

import {
  Activity,
  CloudRain,
  ExternalLink,
  MapPin,
  Plane,
  Server,
  ShieldAlert,
  Ship,
  X,
} from 'lucide-react'
import { type ReactNode, useCallback, useRef } from 'react'
import { useClickOutside } from '@/hooks/useClickOutside'
import type { DCPoint } from '@/components/map/layers/DataCenterLayer'
import { useMapStore } from '@/stores/mapStore'
import type { CyberThreat } from '@/types/cyber'
import type { Earthquake } from '@/types/earthquake'
import type { Flight } from '@/types/flight'
import type { Vessel } from '@/types/vessel'
import type { WeatherWarning } from '@/types/warning'

// ─── Shared helpers ───

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] text-gray-500 shrink-0">{label}</span>
      <span className="text-[11px] text-gray-300 text-right">{children}</span>
    </div>
  )
}

function LinkButton({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-1 text-[10px] ${color} hover:brightness-125 transition`}
    >
      <ExternalLink size={10} />
      {label}
    </a>
  )
}

const TYPE_CONFIG: Record<string, { label: string; icon: ReactNode; borderColor: string }> = {
  earthquakes: {
    label: '地震情報',
    icon: <Activity size={13} className="text-orange-400" />,
    borderColor: 'border-orange-500/40',
  },
  flights: {
    label: '航空機情報',
    icon: <Plane size={13} className="text-yellow-400" />,
    borderColor: 'border-yellow-500/40',
  },
  vessels: {
    label: '船舶情報',
    icon: <Ship size={13} className="text-green-400" />,
    borderColor: 'border-green-500/40',
  },
  weather: {
    label: '気象警報',
    icon: <CloudRain size={13} className="text-amber-400" />,
    borderColor: 'border-amber-500/40',
  },
  cyberThreats: {
    label: 'サイバー脅威',
    icon: <ShieldAlert size={13} className="text-purple-400" />,
    borderColor: 'border-purple-500/40',
  },
  dataCenters: {
    label: 'データセンター',
    icon: <Server size={13} className="text-violet-400" />,
    borderColor: 'border-violet-500/40',
  },
}

// ─── Ship type names ───

const SHIP_TYPE_NAMES: Record<number, string> = {
  30: '漁船',
  60: '旅客船',
  70: '貨物船',
  80: 'タンカー',
}

function getShipTypeName(type: number): string {
  const base = Math.floor(type / 10) * 10
  return SHIP_TYPE_NAMES[base] ?? '船舶'
}

// ─── Main popup ───

export function MapPopup() {
  const { selectedFeature, clearSelection } = useMapStore()
  const popupRef = useRef<HTMLDivElement>(null)
  const onClickOutside = useCallback(() => { clearSelection() }, [clearSelection])
  useClickOutside(popupRef, onClickOutside)

  if (!selectedFeature) return null

  const config = TYPE_CONFIG[selectedFeature.type] ?? {
    label: selectedFeature.type,
    icon: <MapPin size={13} className="text-gray-400" />,
    borderColor: 'border-gray-500/40',
  }

  return (
    <div
      ref={popupRef}
      className={`fixed top-16 left-3 right-3 z-[35] w-auto md:absolute md:top-20 md:left-16 md:right-auto md:w-72 bg-gray-900/95 backdrop-blur-sm rounded-lg border-l-2 ${config.borderColor} border border-gray-700/50 shadow-xl`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700/40">
        {config.icon}
        <span className="text-xs font-medium text-gray-300">{config.label}</span>
        <button
          type="button"
          onClick={clearSelection}
          className="ml-auto p-0.5 rounded hover:bg-gray-700/50 text-gray-500 hover:text-gray-300"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="p-3">
        {selectedFeature.type === 'earthquakes' && (
          <EarthquakeDetail data={selectedFeature.data as Earthquake} />
        )}
        {selectedFeature.type === 'flights' && (
          <FlightDetail data={selectedFeature.data as Flight} />
        )}
        {selectedFeature.type === 'vessels' && (
          <VesselDetail data={selectedFeature.data as Vessel} />
        )}
        {selectedFeature.type === 'weather' && (
          <WarningDetail data={selectedFeature.data as WeatherWarning} />
        )}
        {selectedFeature.type === 'cyberThreats' && (
          <CyberDetail data={selectedFeature.data as CyberThreat} />
        )}
        {selectedFeature.type === 'dataCenters' && (
          <DataCenterDetail data={selectedFeature.data as DCPoint} />
        )}
      </div>
    </div>
  )
}

// ─── Earthquake ───

function getMagColor(mag: number): string {
  if (mag >= 7) return 'text-red-400'
  if (mag >= 5) return 'text-orange-400'
  if (mag >= 3) return 'text-yellow-400'
  return 'text-green-400'
}

function EarthquakeDetail({ data }: { data: Earthquake }) {
  const mag = data.magnitude ?? 0
  return (
    <div className="space-y-2">
      {/* Headline */}
      <div className="flex items-center gap-2">
        <span className={`text-xl font-bold ${getMagColor(mag)}`}>M{mag.toFixed(1)}</span>
        {data.intensity && (
          <span className="text-xs px-1.5 py-0.5 bg-orange-900/30 text-orange-300 rounded font-medium">
            震度{data.intensity}
          </span>
        )}
        {data.tsunami && (
          <span className="text-[10px] px-1.5 py-0.5 bg-red-900/50 text-red-300 rounded animate-pulse">
            津波注意
          </span>
        )}
      </div>

      {/* Place */}
      <p className="text-sm text-gray-200 font-medium">{data.place || '不明'}</p>

      {/* Details */}
      <div className="space-y-1 pt-1 border-t border-gray-700/30">
        {data.time && (
          <InfoRow label="発生時刻">{new Date(data.time).toLocaleString('ja-JP')}</InfoRow>
        )}
        {data.depth != null && <InfoRow label="震源の深さ">{data.depth} km</InfoRow>}
        <InfoRow label="情報元">{data.source === 'p2p' ? 'P2P地震情報' : 'USGS'}</InfoRow>
      </div>

      {/* Link */}
      {data.latitude != null && data.longitude != null && (
        <div className="pt-1">
          <LinkButton
            href={`https://www.google.com/maps/@${data.latitude},${data.longitude},10z`}
            label="震源をGoogle Mapsで見る"
            color="text-blue-400"
          />
        </div>
      )}
    </div>
  )
}

// ─── Flight ───

function FlightDetail({ data }: { data: Flight }) {
  const alt = data.altitude ?? 0
  const vel = data.velocity ?? 0
  const altM = Math.round(alt)
  const altFt = Math.round(alt * 3.281)
  const speedKmh = Math.round(vel * 3.6)
  const speedKt = Math.round(vel * 1.944)
  const vr = data.verticalRate ?? 0
  const vrFpm = Math.round(vr * 196.85) // m/s → ft/min
  const vrLabel =
    vr > 0.5
      ? `上昇 ${vrFpm.toLocaleString()} ft/min`
      : vr < -0.5
        ? `降下 ${Math.abs(vrFpm).toLocaleString()} ft/min`
        : '水平飛行'

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-mono font-bold text-yellow-300">
          {data.callsign?.trim() || '---'}
        </span>
        <span className="text-[10px] text-gray-500 font-mono">{data.icao24}</span>
      </div>

      <div className="space-y-1 pt-1 border-t border-gray-700/30">
        <InfoRow label="高度">
          {altM.toLocaleString()} m ({altFt.toLocaleString()} ft)
        </InfoRow>
        <InfoRow label="速度">
          {speedKmh.toLocaleString()} km/h ({speedKt} kt)
        </InfoRow>
        <InfoRow label="方位">{Math.round(data.heading ?? 0)}°</InfoRow>
        <InfoRow label="状態">{vrLabel}</InfoRow>
        <InfoRow label="登録国">{data.originCountry}</InfoRow>
      </div>

      <div className="flex flex-col gap-1 pt-1">
        <LinkButton
          href={`https://www.flightradar24.com/${data.callsign?.trim()}`}
          label="Flightradar24で追跡"
          color="text-yellow-400"
        />
        <LinkButton
          href={`https://www.google.com/maps/@${data.latitude},${data.longitude},10z`}
          label="Google Mapsで見る"
          color="text-blue-400"
        />
      </div>
    </div>
  )
}

// ─── Vessel ───

function VesselDetail({ data }: { data: Vessel }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-base font-bold text-green-300">{data.name || '不明'}</span>
        <span className="text-[10px] px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded">
          {getShipTypeName(data.shipType ?? 0)}
        </span>
      </div>

      <div className="space-y-1 pt-1 border-t border-gray-700/30">
        <InfoRow label="MMSI">{data.mmsi}</InfoRow>
        <InfoRow label="速度">
          {((data.speed ?? 0) * 1.852).toFixed(1)} km/h ({(data.speed ?? 0).toFixed(1)} kt)
        </InfoRow>
        <InfoRow label="進路">{Math.round(data.course ?? 0)}°</InfoRow>
        <InfoRow label="船首方位">
          {data.heading != null && data.heading !== 511 ? `${data.heading}°` : '---'}
        </InfoRow>
        {data.destination && <InfoRow label="目的地">{data.destination}</InfoRow>}
        {data.eta && <InfoRow label="到着予定">{data.eta}</InfoRow>}
      </div>

      <div className="flex flex-col gap-1 pt-1">
        <LinkButton
          href={`https://www.marinetraffic.com/en/ais/details/ships/mmsi:${data.mmsi}`}
          label="MarineTrafficで追跡"
          color="text-green-400"
        />
        <LinkButton
          href={`https://www.google.com/maps/@${data.latitude},${data.longitude},12z`}
          label="Google Mapsで見る"
          color="text-blue-400"
        />
      </div>
    </div>
  )
}

// ─── Weather Warning ───

const LEVEL_LABELS: Record<string, { text: string; color: string }> = {
  emergency: { text: '特別警報', color: 'bg-red-900/50 text-red-300' },
  warning: { text: '警報', color: 'bg-orange-900/50 text-orange-300' },
  advisory: { text: '注意報', color: 'bg-yellow-900/50 text-yellow-300' },
}

function WarningDetail({ data }: { data: WeatherWarning }) {
  const lv = LEVEL_LABELS[data.level] ?? {
    text: data.level || '不明',
    color: 'bg-gray-800 text-gray-400',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${lv.color}`}>{lv.text}</span>
        {Array.isArray(data.types) &&
          data.types.map((t) => (
            <span key={t} className="text-xs text-gray-300 font-medium">
              {t}
            </span>
          ))}
      </div>

      <p className="text-sm text-gray-200 font-medium">{data.areaName || '不明'}</p>

      <div className="space-y-1 pt-1 border-t border-gray-700/30">
        {data.issuedAt && (
          <InfoRow label="発表日時">{new Date(data.issuedAt).toLocaleString('ja-JP')}</InfoRow>
        )}
        {data.areaCode && <InfoRow label="地域コード">{data.areaCode}</InfoRow>}
      </div>

      <div className="pt-1">
        <LinkButton
          href="https://www.jma.go.jp/bosai/warning/"
          label="気象庁 警報・注意報ページ"
          color="text-amber-400"
        />
      </div>
    </div>
  )
}

// ─── Cyber Threat ───

const SEVERITY_LABELS: Record<string, { text: string; color: string }> = {
  critical: { text: '緊急', color: 'bg-red-900/50 text-red-300' },
  high: { text: '高', color: 'bg-orange-900/50 text-orange-300' },
  medium: { text: '中', color: 'bg-yellow-900/50 text-yellow-300' },
  low: { text: '低', color: 'bg-blue-900/50 text-blue-300' },
  info: { text: '情報', color: 'bg-gray-800/50 text-gray-400' },
}

function CyberDetail({ data }: { data: CyberThreat }) {
  const sv = SEVERITY_LABELS[data.severity] ?? SEVERITY_LABELS.info

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${sv.color}`}>
          深刻度: {sv.text}
        </span>
        {data.source && <span className="text-[10px] text-gray-500 uppercase">{data.source}</span>}
      </div>

      <p className="text-xs text-gray-200 leading-relaxed">{data.title || '不明'}</p>

      {data.description && (
        <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-3">{data.description}</p>
      )}

      <div className="space-y-1 pt-1 border-t border-gray-700/30">
        {data.publishedAt && (
          <InfoRow label="公開日">{new Date(data.publishedAt).toLocaleDateString('ja-JP')}</InfoRow>
        )}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {data.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-[9px] px-1 py-px bg-gray-800 text-gray-500 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {data.link && (
        <div className="pt-1">
          <LinkButton href={data.link} label="詳細を見る" color="text-purple-400" />
        </div>
      )}
    </div>
  )
}

// ─── Data Center ───

const TIER_LABELS: Record<number, { text: string; color: string }> = {
  4: { text: 'Tier IV (最高)', color: 'bg-violet-900/50 text-violet-300' },
  3: { text: 'Tier III', color: 'bg-purple-900/50 text-purple-300' },
  2: { text: 'Tier II', color: 'bg-blue-900/50 text-blue-300' },
  1: { text: 'Tier I', color: 'bg-gray-800/50 text-gray-400' },
}

function DataCenterDetail({ data }: { data: DCPoint }) {
  const tier = TIER_LABELS[data.tier ?? 0] ?? {
    text: '不明',
    color: 'bg-gray-800/50 text-gray-400',
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-violet-200 font-bold">{data.name || '不明'}</p>

      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${tier.color}`}>
          {tier.text}
        </span>
      </div>

      <div className="space-y-1 pt-1 border-t border-gray-700/30">
        <InfoRow label="運営">{data.operator || '不明'}</InfoRow>
        {data.city && <InfoRow label="所在地">{data.city}</InfoRow>}
        <InfoRow label="座標">
          {data.latitude?.toFixed(4)}, {data.longitude?.toFixed(4)}
        </InfoRow>
      </div>

      {data.latitude != null && data.longitude != null && (
        <div className="pt-1">
          <LinkButton
            href={`https://www.google.com/maps/@${data.latitude},${data.longitude},16z`}
            label="Google Mapsで見る"
            color="text-blue-400"
          />
        </div>
      )}
    </div>
  )
}
