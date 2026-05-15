'use client'

import { useEffect, useRef } from 'react'
import { useMapStore } from '@/stores/mapStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useEarthquakes } from '@/hooks/useEarthquakes'
import { magnitudeToColor } from '@/lib/geo/intensity-scale'
import type { GlobeInstance } from 'globe.gl'

export function GlobeMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeInstance | null>(null)
  const { viewState } = useMapStore()
  const { autoRotateGlobe } = useSettingsStore()
  const { earthquakes } = useEarthquakes()

  useEffect(() => {
    if (!containerRef.current) return

    let mounted = true

    import('globe.gl').then((GlobeModule) => {
      if (!mounted || !containerRef.current) return

      const Globe = GlobeModule.default
      const globe = new Globe(containerRef.current)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .showAtmosphere(true)
        .atmosphereColor('#3a228a')
        .atmosphereAltitude(0.25)
        .pointOfView({ lat: viewState.latitude, lng: viewState.longitude, altitude: 2.5 })

      globe.controls().autoRotate = autoRotateGlobe
      globe.controls().autoRotateSpeed = 0.5

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
        }))
      )
      .pointAltitude('size')
      .pointColor('color')
      .pointRadius(0.3)
      .pointLabel('label')
  }, [earthquakes])

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
