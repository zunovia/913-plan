import type { Flight } from '@/types/flight'
import { JAPAN_BOUNDS } from '@/lib/geo/japan-bounds'

const OPENSKY_API = 'https://opensky-network.org/api'

export async function fetchFlights(): Promise<Flight[]> {
  const { south, north, west, east } = JAPAN_BOUNDS
  const url = `${OPENSKY_API}/states/all?lamin=${south}&lomin=${west}&lamax=${north}&lomax=${east}`

  try {
    const res = await fetch(url, { next: { revalidate: 15 } })
    if (!res.ok) return []
    const data = await res.json()

    if (!data.states) return []

    return data.states.map((s: (string | number | boolean | null)[]) => ({
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
    })).filter((f: Flight) => f.latitude && f.longitude)
  } catch {
    return []
  }
}
