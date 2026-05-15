import { ScatterplotLayer } from '@deck.gl/layers'

export interface DCPoint {
  name: string
  operator: string
  longitude: number
  latitude: number
  city?: string
  tier?: number
}

const TIER_COLOR: Record<number, [number, number, number, number]> = {
  4: [200, 50, 255, 230],   // Tier 4: bright purple
  3: [140, 80, 255, 200],   // Tier 3: purple
  2: [100, 120, 220, 180],  // Tier 2: blue-purple
}

export function createDataCenterLayer(data: DCPoint[], visible: boolean) {
  return new ScatterplotLayer<DCPoint>({
    id: 'datacenter-layer',
    data,
    visible,
    pickable: true,
    opacity: 0.9,
    filled: true,
    stroked: true,
    radiusMinPixels: 6,
    radiusMaxPixels: 14,
    getPosition: (d) => [d.longitude, d.latitude],
    getRadius: (d) => (d.tier === 4 ? 10 : 8),
    getFillColor: (d) => TIER_COLOR[d.tier ?? 3] ?? TIER_COLOR[3],
    getLineColor: [255, 255, 255, 150],
    lineWidthMinPixels: 1,
  })
}
