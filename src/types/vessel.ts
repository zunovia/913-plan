export interface Vessel {
  mmsi: string
  name: string
  shipType: number
  latitude: number
  longitude: number
  speed: number
  course: number
  heading: number
  destination?: string
  eta?: string
  lastUpdate: string
}
