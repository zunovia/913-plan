import type { Flight } from '@/types/flight'

export function flightToIconData(flights: Flight[]) {
  return flights
    .filter((f) => !f.onGround)
    .map((f) => ({
      ...f,
      position: [f.longitude, f.latitude] as [number, number],
      angle: f.heading ?? 0,
    }))
}
