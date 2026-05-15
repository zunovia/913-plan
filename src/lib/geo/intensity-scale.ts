// JMA Seismic Intensity Scale mapping
const INTENSITY_MAP: Record<number, { label: string; color: string }> = {
  10: { label: '1', color: '#62B2E8' },
  20: { label: '2', color: '#00AA00' },
  30: { label: '3', color: '#EAEA00' },
  40: { label: '4', color: '#FF8C00' },
  45: { label: '5弱', color: '#FF4500' },
  46: { label: '5弱', color: '#FF4500' },
  50: { label: '5強', color: '#FF0000' },
  55: { label: '6弱', color: '#CC0000' },
  60: { label: '6強', color: '#990000' },
  70: { label: '7', color: '#660000' },
}

export function getIntensityLabel(scale: number): string {
  return INTENSITY_MAP[scale]?.label ?? `${scale}`
}

export function getIntensityColor(scale: number): string {
  return INTENSITY_MAP[scale]?.color ?? '#888888'
}

export function magnitudeToRadius(mag: number): number {
  return Math.max(4, Math.pow(2, mag) * 0.5)
}

export function magnitudeToColor(mag: number): [number, number, number, number] {
  if (mag >= 7) return [180, 0, 0, 220]
  if (mag >= 6) return [220, 0, 0, 200]
  if (mag >= 5) return [255, 69, 0, 180]
  if (mag >= 4) return [255, 165, 0, 160]
  if (mag >= 3) return [255, 255, 0, 140]
  return [100, 200, 100, 120]
}
