export interface WeatherArea {
  code: string // JMA area code
  name: string // Area name (e.g., '東京')
  weather: string // Weather description (e.g., '晴れ')
  weatherCode: string // JMA weather code for icon
  tempMax: number | null // Max temperature
  tempMin: number | null // Min temperature
  precipitation: number // Precipitation probability %
  wind: string // Wind description
  date: string // Forecast date
  weekly: WeatherDay[] // 7-day forecast
}

export interface WeatherDay {
  date: string
  weatherCode: string
  pop: number | null // Precipitation probability %
  tempMax: number | null
  tempMin: number | null
  reliability: string // A, B, C forecast reliability
}

export interface WeatherData {
  areas: WeatherArea[]
  updatedAt: string
}
