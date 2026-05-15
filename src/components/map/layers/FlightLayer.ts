import { IconLayer } from '@deck.gl/layers'
import type { Flight } from '@/types/flight'

// Airplane silhouette as a white mask — getColor controls the actual color
const AIRPLANE_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">' +
    '<g transform="translate(32,32)">' +
    '<path d="M0,-26 C2.5,-24 2.5,-6 2.5,2 L2.5,14 L0,18 L-2.5,14 L-2.5,2 C-2.5,-6 -2.5,-24 0,-26Z" fill="#FFFFFF"/>' +
    '<path d="M2.5,-1 L22,6 L22,8.5 L2.5,4Z" fill="#FFFFFF"/>' +
    '<path d="M-2.5,-1 L-22,6 L-22,8.5 L-2.5,4Z" fill="#FFFFFF"/>' +
    '<path d="M2.5,12 L9,18 L9,20 L2.5,16Z" fill="#FFFFFF"/>' +
    '<path d="M-2.5,12 L-9,18 L-9,20 L-2.5,16Z" fill="#FFFFFF"/>' +
    '</g></svg>',
)}`

const ICON_MAPPING = {
  airplane: { x: 0, y: 0, width: 64, height: 64, anchorY: 32, mask: true },
}

// Altitude-based color (Flightradar24 style gradient)
export function getAltitudeColor(alt: number): [number, number, number, number] {
  if (alt < 1000) return [0, 200, 80, 240]
  if (alt < 3000) return [80, 220, 120, 240]
  if (alt < 6000) return [255, 220, 0, 240]
  if (alt < 9000) return [255, 160, 0, 240]
  if (alt < 11000) return [255, 80, 40, 240]
  return [200, 60, 200, 240]
}

// Selected highlight color — bright cyan with glow effect
const SELECTED_COLOR: [number, number, number, number] = [0, 240, 255, 255]

// Altitude label for display
export function getAltitudeLabel(alt: number): string {
  if (alt < 1000) return '地上付近'
  if (alt < 3000) return '低空'
  if (alt < 6000) return '中低空'
  if (alt < 9000) return '中高空'
  if (alt < 11000) return '高空'
  return '超高空'
}

/**
 * Interpolated flight data for smooth animation.
 */
const prevPositions = new Map<string, { lng: number; lat: number; heading: number; ts: number }>()

function interpolateFlights(flights: Flight[]): Flight[] {
  const now = Date.now()

  const result = flights.map((f) => {
    const prev = prevPositions.get(f.icao24)

    if (!prev) {
      prevPositions.set(f.icao24, {
        lng: f.longitude,
        lat: f.latitude,
        heading: f.heading,
        ts: now,
      })
      return f
    }

    const elapsed = (now - prev.ts) / 1000
    if (elapsed < 0.5) return f

    prevPositions.set(f.icao24, { lng: f.longitude, lat: f.latitude, heading: f.heading, ts: now })

    return f
  })

  if (prevPositions.size > 500) {
    const keys = Array.from(prevPositions.keys())
    const activeIds = new Set(flights.map((f) => f.icao24))
    for (const k of keys) {
      if (!activeIds.has(k)) prevPositions.delete(k)
    }
  }

  return result
}

export function createFlightLayer(data: Flight[], visible: boolean, selectedId?: string) {
  const airborne = interpolateFlights(data.filter((f) => !f.onGround))

  const layers = [
    new IconLayer<Flight>({
      id: 'flight-layer',
      data: airborne,
      visible,
      pickable: true,
      iconAtlas: AIRPLANE_SVG,
      iconMapping: ICON_MAPPING,
      getIcon: () => 'airplane',
      getPosition: (d) => [d.longitude, d.latitude],
      getSize: 24,
      getAngle: (d) => 360 - (d.heading ?? 0),
      sizeMinPixels: 14,
      sizeMaxPixels: 40,
      billboard: false,
      getColor: (d) =>
        selectedId === d.icao24 ? SELECTED_COLOR : getAltitudeColor(d.altitude ?? 0),

      transitions: {
        getPosition: 14000,
        getAngle: 5000,
      },

      updateTriggers: {
        getPosition: airborne
          .map((f) => `${f.icao24}:${f.longitude.toFixed(4)}:${f.latitude.toFixed(4)}`)
          .join('|'),
        getAngle: airborne.map((f) => `${f.icao24}:${f.heading?.toFixed(1)}`).join('|'),
        getColor: selectedId ?? '',
      },
    }),
  ]

  // Larger glow ring behind the selected flight
  if (selectedId && visible) {
    const selected = airborne.filter((f) => f.icao24 === selectedId)
    if (selected.length > 0) {
      layers.unshift(
        new IconLayer<Flight>({
          id: 'flight-highlight-layer',
          data: selected,
          visible: true,
          pickable: false,
          iconAtlas: AIRPLANE_SVG,
          iconMapping: ICON_MAPPING,
          getIcon: () => 'airplane',
          getPosition: (d) => [d.longitude, d.latitude],
          getSize: 44,
          getAngle: (d) => 360 - (d.heading ?? 0),
          sizeMinPixels: 28,
          sizeMaxPixels: 60,
          billboard: false,
          getColor: [0, 240, 255, 80],
          updateTriggers: {
            getPosition: selected
              .map((f) => `${f.icao24}:${f.longitude.toFixed(4)}:${f.latitude.toFixed(4)}`)
              .join('|'),
          },
        }),
      )
    }
  }

  return layers
}
