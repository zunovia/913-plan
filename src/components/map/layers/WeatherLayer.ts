import { ScatterplotLayer } from '@deck.gl/layers'
import type { WeatherWarning } from '@/types/warning'

// 警報レベルごとの色定義 (RGBA)
type RGBAColor = [number, number, number, number]

const LEVEL_COLOR: Record<string, RGBAColor> = {
  advisory: [234, 179, 8, 200],    // 注意報: 黄色  (yellow-500)
  warning: [249, 115, 22, 220],    // 警報: オレンジ (orange-500)
  emergency: [220, 38, 38, 240],   // 特別警報: 赤   (red-600)
}

const LEVEL_RADIUS: Record<string, number> = {
  advisory: 12,
  warning: 18,
  emergency: 26,
}

const LEVEL_LINE_COLOR: Record<string, RGBAColor> = {
  advisory: [253, 224, 71, 255],   // yellow-300
  warning: [251, 146, 60, 255],    // orange-400
  emergency: [239, 68, 68, 255],   // red-500
}

export function createWeatherWarningLayer(data: WeatherWarning[], visible: boolean) {
  return new ScatterplotLayer<WeatherWarning>({
    id: 'weather-warning-layer',
    data,
    visible,
    pickable: true,
    opacity: 0.9,
    stroked: true,
    filled: true,
    radiusMinPixels: 6,
    radiusMaxPixels: 40,
    lineWidthMinPixels: 1,
    getPosition: (d) => [d.longitude, d.latitude],
    getRadius: (d) => LEVEL_RADIUS[d.level] ?? 12,
    getFillColor: (d) => LEVEL_COLOR[d.level] ?? LEVEL_COLOR.advisory,
    getLineColor: (d) => LEVEL_LINE_COLOR[d.level] ?? LEVEL_LINE_COLOR.advisory,
    updateTriggers: {
      getPosition: data.length,
      getRadius: data.length,
      getFillColor: data.length,
      getLineColor: data.length,
    },
  })
}
