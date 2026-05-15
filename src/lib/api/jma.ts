const JMA_FORECAST = 'https://www.jma.go.jp/bosai/forecast/data/forecast'

export interface JMAWarning {
  id: string
  areaName: string
  warningType: string
  level: 'warning' | 'advisory' | 'watch'
  description: string
  issuedAt: string
}

export async function fetchJMAWarnings(): Promise<JMAWarning[]> {
  // JMA provides area-based forecast data
  // For now return empty array as JMA API requires specific area codes
  // Will be expanded with weather warning data
  void JMA_FORECAST
  return []
}
