import { NextResponse } from 'next/server'
import { cachedFetch } from '@/lib/cache/redis'
import { fetchP2PEarthquakes } from '@/lib/api/p2p-earthquake'
import { fetchUSGSEarthquakes } from '@/lib/api/usgs'
import { deduplicateEarthquakes } from '@/lib/transform/earthquake'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const earthquakes = await cachedFetch('earthquakes:combined', 60, async () => {
      const [p2p, usgs] = await Promise.all([
        fetchP2PEarthquakes().catch(() => []),
        fetchUSGSEarthquakes().catch(() => []),
      ])
      return deduplicateEarthquakes(p2p, usgs)
    })

    return NextResponse.json({ data: earthquakes, updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Earthquake API error:', error)
    return NextResponse.json({ data: [], error: 'Failed to fetch earthquakes' }, { status: 500 })
  }
}
