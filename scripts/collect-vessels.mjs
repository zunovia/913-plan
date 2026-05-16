#!/usr/bin/env node
/**
 * AISstream WebSocket → Upstash Redis collector
 * Runs as a GitHub Actions cron job every 5 minutes.
 * Connects to AISstream, collects vessel positions for ~30s, then writes to Redis.
 */

import WebSocket from 'ws'

const AISSTREAM_WS = 'wss://stream.aisstream.io/v0/stream'
const JAPAN_BBOX = [[20, 120], [50, 155]]
const COLLECTION_DURATION_MS = 30_000
const MAX_VESSELS = 300
const REDIS_KEY = 'vessels:japan'
const REDIS_TTL = 7200 // 2 hours (GitHub Actions cron may run ~1h apart)

const SHIP_TYPE_NAMES = {
  30: 'Fishing',
  60: 'Passenger',
  70: 'Cargo',
  80: 'Tanker',
}

const apiKey = process.env.AISSTREAM_API_KEY
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

if (!apiKey) {
  console.error('Missing AISSTREAM_API_KEY')
  process.exit(1)
}
if (!redisUrl || !redisToken) {
  console.error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN')
  process.exit(1)
}

async function writeToRedis(vessels) {
  const payload = {
    data: vessels,
    count: vessels.length,
    updatedAt: new Date().toISOString(),
  }

  const value = JSON.stringify(payload)
  const res = await fetch(`${redisUrl}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', REDIS_KEY, value, 'EX', REDIS_TTL]),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Redis write failed: ${res.status} ${text}`)
  }

  console.log(`Wrote ${vessels.length} vessels to Redis (TTL: ${REDIS_TTL}s)`)
}

function collectVessels() {
  return new Promise((resolve) => {
    const vessels = new Map()
    let timer

    const ws = new WebSocket(AISSTREAM_WS)

    const finish = () => {
      clearTimeout(timer)
      try { ws.close() } catch { /* ignore */ }
      resolve(Array.from(vessels.values()))
    }

    ws.on('open', () => {
      console.log('AISstream WebSocket connected')
      ws.send(JSON.stringify({
        Apikey: apiKey,
        BoundingBoxes: [JAPAN_BBOX],
        FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
      }))

      timer = setTimeout(() => {
        console.log(`Collection complete: ${vessels.size} vessels in ${COLLECTION_DURATION_MS}ms`)
        finish()
      }, COLLECTION_DURATION_MS)
    })

    ws.on('message', (raw) => {
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

        vessels.set(mmsi, {
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
        })

        if (vessels.size >= MAX_VESSELS) {
          finish()
        }
      } catch {
        // skip malformed messages
      }
    })

    ws.on('error', (err) => {
      console.error('AISstream WebSocket error:', err.message)
      finish()
    })

    // Safety timeout
    setTimeout(finish, COLLECTION_DURATION_MS + 5000)
  })
}

async function main() {
  console.log('Starting AIS vessel collection...')
  const vessels = await collectVessels()

  if (vessels.length === 0) {
    console.warn('No vessels collected, skipping Redis write')
    process.exit(0)
  }

  await writeToRedis(vessels)
  console.log('Done!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
