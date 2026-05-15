'use client'

import { useCallback, useMemo } from 'react'
import ReactMapGL, { NavigationControl } from 'react-map-gl/maplibre'
import { DeckGLOverlay } from './DeckGLOverlay'
import { useMapStore } from '@/stores/mapStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useEarthquakes } from '@/hooks/useEarthquakes'
import { useFlights } from '@/hooks/useFlights'
import { createEarthquakeLayer } from './layers/EarthquakeLayer'
import { createFlightLayer } from './layers/FlightLayer'
import { createPrefectureLayer } from './layers/PrefectureLayer'
import type { PickingInfo } from '@deck.gl/core'
import 'maplibre-gl/dist/maplibre-gl.css'

const TILE_URLS: Record<string, string> = {
  openfreemap: 'https://tiles.openfreemap.org/styles/dark',
  google: 'https://tiles.openfreemap.org/styles/dark', // fallback to OFM if no Google key
}

export function FlatMap() {
  const { viewState, setViewState, visibleLayers, selectFeature } = useMapStore()
  const { tileProvider } = useSettingsStore()
  const { earthquakes } = useEarthquakes()
  const { flights } = useFlights()

  const onMove = useCallback(
    (evt: { viewState: { longitude: number; latitude: number; zoom: number; pitch: number; bearing: number } }) => {
      setViewState(evt.viewState)
    },
    [setViewState]
  )

  const layers = useMemo(() => {
    return [
      createPrefectureLayer(null, visibleLayers.has('prefectures')),
      createEarthquakeLayer(earthquakes, visibleLayers.has('earthquakes')),
      createFlightLayer(flights, visibleLayers.has('flights')),
    ]
  }, [earthquakes, flights, visibleLayers])

  const onClick = useCallback(
    (info: PickingInfo) => {
      if (info.object && info.layer?.id) {
        const layerType = info.layer.id.replace('-layer', '') as 'earthquakes' | 'flights'
        selectFeature({ type: layerType, id: String(Date.now()), data: info.object })
      }
    },
    [selectFeature]
  )

  const styleUrl = TILE_URLS[tileProvider] || TILE_URLS.openfreemap

  return (
    <ReactMapGL
      {...viewState}
      onMove={onMove}
      style={{ width: '100%', height: '100%' }}
      mapStyle={styleUrl}
    >
      <NavigationControl position="bottom-right" />
      <DeckGLOverlay layers={layers} onClick={onClick} />
    </ReactMapGL>
  )
}
