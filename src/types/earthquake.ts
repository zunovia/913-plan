export interface Earthquake {
  id: string
  time: string
  latitude: number
  longitude: number
  depth: number
  magnitude: number
  place: string
  intensity?: string // JMA intensity scale
  source: 'p2p' | 'usgs'
  tsunami?: boolean
}

export interface P2PEarthquake {
  id: string
  code: number
  time: string
  issue: { source: string; time: string; type: string }
  earthquake: {
    time: string
    hypocenter: {
      name: string
      latitude: number
      longitude: number
      depth: number
      magnitude: number
    }
    maxScale: number
    domesticTsunami: string
  }
  points?: Array<{ pref: string; addr: string; isArea: boolean; scale: number }>
}

export interface USGSFeature {
  type: 'Feature'
  properties: {
    mag: number
    place: string
    time: number
    tsunami: number
    title: string
  }
  geometry: { type: 'Point'; coordinates: [number, number, number] }
  id: string
}

export interface USGSResponse {
  type: 'FeatureCollection'
  features: USGSFeature[]
}
