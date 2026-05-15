import { NextResponse } from 'next/server'
import { fetchFlights } from '@/lib/api/opensky'
import { cachedFetch } from '@/lib/cache/redis'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const flights = await cachedFetch('transport:flights', 60, fetchFlights)
    const res = NextResponse.json({
      data: flights,
      count: flights.length,
      updatedAt: new Date().toISOString(),
    })
    // CDN cache: serve stale while revalidating, max 60s fresh + 120s stale
    res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    return res
  } catch (error) {
    console.error('Flights API error:', error)
    return NextResponse.json({ data: [], error: 'Failed to fetch flights' }, { status: 500 })
  }
}
