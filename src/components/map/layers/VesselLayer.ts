import { IconLayer } from '@deck.gl/layers'
import type { Vessel } from '@/types/vessel'

// Ship icon as white mask — getColor controls the actual color
const SHIP_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <path d="M32 6 L42 24 L44 48 L40 56 L24 56 L20 48 L22 24 Z" fill="#FFFFFF"/>
  <line x1="32" y1="12" x2="32" y2="44" stroke="#FFFFFF" stroke-width="1.5" opacity="0.5"/>
</svg>`)}`

const ICON_MAPPING = {
  ship: { x: 0, y: 0, width: 64, height: 64, anchorY: 32, mask: true },
}

// Selected highlight color — bright cyan
const SELECTED_COLOR: [number, number, number, number] = [0, 240, 255, 255]

// Ship type color mapping
export function getShipColor(shipType: number): [number, number, number, number] {
  const base = Math.floor(shipType / 10) * 10
  switch (base) {
    case 70:
      return [200, 80, 80, 220] // Cargo - red
    case 80:
      return [200, 140, 40, 220] // Tanker - orange
    case 60:
      return [60, 160, 255, 220] // Passenger - blue
    case 30:
      return [0, 200, 120, 220] // Fishing - green
    default:
      return [160, 160, 160, 220] // Other - gray
  }
}

export function getShipTypeName(shipType: number): string {
  const base = Math.floor(shipType / 10) * 10
  switch (base) {
    case 70:
      return '貨物船'
    case 80:
      return 'タンカー'
    case 60:
      return '旅客船'
    case 30:
      return '漁船'
    default:
      return '船舶'
  }
}

export function createVesselLayer(data: Vessel[], visible: boolean, selectedId?: string) {
  const layers = [
    new IconLayer<Vessel>({
      id: 'vessel-layer',
      data,
      visible,
      pickable: true,
      iconAtlas: SHIP_SVG,
      iconMapping: ICON_MAPPING,
      getIcon: () => 'ship',
      getPosition: (d) => [d.longitude, d.latitude],
      getSize: 18,
      getAngle: (d) => 360 - (d.heading !== 511 ? d.heading : d.course),
      sizeMinPixels: 10,
      sizeMaxPixels: 28,
      billboard: false,
      getColor: (d) => (selectedId === d.mmsi ? SELECTED_COLOR : getShipColor(d.shipType)),
      updateTriggers: {
        getPosition: data.length,
        getAngle: data.length,
        getColor: selectedId ?? '',
      },
    }),
  ]

  // Glow ring behind selected vessel
  if (selectedId && visible) {
    const selected = data.filter((v) => v.mmsi === selectedId)
    if (selected.length > 0) {
      layers.unshift(
        new IconLayer<Vessel>({
          id: 'vessel-highlight-layer',
          data: selected,
          visible: true,
          pickable: false,
          iconAtlas: SHIP_SVG,
          iconMapping: ICON_MAPPING,
          getIcon: () => 'ship',
          getPosition: (d) => [d.longitude, d.latitude],
          getSize: 34,
          getAngle: (d) => 360 - (d.heading !== 511 ? d.heading : d.course),
          sizeMinPixels: 22,
          sizeMaxPixels: 46,
          billboard: false,
          getColor: [0, 240, 255, 80],
          updateTriggers: {
            getPosition: selected.map((v) => `${v.mmsi}:${v.longitude}:${v.latitude}`).join('|'),
          },
        }),
      )
    }
  }

  return layers
}
