import type { WeatherArea, WeatherDay } from '@/types/weather'

const JMA_FORECAST_BASE = 'https://www.jma.go.jp/bosai/forecast/data/forecast'

// JMA office codes for major regions
const AREA_CODES: { code: string; label: string }[] = [
  { code: '016000', label: '北海道' },
  { code: '040000', label: '宮城' },
  { code: '130000', label: '東京' },
  { code: '150000', label: '新潟' },
  { code: '170000', label: '石川' },
  { code: '230000', label: '愛知' },
  { code: '270000', label: '大阪' },
  { code: '340000', label: '広島' },
  { code: '390000', label: '高知' },
  { code: '400000', label: '福岡' },
  { code: '460100', label: '鹿児島' },
  { code: '471000', label: '沖縄' },
]

interface JMAForecastArea {
  area: { name: string; code: string }
  weatherCodes?: string[]
  weathers?: string[]
  winds?: string[]
  pops?: string[]
  temps?: string[]
  tempsMin?: string[]
  tempsMax?: string[]
  reliabilities?: string[]
}

interface JMATimeSeries {
  timeDefines: string[]
  areas: JMAForecastArea[]
}

interface JMAForecastEntry {
  publishingOffice: string
  reportDatetime: string
  timeSeries: JMATimeSeries[]
}

function parseNum(s: string | undefined): number | null {
  if (!s || s === '' || s === '--') return null
  const n = parseInt(s, 10)
  return Number.isNaN(n) ? null : n
}

function parseWeekly(forecast: JMAForecastEntry[]): WeatherDay[] {
  if (forecast.length < 2) return []

  const weekly = forecast[1]
  const ts = weekly.timeSeries
  if (!ts || ts.length === 0) return []

  // ts[0]: weatherCodes, pops, reliabilities
  const weatherTs = ts[0]
  const weatherArea = weatherTs?.areas?.[0]
  const dates = weatherTs?.timeDefines ?? []
  const codes = weatherArea?.weatherCodes ?? []
  const pops = weatherArea?.pops ?? []
  const reliabilities = weatherArea?.reliabilities ?? []

  // ts[1]: tempsMin, tempsMax
  const tempTs = ts.length >= 2 ? ts[1] : null
  const tempArea = tempTs?.areas?.[0]
  const tempsMin = tempArea?.tempsMin ?? []
  const tempsMax = tempArea?.tempsMax ?? []

  const days: WeatherDay[] = []
  for (let i = 0; i < dates.length; i++) {
    days.push({
      date: dates[i],
      weatherCode: codes[i] ?? '',
      pop: parseNum(pops[i]),
      tempMax: parseNum(tempsMax[i]),
      tempMin: parseNum(tempsMin[i]),
      reliability: reliabilities[i] ?? '',
    })
  }

  return days
}

function parseWeatherArea(
  officeCode: string,
  label: string,
  forecast: JMAForecastEntry[],
): WeatherArea | null {
  if (!forecast || forecast.length === 0) return null

  const first = forecast[0]
  const timeSeries = first.timeSeries

  if (!timeSeries || timeSeries.length === 0) return null

  // timeSeries[0]: weather codes, descriptions, winds
  const weatherSeries = timeSeries[0]
  const weatherAreaData = weatherSeries?.areas?.[0]

  if (!weatherAreaData) return null

  const date = weatherSeries.timeDefines?.[0] ?? new Date().toISOString()
  const weatherCode = weatherAreaData.weatherCodes?.[0] ?? ''
  const weather = weatherAreaData.weathers?.[0]?.replace(/\s+/g, ' ').trim() ?? ''
  const wind = weatherAreaData.winds?.[0]?.trim() ?? ''

  // timeSeries[1]: precipitation probability (pops)
  let precipitation = 0
  if (timeSeries.length >= 2) {
    const popSeries = timeSeries[1]
    const popAreaData = popSeries?.areas?.[0]
    const pops = popAreaData?.pops ?? []
    const precipitationStr = pops.find((p) => p !== '' && p !== '--') ?? '0'
    precipitation = parseInt(precipitationStr, 10)
  }

  // timeSeries[2]: temperatures (min, max)
  let tempMin: number | null = null
  let tempMax: number | null = null

  if (timeSeries.length >= 3) {
    const tempSeries = timeSeries[2]
    const tempAreaData = tempSeries?.areas?.[0]
    const temps = tempAreaData?.temps ?? []

    if (temps.length >= 2) {
      tempMin = parseNum(temps[0])
      tempMax = parseNum(temps[1])
    } else if (temps.length === 1) {
      tempMax = parseNum(temps[0])
    }
  }

  // Parse weekly forecast from forecast[1]
  const weekly = parseWeekly(forecast)

  return {
    code: officeCode,
    name: weatherAreaData.area?.name ?? label,
    weather,
    weatherCode,
    tempMax,
    tempMin,
    precipitation: Number.isNaN(precipitation) ? 0 : precipitation,
    wind,
    date,
    weekly,
  }
}

export async function fetchWeatherData(): Promise<WeatherArea[]> {
  const results = await Promise.allSettled(
    AREA_CODES.map(async ({ code, label }) => {
      const url = `${JMA_FORECAST_BASE}/${code}.json`
      const res = await fetch(url, {
        next: { revalidate: 0 },
        headers: { Accept: 'application/json' },
      })

      if (!res.ok) {
        throw new Error(`JMA forecast fetch failed for ${code}: ${res.status}`)
      }

      const forecast: JMAForecastEntry[] = await res.json()
      const area = parseWeatherArea(code, label, forecast)

      if (!area) {
        throw new Error(`Failed to parse forecast data for ${code}`)
      }

      return area
    }),
  )

  const areas: WeatherArea[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      areas.push(result.value)
    }
  }

  return areas
}
