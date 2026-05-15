'use client'

import type { Layer, LayersList } from '@deck.gl/core'
import type { MapboxOverlayProps } from '@deck.gl/mapbox'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { useControl } from 'react-map-gl/maplibre'

type DeckLayer = false | LayersList | Layer | null | undefined

interface DeckGLOverlayProps {
  layers: DeckLayer[]
  onClick?: MapboxOverlayProps['onClick']
}

export function DeckGLOverlay({ layers, onClick }: DeckGLOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay({ layers, onClick }), {
    position: 'top-left',
  })

  overlay.setProps({ layers, onClick })

  return null
}
