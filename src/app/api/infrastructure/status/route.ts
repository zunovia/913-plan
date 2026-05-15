import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextResponse } from 'next/server'
import type { PowerGridStatus } from '@/lib/api/power'
import { fetchPowerGrid } from '@/lib/api/power'
import { cachedFetch } from '@/lib/cache/redis'

export const runtime = 'nodejs'

async function readGeoJsonCount(filename: string): Promise<number> {
  try {
    const filePath = join(process.cwd(), 'public', 'geojson', filename)
    const raw = await readFile(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    // Support both plain arrays and GeoJSON FeatureCollection
    if (Array.isArray(parsed)) return parsed.length
    if (Array.isArray(parsed?.features)) return parsed.features.length
    return 0
  } catch {
    return 0
  }
}

export async function GET() {
  try {
    const [powerGrid, submarineCables, dataCenters] = await Promise.all([
      cachedFetch<PowerGridStatus[]>('infra:power-grid', 300, fetchPowerGrid),
      readGeoJsonCount('submarine-cables.json'),
      readGeoJsonCount('data-centers.json'),
    ])

    return NextResponse.json({
      powerGrid,
      submarineCables,
      dataCenters,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Infrastructure status API error:', error)
    return NextResponse.json(
      {
        powerGrid: [],
        submarineCables: 0,
        dataCenters: 0,
        updatedAt: new Date().toISOString(),
        error: 'Failed to fetch infrastructure status',
      },
      { status: 500 },
    )
  }
}
