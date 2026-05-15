import { NextResponse } from 'next/server'
import { fetchWeatherData } from '@/lib/api/jma-weather'
import { cachedFetch } from '@/lib/cache/redis'
import type { WeatherArea } from '@/types/weather'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const areas = await cachedFetch<WeatherArea[]>('weather:forecast', 1800, () =>
      fetchWeatherData(),
    )

    return NextResponse.json({
      data: areas,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { data: [], updatedAt: new Date().toISOString(), error: 'Failed to fetch weather data' },
      { status: 500 },
    )
  }
}
