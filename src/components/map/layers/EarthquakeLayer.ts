import { ScatterplotLayer } from '@deck.gl/layers'
import { magnitudeToColor, magnitudeToRadius } from '@/lib/geo/intensity-scale'
import type { Earthquake } from '@/types/earthquake'

export function createEarthquakeLayer(data: Earthquake[], visible: boolean) {
  return new ScatterplotLayer<Earthquake>({
    id: 'earthquake-layer',
    data,
    visible,
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 1000,
    radiusMinPixels: 4,
    radiusMaxPixels: 40,
    lineWidthMinPixels: 1,
    getPosition: (d) => [d.longitude, d.latitude],
    getRadius: (d) => magnitudeToRadius(d.magnitude),
    getFillColor: (d) => magnitudeToColor(d.magnitude),
    getLineColor: [255, 255, 255, 100],
    updateTriggers: {
      getPosition: data.length,
      getRadius: data.length,
      getFillColor: data.length,
    },
  })
}
