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
    const vessels = await cachedFetch<Vessel[]>('vessels:japan', 30, () =>
      fetchVesselSnapshot(apiKey, 10_000, 200),
    )

    return NextResponse.json({
      data: vessels,
      count: vessels.length,
      updatedAt: new Date().toISOString(),
    })
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
