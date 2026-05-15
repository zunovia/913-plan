import { GeoJsonLayer } from '@deck.gl/layers'
import type { Feature, FeatureCollection } from 'geojson'

export function createPrefectureLayer(
  data: FeatureCollection | Feature | null | undefined,
  visible: boolean,
) {
  return new GeoJsonLayer({
    id: 'prefecture-layer',
    data: data ?? ({ type: 'FeatureCollection', features: [] } as FeatureCollection),
    visible,
    pickable: true,
    stroked: true,
    filled: true,
    lineWidthMinPixels: 1,
    getFillColor: [100, 100, 100, 20],
    getLineColor: [200, 200, 200, 80],
    getLineWidth: 1,
  })
}
