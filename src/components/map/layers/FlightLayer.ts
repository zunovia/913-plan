import { ScatterplotLayer } from '@deck.gl/layers'
import type { Flight } from '@/types/flight'

export function createFlightLayer(data: Flight[], visible: boolean) {
  return new ScatterplotLayer<Flight>({
    id: 'flight-layer',
    data: data.filter((f) => !f.onGround),
    visible,
    pickable: true,
    opacity: 0.9,
    filled: true,
    radiusMinPixels: 3,
    radiusMaxPixels: 6,
    getPosition: (d) => [d.longitude, d.latitude],
    getRadius: 3,
    getFillColor: [0, 180, 255, 200],
    updateTriggers: {
      getPosition: data.length,
    },
  })
}
