export const JAPAN_BOUNDS = {
  north: 45.7,
  south: 24.0,
  west: 122.0,
  east: 154.0,
}

export const JAPAN_CENTER = {
  longitude: 137.0,
  latitude: 38.0,
}

export const JAPAN_BBOX = `${JAPAN_BOUNDS.west},${JAPAN_BOUNDS.south},${JAPAN_BOUNDS.east},${JAPAN_BOUNDS.north}`

export function isInJapanBounds(lat: number, lon: number): boolean {
  return (
    lat >= JAPAN_BOUNDS.south &&
    lat <= JAPAN_BOUNDS.north &&
    lon >= JAPAN_BOUNDS.west &&
    lon <= JAPAN_BOUNDS.east
  )
}
