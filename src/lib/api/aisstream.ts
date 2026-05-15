import WebSocket from 'ws'
import type { Vessel } from '@/types/vessel'

const AISSTREAM_WS = 'wss://stream.aisstream.io/v0/stream'

// Japan bounding box (extended to include surrounding waters)
const JAPAN_BBOX: [[number, number], [number, number]] = [
  [20, 120], // [minLat, minLng]
  [50, 155], // [maxLat, maxLng]
]

const SHIP_TYPE_NAMES: Record<number, string> = {
  30: 'Fishing',
  60: 'Passenger',
  70: 'Cargo',
  80: 'Tanker',
}

/**
 * Connect to AISstream WebSocket, collect vessel positions for `durationMs`,
 * then close and return the collected data.
 */
export async function fetchVesselSnapshot(
  apiKey: string,
  durationMs = 10_000,
  maxVessels = 200,
): Promise<Vessel[]> {
  return new Promise((resolve) => {
    const vessels = new Map<string, Vessel>()
    let timer: ReturnType<typeof setTimeout>

    const ws = new WebSocket(AISSTREAM_WS)

    const finish = () => {
      clearTimeout(timer)
      try {
        ws.close()
      } catch {
        /* ignore */
      }
      resolve(Array.from(vessels.values()))
    }

    ws.on('open', () => {
      console.log('AISstream WebSocket connected')
      ws.send(
        JSON.stringify({
          Apikey: apiKey,
          BoundingBoxes: [JAPAN_BBOX],
          FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
        }),
      )

      timer = setTimeout(() => {
        console.log(`AISstream: collected ${vessels.size} vessels in ${durationMs}ms`)
        finish()
      }, durationMs)
    })

    ws.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString())
        const meta = msg.MetaData
        if (!meta) return

        const mmsi = String(meta.MMSI ?? '')
        if (!mmsi) return

        const lat = meta.latitude ?? 0
        const lng = meta.longitude ?? 0
        if (lat === 0 && lng === 0) return

        const existing = vessels.get(mmsi)
        const shipName = meta.ShipName?.trim() || existing?.name || `MMSI:${mmsi}`

        const posReport = msg.Message?.PositionReport
        const staticData = msg.Message?.ShipStaticData

        const vessel: Vessel = {
          mmsi,
          name: shipName,
          shipType: staticData?.Type ?? existing?.shipType ?? 0,
          latitude: lat,
          longitude: lng,
          speed: posReport?.Sog ?? existing?.speed ?? 0,
          course: posReport?.Cog ?? existing?.course ?? 0,
          heading: posReport?.TrueHeading ?? existing?.heading ?? 0,
          destination: staticData?.Destination?.trim() || existing?.destination,
          eta: staticData?.Eta
            ? `${staticData.Eta.Month}/${staticData.Eta.Day} ${staticData.Eta.Hour}:${String(staticData.Eta.Minute).padStart(2, '0')}`
            : existing?.eta,
          lastUpdate: meta.time_utc ?? new Date().toISOString(),
        }

        vessels.set(mmsi, vessel)

        if (vessels.size >= maxVessels) {
          finish()
        }
      } catch {
        // skip malformed messages
      }
    })

    ws.on('error', (err: Error) => {
      console.error('AISstream WebSocket error:', err.message)
      finish()
    })

    // Safety timeout — must complete well before Vercel's 10s limit
    setTimeout(finish, durationMs + 1000)
  })
}

export function getShipTypeName(type: number): string {
  const base = Math.floor(type / 10) * 10
  return SHIP_TYPE_NAMES[base] ?? 'Other'
}
