import { getIntensityLabel } from '@/lib/geo/intensity-scale'
import type { Earthquake, P2PEarthquake } from '@/types/earthquake'

const P2P_API = 'https://api.p2pquake.net/v2'

export async function fetchP2PEarthquakes(limit = 50): Promise<Earthquake[]> {
  const res = await fetch(`${P2P_API}/history?codes=551&limit=${limit}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`P2P API error: ${res.status}`)
  const data: P2PEarthquake[] = await res.json()

  return data
    .filter((d) => d.earthquake?.hypocenter?.latitude !== -200)
    .map((d) => ({
      id: d.id,
      time: d.earthquake.time,
      latitude: d.earthquake.hypocenter.latitude,
      longitude: d.earthquake.hypocenter.longitude,
      depth: d.earthquake.hypocenter.depth,
      magnitude: d.earthquake.hypocenter.magnitude,
      place: d.earthquake.hypocenter.name,
      intensity: getIntensityLabel(d.earthquake.maxScale),
      source: 'p2p' as const,
      tsunami: d.earthquake.domesticTsunami !== 'None',
    }))
}
