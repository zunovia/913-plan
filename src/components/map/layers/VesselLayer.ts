import { ScatterplotLayer } from '@deck.gl/layers'
import type { Vessel } from '@/types/vessel'

export function createVesselLayer(data: Vessel[], visible: boolean) {
  return new ScatterplotLayer<Vessel>({
    id: 'vessel-layer',
    data,
    visible,
    pickable: true,
    opacity: 0.8,
    filled: true,
    radiusMinPixels: 3,
    radiusMaxPixels: 8,
    getPosition: (d) => [d.longitude, d.latitude],
    getRadius: 4,
    getFillColor: [0, 200, 120, 180],
    updateTriggers: {
      getPosition: data.length,
    },
  })
}
