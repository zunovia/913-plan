import { JAPAN_BOUNDS } from '@/lib/geo/japan-bounds'
import type { Flight } from '@/types/flight'

const OPENSKY_API = 'https://opensky-network.org/api'

export async function fetchFlights(): Promise<Flight[]> {
  const { south, north, west, east } = JAPAN_BOUNDS
  const url = `${OPENSKY_API}/states/all?lamin=${south}&lomin=${west}&lamax=${north}&lomax=${east}`

  // Build headers with optional authentication
  const headers: Record<string, string> = {}
  const user = process.env.OPENSKY_USERNAME
  const pass = process.env.OPENSKY_PASSWORD
  if (user && pass) {
    headers.Authorization = `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers,
      next: { revalidate: 60 },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      console.error(`OpenSky API returned ${res.status}: ${res.statusText}`)
      return []
    }
    const data = await res.json()

    if (!data.states) return []

    return data.states
      .map((s: (string | number | boolean | null)[]) => ({
        icao24: s[0] as string,
        callsign: (s[1] as string)?.trim() ?? '',
        originCountry: s[2] as string,
        longitude: s[5] as number,
        latitude: s[6] as number,
        altitude: s[7] as number,
        velocity: s[9] as number,
        heading: s[10] as number,
        verticalRate: s[11] as number,
        onGround: s[8] as boolean,
        lastContact: s[4] as number,
      }))
      .filter((f: Flight) => f.latitude && f.longitude)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.error('OpenSky API request timed out')
    } else {
      console.error('OpenSky API error:', err)
    }
    return []
  }
}
