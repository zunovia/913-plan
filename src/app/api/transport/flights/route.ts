import { NextResponse } from 'next/server'
import { fetchFlights } from '@/lib/api/opensky'
import { cachedFetch } from '@/lib/cache/redis'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const flights = await cachedFetch('transport:flights', 15, fetchFlights)
    return NextResponse.json({
      data: flights,
      count: flights.length,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Flights API error:', error)
    return NextResponse.json({ data: [], error: 'Failed to fetch flights' }, { status: 500 })
  }
}
