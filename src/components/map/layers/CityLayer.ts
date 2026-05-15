import { ScatterplotLayer, TextLayer } from '@deck.gl/layers'
import type { City } from '@/lib/geo/cities'
import { getLocalTime, WORLD_CITIES } from '@/lib/geo/cities'

const WORLD_CITY_SET = new Set(WORLD_CITIES.map((c) => c.nameEn))

export function createCityDotLayer(data: City[], visible: boolean) {
  return new ScatterplotLayer<City>({
    id: 'city-dot-layer',
    data,
    visible,
    pickable: true,
    opacity: 0.9,
    filled: true,
    stroked: true,
    radiusMinPixels: 3,
    radiusMaxPixels: 10,
    getPosition: (d) => [d.longitude, d.latitude],
    getRadius: (d) => Math.sqrt(d.population) * 0.3,
    getFillColor: [255, 255, 255, 180],
    getLineColor: [100, 160, 255, 200],
    lineWidthMinPixels: 1,
    radiusScale: 10,
  })
}

export function createCityLabelLayer(data: City[], visible: boolean) {
  return new TextLayer<City>({
    id: 'city-label-layer',
    data,
    visible,
    pickable: true,
    getPosition: (d) => [d.longitude, d.latitude],
    getText: (d) => d.name,
    getSize: (d) => {
      if (d.population >= 5000000) return 14
      if (d.population >= 1000000) return 12
      return 10
    },
    getColor: [255, 255, 255, 220],
    getTextAnchor: 'start' as const,
    getAlignmentBaseline: 'center' as const,
    getPixelOffset: [8, 0],
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 600,
    outlineWidth: 2,
    outlineColor: [0, 0, 0, 200],
    billboard: true,
    sizeMinPixels: 8,
    sizeMaxPixels: 16,
  })
}

/**
 * World city time label layer - shows current local time below city name.
 * `tick` parameter forces re-creation when time updates.
 */
export function createWorldCityTimeLayer(data: City[], visible: boolean, _tick: number) {
  const worldCities = data.filter((c) => !!c.timezone && WORLD_CITY_SET.has(c.nameEn))

  return new TextLayer<City>({
    id: 'world-city-time-layer',
    data: worldCities,
    visible,
    pickable: false,
    getPosition: (d) => [d.longitude, d.latitude],
    getText: (d) => getLocalTime(d),
    getSize: 11,
    getColor: [100, 200, 255, 220],
    getTextAnchor: 'start' as const,
    getAlignmentBaseline: 'center' as const,
    getPixelOffset: [8, 16],
    fontFamily: 'monospace',
    fontWeight: 700,
    outlineWidth: 2,
    outlineColor: [0, 0, 0, 220],
    billboard: true,
    sizeMinPixels: 9,
    sizeMaxPixels: 13,
    updateTriggers: {
      getText: _tick,
    },
  })
}
