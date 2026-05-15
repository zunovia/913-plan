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
    getFillColor: [80, 80, 120, 15],
    getLineColor: [150, 150, 200, 100],
    getLineWidth: 1,
    autoHighlight: true,
    highlightColor: [100, 150, 255, 60],
  })
}
