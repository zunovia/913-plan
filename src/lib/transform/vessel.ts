import type { Vessel } from '@/types/vessel'

export function vesselToIconData(vessels: Vessel[]) {
  return vessels.map((v) => ({
    position: [v.longitude, v.latitude] as [number, number],
    angle: v.course ?? 0,
    ...v,
  }))
}
