import { isInJapanBounds } from '@/lib/geo/japan-bounds'
import type { Earthquake, USGSResponse } from '@/types/earthquake'

const USGS_API = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary'

export async function fetchUSGSEarthquakes(
  period: 'hour' | 'day' | 'week' = 'week',
  minMag = 2.5,
): Promise<Earthquake[]> {
  const file = `${minMag}_${period}.geojson`
  const res = await fetch(`${USGS_API}/${file}`, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`USGS API error: ${res.status}`)
  const data: USGSResponse = await res.json()

  return data.features
    .filter((f) => {
      const [lon, lat] = f.geometry.coordinates
      return isInJapanBounds(lat, lon)
    })
    .map((f) => ({
      id: f.id,
      time: new Date(f.properties.time).toISOString(),
      longitude: f.geometry.coordinates[0],
      latitude: f.geometry.coordinates[1],
      depth: f.geometry.coordinates[2],
      magnitude: f.properties.mag,
      place: f.properties.place,
      source: 'usgs' as const,
      tsunami: f.properties.tsunami > 0,
    }))
}
