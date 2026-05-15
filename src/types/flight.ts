export interface Flight {
  icao24: string
  callsign: string
  originCountry: string
  longitude: number
  latitude: number
  altitude: number
  velocity: number
  heading: number
  verticalRate: number
  onGround: boolean
  lastContact: number
}
