import { NextResponse } from 'next/server'
import { cachedFetch } from '@/lib/cache/redis'
import { getAreaCoords } from '@/lib/geo/prefecture-coords'
import type { WeatherWarning } from '@/types/warning'
import { ACTIVE_STATUSES, WARNING_CODE_MAP } from '@/types/warning'

export const runtime = 'nodejs'

const JMA_WARNING_MAP_URL = 'https://www.jma.go.jp/bosai/warning/data/warning/map.json'
const JMA_AREA_URL = 'https://www.jma.go.jp/bosai/common/const/area.json'

interface JmaWarningEntry {
  code: string
  status: string
}

interface JmaArea {
  code: string
  warnings?: JmaWarningEntry[]
}

interface JmaAreaType {
  areas: JmaArea[]
}

interface JmaMapItem {
  reportDatetime: string
  areaTypes: JmaAreaType[]
}

interface JmaAreaInfo {
  name: string
  enName?: string
  parent?: string
}

interface JmaAreaJson {
  offices: Record<string, JmaAreaInfo>
  class10s: Record<string, JmaAreaInfo>
  class15s?: Record<string, JmaAreaInfo>
  class20s?: Record<string, JmaAreaInfo>
}

async function fetchWarnings(): Promise<WeatherWarning[]> {
  const [mapRes, areaRes] = await Promise.all([
    fetch(JMA_WARNING_MAP_URL, { next: { revalidate: 300 } }),
    fetch(JMA_AREA_URL, { next: { revalidate: 86400 } }),
  ])

  if (!mapRes.ok) {
    throw new Error(`JMA map.json fetch failed: ${mapRes.status}`)
  }
  if (!areaRes.ok) {
    throw new Error(`JMA area.json fetch failed: ${areaRes.status}`)
  }

  const mapData: JmaMapItem[] = await mapRes.json()
  const areaData: JmaAreaJson = await areaRes.json()

  // area名前ルックアップ: offices + class10s を合成
  const areaNameMap: Record<string, string> = {}
  for (const [code, info] of Object.entries(areaData.offices ?? {})) {
    areaNameMap[code] = info.name
  }
  for (const [code, info] of Object.entries(areaData.class10s ?? {})) {
    areaNameMap[code] = info.name
  }

  // areaCode -> WeatherWarning にまとめる
  // map.jsonは複数のreport(item)があり、同一エリアが複数reportに登場する
  // 最新reportDatetime優先でマージする
  const warningMap = new Map<string, { warning: WeatherWarning; dt: string }>()

  for (const item of mapData) {
    const reportDatetime = item.reportDatetime ?? ''

    // areaTypes[0] が一次細分区域(6桁)レベル
    const primaryAreas = item.areaTypes?.[0]?.areas ?? []

    for (const area of primaryAreas) {
      const areaCode = area.code
      if (!areaCode || !area.warnings) continue

      // アクティブな警報コードを収集
      const activeWarningCodes: string[] = []
      for (const w of area.warnings) {
        if (ACTIVE_STATUSES.includes(w.status)) {
          activeWarningCodes.push(w.code)
        }
      }
      if (activeWarningCodes.length === 0) continue

      // 最高レベルを決定: emergency > warning > advisory
      let level: 'advisory' | 'warning' | 'emergency' = 'advisory'
      const types: string[] = []

      for (const wcode of activeWarningCodes) {
        const def = WARNING_CODE_MAP[wcode]
        if (!def) continue
        types.push(def.name)
        if (def.level === 'emergency') {
          level = 'emergency'
        } else if (def.level === 'warning' && level !== 'emergency') {
          level = 'warning'
        }
      }

      if (types.length === 0) continue

      const coords = getAreaCoords(areaCode)
      if (!coords) continue

      const areaName = areaNameMap[areaCode] ?? areaCode

      const existing = warningMap.get(areaCode)
      // より新しいreportDatetimeで上書き、またはlevelが高い場合も更新
      if (!existing || reportDatetime > existing.dt) {
        warningMap.set(areaCode, {
          warning: {
            areaCode,
            areaName,
            level,
            types: [...new Set(types)],
            issuedAt: reportDatetime,
            latitude: coords[1],
            longitude: coords[0],
          },
          dt: reportDatetime,
        })
      }
    }
  }

  return Array.from(warningMap.values()).map((v) => v.warning)
}

export async function GET() {
  try {
    const warnings = await cachedFetch<WeatherWarning[]>('warnings:jma', 300, fetchWarnings)

    return NextResponse.json({
      data: warnings,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Weather warnings API error:', error)
    return NextResponse.json(
      { data: [], updatedAt: new Date().toISOString(), error: 'Failed to fetch weather warnings' },
      { status: 500 },
    )
  }
}
