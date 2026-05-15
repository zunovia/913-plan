'use client'

import type { GlobeInstance } from 'globe.gl'
import { useEffect, useRef, useState } from 'react'
import { useEarthquakes } from '@/hooks/useEarthquakes'
import {
  getGoogleMapsEmbedUrl,
  getGoogleMapsUrl,
  getLocalTime,
  JAPAN_CITIES,
  WORLD_CITIES,
} from '@/lib/geo/cities'

const ALL_CITIES = [...JAPAN_CITIES, ...WORLD_CITIES]
import { magnitudeToColor } from '@/lib/geo/intensity-scale'
import { useMapStore } from '@/stores/mapStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useMediaFrame } from './MediaFrame'

interface WorldCityMarker {
  lat: number
  lng: number
  name: string
  nameEn: string
  timezone: string
  city: (typeof WORLD_CITIES)[number]
}

function buildMarkerEl(marker: WorldCityMarker, onClick: () => void): HTMLDivElement {
  const el = document.createElement('div')
  el.style.cssText =
    'display:flex;flex-direction:column;align-items:center;cursor:pointer;pointer-events:auto;transform:translate(-50%,-100%);'

  const time = getLocalTime(marker.city)

  el.innerHTML = `
    <div style="background:rgba(0,0,0,0.75);border:1px solid rgba(100,160,255,0.5);border-radius:6px;padding:3px 8px;white-space:nowrap;backdrop-filter:blur(4px);">
      <div style="font-size:11px;font-weight:700;color:#fff;line-height:1.3;">${marker.name}</div>
      <div style="font-size:10px;color:rgba(100,200,255,0.95);font-family:monospace;text-align:center;line-height:1.3;" data-clock>${time}</div>
    </div>
    <div style="width:2px;height:8px;background:rgba(100,160,255,0.5);"></div>
    <div style="width:6px;height:6px;border-radius:50%;background:rgba(100,160,255,0.8);box-shadow:0 0 6px rgba(100,160,255,0.6);"></div>
  `

  el.addEventListener('click', (e) => {
    e.stopPropagation()
    onClick()
  })

  return el
}

export function GlobeMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeInstance | null>(null)
  const markersRef = useRef<HTMLDivElement[]>([])
  const { viewState, visibleLayers } = useMapStore()
  const { autoRotateGlobe } = useSettingsStore()
  const { earthquakes } = useEarthquakes()
  const openMedia = useMediaFrame((s) => s.open)
  const [, setTick] = useState(0)

  // Capture initial values for the one-time globe setup effect below.
  // These refs are intentionally not updated after mount.
  const initViewRef = useRef(viewState)
  const initRotateRef = useRef(autoRotateGlobe)

  // Tick every 30s to update clocks
  useEffect(() => {
    const interval = setInterval(() => {
      // Update clock text in all marker elements
      for (const el of markersRef.current) {
        const clockEl = el.querySelector('[data-clock]')
        if (!clockEl) continue
        const tz = el.dataset.timezone
        if (!tz) continue
        clockEl.textContent = new Date().toLocaleTimeString('ja-JP', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      }
      setTick((t) => t + 1)
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    let mounted = true

    import('globe.gl').then((GlobeModule) => {
      if (!mounted || !containerRef.current) return

      const Globe = GlobeModule.default
      const globe = new Globe(containerRef.current)
        .globeImageUrl('/textures/8k_earth_daymap.jpg')
        .bumpImageUrl('/textures/8k_earth_nightmap.jpg')
        .backgroundImageUrl('/textures/8k_stars_milky_way.jpg')
        .showAtmosphere(true)
        .atmosphereColor('#4da6ff')
        .atmosphereAltitude(0.2)
        .pointOfView({
          lat: initViewRef.current.latitude,
          lng: initViewRef.current.longitude,
          altitude: 2.5,
        })

      // Clouds layer (8K texture)
      import('three').then(({ TextureLoader, MeshPhongMaterial, SphereGeometry, Mesh }) => {
        new TextureLoader().load('/textures/8k_earth_clouds.jpg', (cloudsTexture) => {
          if (!mounted) return
          const radius = (globe.getGlobeRadius?.() ?? 100) * 1.004
          const cloudGeo = new SphereGeometry(radius, 128, 128)
          const cloudMat = new MeshPhongMaterial({
            map: cloudsTexture,
            transparent: true,
            opacity: 0.2,
          })
          const clouds = new Mesh(cloudGeo, cloudMat)
          globe.scene().add(clouds)

          const animateClouds = () => {
            if (!mounted) return
            clouds.rotation.y += 0.0001
            requestAnimationFrame(animateClouds)
          }
          animateClouds()
        })
      })

      globe.controls().autoRotate = initRotateRef.current
      globe.controls().autoRotateSpeed = 0.1

      // Handle resize
      const resizeObs = new ResizeObserver(() => {
        if (containerRef.current) {
          globe.width(containerRef.current.clientWidth)
          globe.height(containerRef.current.clientHeight)
        }
      })
      resizeObs.observe(containerRef.current)

      globeRef.current = globe

      return () => {
        resizeObs.disconnect()
      }
    })

    return () => {
      mounted = false
      if (globeRef.current) {
        globeRef.current._destructor()
      }
    }
  }, [])

  // Update earthquake points
  useEffect(() => {
    if (!globeRef.current) return

    globeRef.current
      .pointsData(
        earthquakes.map((eq) => ({
          lat: eq.latitude,
          lng: eq.longitude,
          size: Math.max(0.05, eq.magnitude * 0.03),
          color: rgbToHex(magnitudeToColor(eq.magnitude)),
          label: `M${eq.magnitude.toFixed(1)} - ${eq.place}`,
        })),
      )
      .pointAltitude('size')
      .pointColor('color')
      .pointRadius(0.3)
      .pointLabel('label')
  }, [earthquakes])

  // Update world city HTML markers on globe
  useEffect(() => {
    if (!globeRef.current) return

    const citiesVisible = visibleLayers.has('cities')

    if (!citiesVisible) {
      globeRef.current.htmlElementsData([])
      markersRef.current = []
      return
    }

    const markerData: WorldCityMarker[] = ALL_CITIES.map((c) => ({
      lat: c.latitude,
      lng: c.longitude,
      name: c.name,
      nameEn: c.nameEn,
      timezone: c.timezone ?? '',
      city: c,
    }))

    const elements: HTMLDivElement[] = []

    globeRef.current
      .htmlElementsData(markerData)
      .htmlLat('lat')
      .htmlLng('lng')
      .htmlAltitude(0.01)
      .htmlElement((d: object) => {
        const marker = d as WorldCityMarker
        const el = buildMarkerEl(marker, () => {
          openMedia(
            getGoogleMapsEmbedUrl(marker.city),
            `${marker.name} (${marker.nameEn}) - Google Maps`,
            getGoogleMapsUrl(marker.city),
          )
        })
        el.dataset.timezone = marker.timezone
        elements.push(el)
        return el
      })

    markersRef.current = elements
  }, [visibleLayers, openMedia])

  // Update auto-rotate
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = autoRotateGlobe
    }
  }, [autoRotateGlobe])

  return <div ref={containerRef} className="w-full h-full" />
}

function rgbToHex(rgba: [number, number, number, number]): string {
  const [r, g, b] = rgba
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
