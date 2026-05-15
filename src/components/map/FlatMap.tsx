'use client'

import type { PickingInfo } from '@deck.gl/core'
import type { FeatureCollection } from 'geojson'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactMapGL, { NavigationControl } from 'react-map-gl/maplibre'
import { useCyberThreats } from '@/hooks/useCyberThreats'
import { useEarthquakes } from '@/hooks/useEarthquakes'
import { useFlights } from '@/hooks/useFlights'
import { useVessels } from '@/hooks/useVessels'
import { useWarnings } from '@/hooks/useWarnings'
import type { City } from '@/lib/geo/cities'
import {
  getGoogleMapsEmbedUrl,
  getGoogleMapsUrl,
  JAPAN_CITIES,
  WORLD_CITIES,
} from '@/lib/geo/cities'
import { useMapStore } from '@/stores/mapStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { DeckGLOverlay } from './DeckGLOverlay'
import { createCableLayer } from './layers/CableLayer'
import {
  createCityDotLayer,
  createCityLabelLayer,
  createWorldCityTimeLayer,
} from './layers/CityLayer'
import { createCyberThreatLayer } from './layers/CyberThreatLayer'
import { createDataCenterLayer, type DCPoint } from './layers/DataCenterLayer'
import { createEarthquakeLayer } from './layers/EarthquakeLayer'
import { createFlightLayer } from './layers/FlightLayer'
import { createPrefectureLayer } from './layers/PrefectureLayer'
import { createVesselLayer } from './layers/VesselLayer'
import { createWeatherWarningLayer } from './layers/WeatherLayer'
import { useMediaFrame } from './MediaFrame'
import 'maplibre-gl/dist/maplibre-gl.css'

const TILE_URLS: Record<string, Record<string, string>> = {
  dark: {
    openfreemap: 'https://tiles.openfreemap.org/styles/dark',
    google: 'https://tiles.openfreemap.org/styles/dark',
  },
  light: {
    openfreemap: 'https://tiles.openfreemap.org/styles/bright',
    google: 'https://tiles.openfreemap.org/styles/bright',
  },
}

const ALL_CITIES = [...JAPAN_CITIES, ...WORLD_CITIES]

export function FlatMap() {
  const { viewState, setViewState, visibleLayers, selectFeature, selectedFeature } = useMapStore()
  const { tileProvider, theme } = useSettingsStore()
  const { earthquakes } = useEarthquakes()
  const { flights } = useFlights()
  const { vessels } = useVessels()
  const { threats } = useCyberThreats()
  const { warnings } = useWarnings()
  const openMedia = useMediaFrame((s) => s.open)

  const [cableData, setCableData] = useState<FeatureCollection | null>(null)
  const [dcData, setDcData] = useState<DCPoint[]>([])
  const [prefData, setPrefData] = useState<FeatureCollection | null>(null)
  const [timeTick, setTimeTick] = useState(0)
  const [animTick, setAnimTick] = useState(0)

  // Update world city clocks every 30s
  useEffect(() => {
    const interval = setInterval(() => setTimeTick((t) => t + 1), 30_000)
    return () => clearInterval(interval)
  }, [])

  // Pulse animation for cyber threat layer (only when visible)
  const cyberVisible = visibleLayers.has('cyberThreats')
  useEffect(() => {
    if (!cyberVisible) return
    const interval = setInterval(() => setAnimTick((t) => t + 1), 500)
    return () => clearInterval(interval)
  }, [cyberVisible])

  // Load static GeoJSON data
  useEffect(() => {
    fetch('/geojson/submarine-cables.json')
      .then((r) => r.json())
      .then(setCableData)
      .catch(() => {})

    fetch('/geojson/data-centers.json')
      .then((r) => r.json())
      .then(setDcData)
      .catch(() => {})

    fetch('/geojson/japan-prefectures.json')
      .then((r) => r.json())
      .then(setPrefData)
      .catch(() => {})
  }, [])

  const onMove = useCallback(
    (evt: {
      viewState: {
        longitude: number
        latitude: number
        zoom: number
        pitch: number
        bearing: number
      }
    }) => {
      setViewState(evt.viewState)
    },
    [setViewState],
  )

  const citiesVisible = visibleLayers.has('cities')

  const selectedFlightId = selectedFeature?.type === 'flights' ? selectedFeature.id : undefined
  const selectedVesselId = selectedFeature?.type === 'vessels' ? selectedFeature.id : undefined

  const layers = useMemo(() => {
    return [
      createCableLayer(cableData, visibleLayers.has('cables')),
      createPrefectureLayer(prefData, visibleLayers.has('prefectures')),
      createDataCenterLayer(dcData, visibleLayers.has('dataCenters')),
      createEarthquakeLayer(earthquakes, visibleLayers.has('earthquakes')),
      createWeatherWarningLayer(warnings, visibleLayers.has('weather')),
      createCyberThreatLayer(threats, visibleLayers.has('cyberThreats'), animTick),
      ...createFlightLayer(flights, visibleLayers.has('flights'), selectedFlightId),
      ...createVesselLayer(vessels, visibleLayers.has('vessels'), selectedVesselId),
      createCityDotLayer(ALL_CITIES, citiesVisible),
      createCityLabelLayer(ALL_CITIES, citiesVisible),
      createWorldCityTimeLayer(ALL_CITIES, citiesVisible, timeTick),
    ]
  }, [
    earthquakes,
    warnings,
    threats,
    flights,
    vessels,
    cableData,
    dcData,
    prefData,
    visibleLayers,
    citiesVisible,
    timeTick,
    animTick,
    selectedFlightId,
    selectedVesselId,
  ])

  const onClick = useCallback(
    (info: PickingInfo) => {
      if (!info.object || !info.layer?.id) return

      const layerId = info.layer.id

      // City click → open Google Maps in MediaFrame
      if (layerId === 'city-dot-layer' || layerId === 'city-label-layer') {
        const city = info.object as City
        const embedUrl = getGoogleMapsEmbedUrl(city)
        openMedia(embedUrl, `${city.name} (${city.nameEn}) - Google Maps`, getGoogleMapsUrl(city))
        return
      }

      if (layerId === 'weather-warning-layer') {
        selectFeature({ type: 'weather', id: String(Date.now()), data: info.object })
        return
      }

      if (layerId === 'cyber-threat-layer') {
        selectFeature({ type: 'cyberThreats', id: String(Date.now()), data: info.object })
        return
      }

      if (layerId === 'datacenter-layer') {
        selectFeature({ type: 'dataCenters', id: String(Date.now()), data: info.object })
        return
      }

      if (layerId === 'earthquake-layer') {
        selectFeature({ type: 'earthquakes', id: String(Date.now()), data: info.object })
        return
      }

      if (layerId === 'flight-layer' || layerId === 'flight-highlight-layer') {
        const f = info.object as { icao24: string }
        selectFeature({ type: 'flights', id: f.icao24, data: info.object })
        return
      }
      if (layerId === 'vessel-layer' || layerId === 'vessel-highlight-layer') {
        const v = info.object as { mmsi: string }
        selectFeature({ type: 'vessels', id: v.mmsi, data: info.object })
        return
      }
      const layerType = layerId.replace('-layer', '') as 'earthquakes'
      selectFeature({ type: layerType, id: String(Date.now()), data: info.object })
    },
    [selectFeature, openMedia],
  )

  const themeKey = theme === 'light' ? 'light' : 'dark'
  const styleUrl = TILE_URLS[themeKey]?.[tileProvider] || TILE_URLS.dark.openfreemap

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
