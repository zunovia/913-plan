import { NextResponse } from 'next/server'
import { fetchVesselSnapshot } from '@/lib/api/aisstream'
import { cachedFetch } from '@/lib/cache/redis'
import type { Vessel } from '@/types/vessel'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET() {
  const apiKey = process.env.AISSTREAM_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      data: [],
      count: 0,
      updatedAt: new Date().toISOString(),
      error: 'AISSTREAM_API_KEY not configured',
    })
  }

  try {
    // Vercel Hobby plan: max 10s function execution
    // Allow ~5s for WS connect + collect, leaving margin for overhead
    const vessels = await cachedFetch<Vessel[]>('vessels:japan', 120, () =>
      fetchVesselSnapshot(apiKey, 5_000, 200),
    )

    const res = NextResponse.json({
      data: vessels,
      count: vessels.length,
      updatedAt: new Date().toISOString(),
    })
    res.headers.set('Cache-Control', 's-maxage=120, stale-while-revalidate=300')
    return res
  } catch (error) {
    console.error('Vessel API error:', error)
    return NextResponse.json(
      {
        data: [],
        count: 0,
        updatedAt: new Date().toISOString(),
        error: 'Failed to fetch vessel data',
      },
      { status: 500 },
    )
  }
}
