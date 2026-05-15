import { magnitudeToColor, magnitudeToRadius } from '@/lib/geo/intensity-scale'
import type { Earthquake } from '@/types/earthquake'

export function earthquakeToScatterData(earthquakes: Earthquake[]) {
  return earthquakes.map((eq) => ({
    position: [eq.longitude, eq.latitude] as [number, number],
    radius: magnitudeToRadius(eq.magnitude),
    color: magnitudeToColor(eq.magnitude),
    ...eq,
  }))
}

export function filterEarthquakesByTime(
  earthquakes: Earthquake[],
  range: '1h' | '6h' | '24h' | '7d' | '30d',
): Earthquake[] {
  const now = Date.now()
  const msMap: Record<string, number> = {
    '1h': 3600000,
    '6h': 21600000,
    '24h': 86400000,
    '7d': 604800000,
    '30d': 2592000000,
  }
  const cutoff = now - (msMap[range] ?? msMap['24h'])
  return earthquakes.filter((eq) => new Date(eq.time).getTime() >= cutoff)
}

export function deduplicateEarthquakes(p2p: Earthquake[], usgs: Earthquake[]): Earthquake[] {
  const seen = new Map<string, Earthquake>()

  // P2P data takes priority for Japan
  for (const eq of p2p) {
    const key = `${Math.round(eq.latitude * 10)}-${Math.round(eq.longitude * 10)}-${Math.round(new Date(eq.time).getTime() / 60000)}`
    seen.set(key, eq)
  }

  for (const eq of usgs) {
    const key = `${Math.round(eq.latitude * 10)}-${Math.round(eq.longitude * 10)}-${Math.round(new Date(eq.time).getTime() / 60000)}`
    if (!seen.has(key)) {
      seen.set(key, eq)
    }
  }

  return Array.from(seen.values()).sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
  )
}
