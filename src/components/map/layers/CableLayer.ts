import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature, FeatureCollection } from 'geojson'

export function createCableLayer(data: FeatureCollection | Feature | null | undefined, visible: boolean) {
  return new GeoJsonLayer({
    id: 'cable-layer',
    data: data ?? ({ type: 'FeatureCollection', features: [] } as FeatureCollection),
    visible,
    pickable: true,
    stroked: true,
    filled: false,
    lineWidthMinPixels: 2,
    getLineColor: [100, 200, 255, 160],
    getLineWidth: 2,
  })
}
