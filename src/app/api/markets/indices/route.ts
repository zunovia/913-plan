import { NextResponse } from 'next/server'
import { cachedFetch } from '@/lib/cache/redis'
import { fetchMarketData } from '@/lib/api/market'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const data = await cachedFetch('markets:data', 60, fetchMarketData)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Market API error:', error)
    return NextResponse.json({ data: null, error: 'Failed to fetch market data' }, { status: 500 })
  }
}
