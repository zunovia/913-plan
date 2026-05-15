import { ScatterplotLayer } from '@deck.gl/layers'

interface DCPoint {
  name: string
  operator: string
  longitude: number
  latitude: number
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
    radiusMaxPixels: 12,
    getPosition: (d) => [d.longitude, d.latitude],
    getRadius: 8,
    getFillColor: [140, 80, 255, 200],
    getLineColor: [255, 255, 255, 150],
    lineWidthMinPixels: 1,
  })
}
