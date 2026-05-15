import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature, FeatureCollection } from 'geojson'

export function createWeatherLayer(data: FeatureCollection | Feature | null | undefined, visible: boolean) {
  return new GeoJsonLayer({
    id: 'weather-layer',
    data: data ?? ({ type: 'FeatureCollection', features: [] } as FeatureCollection),
    visible,
    pickable: true,
    stroked: true,
    filled: true,
    lineWidthMinPixels: 2,
    getFillColor: [255, 200, 0, 40],
    getLineColor: [255, 200, 0, 180],
    getLineWidth: 2,
  })
}
