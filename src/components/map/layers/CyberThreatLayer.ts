import { HeatmapLayer } from '@deck.gl/aggregation-layers'

interface ThreatPoint {
  longitude: number
  latitude: number
  weight: number
}

export function createCyberThreatLayer(data: ThreatPoint[], visible: boolean) {
  return new HeatmapLayer<ThreatPoint>({
    id: 'cyber-threat-layer',
    data,
    visible,
    pickable: false,
    getPosition: (d) => [d.longitude, d.latitude],
    getWeight: (d) => d.weight,
    radiusPixels: 60,
    intensity: 1,
    threshold: 0.05,
    colorRange: [
      [65, 182, 196],
      [127, 205, 187],
      [199, 233, 180],
      [237, 248, 177],
      [255, 255, 204],
      [255, 237, 160],
    ],
  })
}
