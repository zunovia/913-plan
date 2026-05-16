import { ScatterplotLayer } from '@deck.gl/layers'
import type { CyberThreat } from '@/types/cyber'

// Major Japan hubs for distributing threat points
const JAPAN_HUBS = [
  { longitude: 139.6503, latitude: 35.6762 }, // Tokyo
  { longitude: 135.5023, latitude: 34.6937 }, // Osaka
  { longitude: 136.9066, latitude: 35.1815 }, // Nagoya
  { longitude: 130.4017, latitude: 33.5904 }, // Fukuoka
  { longitude: 141.3545, latitude: 43.0618 }, // Sapporo
  { longitude: 140.8694, latitude: 38.2682 }, // Sendai
  { longitude: 132.4553, latitude: 34.3853 }, // Hiroshima
  { longitude: 135.1956, latitude: 34.6901 }, // Kobe
  { longitude: 135.7681, latitude: 35.0116 }, // Kyoto
  { longitude: 139.638, latitude: 35.4437 }, // Yokohama
  { longitude: 140.1063, latitude: 35.6073 }, // Chiba
  { longitude: 139.6455, latitude: 35.8617 }, // Saitama
  { longitude: 139.0236, latitude: 37.9026 }, // Niigata
  { longitude: 136.6562, latitude: 36.5613 }, // Kanazawa
  { longitude: 130.7079, latitude: 32.8032 }, // Kumamoto
]

type SeverityColor = [number, number, number, number]

const SEVERITY_COLOR: Record<string, SeverityColor> = {
  critical: [220, 38, 38, 230], // red-600
  high: [234, 88, 12, 210], // orange-600
  medium: [202, 138, 4, 190], // yellow-600
  low: [37, 99, 235, 170], // blue-600
  info: [107, 114, 128, 150], // gray-500
}

const SEVERITY_RADIUS: Record<string, number> = {
  critical: 28,
  high: 22,
  medium: 16,
  low: 12,
  info: 8,
}

// Deterministic pseudo-random offset based on index
function seededOffset(index: number, scale: number): number {
  const x = Math.sin(index * 127.1 + 311.7) * 43758.5453
  return (x - Math.floor(x) - 0.5) * scale
}

export interface ThreatPoint extends CyberThreat {
  longitude: number
  latitude: number
}

export function mapThreatsToPoints(threats: CyberThreat[]): ThreatPoint[] {
  return threats.map((threat, index) => {
    const hub = JAPAN_HUBS[index % JAPAN_HUBS.length]
    return {
      ...threat,
      longitude: hub.longitude + seededOffset(index * 2, 1.5),
      latitude: hub.latitude + seededOffset(index * 2 + 1, 1.0),
    }
  })
}

export function createCyberThreatLayer(threats: CyberThreat[], visible: boolean, animTick = 0) {
  const points = mapThreatsToPoints(threats)

  // Pulse factor: oscillates between 0.7 and 1.0 using animTick
  const pulse = 0.85 + 0.15 * Math.sin(animTick * 0.2)

  return new ScatterplotLayer<ThreatPoint>({
    id: 'cyber-threat-layer',
    data: points,
    visible,
    pickable: true,
    opacity: 0.9,
    stroked: true,
    filled: true,
    radiusMinPixels: 4,
    radiusMaxPixels: 40,
    lineWidthMinPixels: 1,
    getPosition: (d) => [d.longitude, d.latitude],
    getRadius: (d) => (SEVERITY_RADIUS[d.severity] ?? 10) * pulse,
    getFillColor: (d) => SEVERITY_COLOR[d.severity] ?? SEVERITY_COLOR.info,
    getLineColor: (d) => {
      const base = SEVERITY_COLOR[d.severity] ?? SEVERITY_COLOR.info
      return [base[0], base[1], base[2], 255]
    },
    updateTriggers: {
      getRadius: [points.length, animTick],
      getFillColor: points.length,
      getLineColor: points.length,
    },
  })
}
