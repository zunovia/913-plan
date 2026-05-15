import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const runtime = 'edge'

interface VesselCache {
  data: unknown[]
  count: number
  updatedAt: string
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export async function GET() {
  const redis = getRedis()
  if (!redis) {
    return NextResponse.json(
      { data: [], count: 0, updatedAt: null, note: 'Redis not configured' },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=120' } },
    )
  }

  try {
    const cached = await redis.get<string>('vessels:japan')
    if (cached) {
      const parsed: VesselCache = typeof cached === 'string' ? JSON.parse(cached) : cached
      return NextResponse.json(
        {
          data: parsed.data,
          count: parsed.count,
          updatedAt: parsed.updatedAt,
        },
        {
          headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
        },
      )
    }
  } catch (err) {
    console.error('Redis read error:', err)
  }

  return NextResponse.json(
    {
      data: [],
      count: 0,
      updatedAt: null,
      note: 'No vessel data available yet. Worker may not have run.',
    },
    {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
    },
  )
}
