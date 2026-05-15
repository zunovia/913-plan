'use client'

import { useControl } from 'react-map-gl/maplibre'
import { MapboxOverlay } from '@deck.gl/mapbox'
import type { MapboxOverlayProps } from '@deck.gl/mapbox'
import type { Layer } from '@deck.gl/core'
import type { LayersList } from '@deck.gl/core'

type DeckLayer = false | LayersList | Layer | null | undefined

interface DeckGLOverlayProps {
  layers: DeckLayer[]
  onClick?: MapboxOverlayProps['onClick']
}

export function DeckGLOverlay({ layers, onClick }: DeckGLOverlayProps) {
  const overlay = useControl<MapboxOverlay>(
    () => new MapboxOverlay({ layers, onClick }),
    { position: 'top-left' }
  )

  overlay.setProps({ layers, onClick })

  return null
}
