import type { Flight } from '@/types/flight'

// adsb.lol — free, no-auth ADS-B aggregator API
// Covers Japan area using center point + radius (nautical miles)
const ADSB_LOL_API = 'https://api.adsb.lol/v2'
const JAPAN_CENTER = { lat: 36.5, lon: 138.0 }
const RADIUS_NM = 600 // ~1100km covers all of Japan

export async function fetchFlights(): Promise<Flight[]> {
  const url = `${ADSB_LOL_API}/lat/${JAPAN_CENTER.lat}/lon/${JAPAN_CENTER.lon}/dist/${RADIUS_NM}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) {
      console.error(`adsb.lol API returned ${res.status}: ${res.statusText}`)
      return []
    }

    const data = await res.json()
    const aircraft = data.ac as Record<string, unknown>[] | undefined
    if (!aircraft) return []

    return aircraft
      .filter((a) => a.lat != null && a.lon != null && !a.ground)
      .map((a) => ({
        icao24: (a.hex as string) ?? '',
        callsign: ((a.flight as string) ?? '').trim(),
        originCountry: (a.r as string) ?? '',
        longitude: a.lon as number,
        latitude: a.lat as number,
        altitude: ((a.alt_geom as number) ?? (a.alt_baro as number) ?? 0) * 0.3048, // ft → m
        velocity: ((a.gs as number) ?? 0) * 0.5144, // knots → m/s
        heading: (a.track as number) ?? (a.true_heading as number) ?? 0,
        verticalRate: ((a.baro_rate as number) ?? 0) * 0.00508, // ft/min → m/s
        onGround: false,
        lastContact: Math.floor(Date.now() / 1000) - ((a.seen as number) ?? 0),
      }))
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.error('adsb.lol API request timed out')
    } else {
      console.error('adsb.lol API error:', err)
    }
    return []
  }
}
