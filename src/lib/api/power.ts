// TEPCO and regional power company real-time usage data
// Primary source: TEPCO public CSV (free, no auth required)
// https://www.tepco.co.jp/forecast/html/images/juyo-j.csv

export interface PowerGridStatus {
  region: string
  company: string
  usage: number // current usage in 万kW
  capacity: number // capacity in 万kW
  percentage: number // usage/capacity * 100
  updatedAt: string
}

const TEPCO_CSV_URL = 'https://www.tepco.co.jp/forecast/html/images/juyo-j.csv'

/**
 * Parse TEPCO CSV format.
 *
 * The CSV has a metadata header section followed by a blank line, then
 * column headers, then data rows. Example structure:
 *
 *   DATE,TIME,実績(万kW),予想最大電力(万kW)
 *   2024/01/15,0:30,3200,4800
 *   2024/01/15,1:00,3150,4800
 *   ...
 *
 * We want the most recent non-empty 実績 row.
 */
function parseTEPCOCsv(
  csvText: string,
): { usage: number; capacity: number; updatedAt: string } | null {
  const lines = csvText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  // Find the header row containing DATE (case-insensitive search)
  let headerIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('date') || lines[i].includes('DATE')) {
      headerIndex = i
      break
    }
  }

  if (headerIndex === -1) return null

  const headers = lines[headerIndex].split(',').map((h) => h.trim())
  const dateCol = headers.findIndex((h) => h.toUpperCase() === 'DATE')
  const timeCol = headers.findIndex((h) => h.toUpperCase() === 'TIME')

  // Find 実績 column — column name varies slightly across TEPCO CSV versions
  const usageCol = headers.findIndex((h) => h.includes('実績'))
  // Find 予想最大電力 column for capacity
  const capacityCol = headers.findIndex((h) => h.includes('予想最大') || h.includes('最大電力'))

  if (dateCol === -1 || timeCol === -1 || usageCol === -1) return null

  // Scan data rows from the bottom to find the most recent row with actual usage data
  let latestUsage = 0
  let latestCapacity = 0
  let latestDate = ''
  let latestTime = ''

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim())
    if (cols.length <= usageCol) continue

    const usageRaw = cols[usageCol]
    const usage = parseFloat(usageRaw)
    if (Number.isNaN(usage) || usage <= 0) continue

    const dateRaw = cols[dateCol] ?? ''
    const timeRaw = cols[timeCol] ?? ''
    const capacityRaw = capacityCol >= 0 ? cols[capacityCol] : ''
    const capacity = parseFloat(capacityRaw)

    latestUsage = usage
    latestCapacity = Number.isNaN(capacity) ? 0 : capacity
    latestDate = dateRaw
    latestTime = timeRaw
  }

  if (latestUsage === 0) return null

  // Construct ISO timestamp from date/time strings (format: YYYY/MM/DD, H:MM)
  let updatedAt = new Date().toISOString()
  try {
    const normalizedDate = latestDate.replace(/\//g, '-')
    const parsed = new Date(`${normalizedDate}T${latestTime.padStart(5, '0')}:00+09:00`)
    if (!Number.isNaN(parsed.getTime())) {
      updatedAt = parsed.toISOString()
    }
  } catch {
    // Fall back to current time
  }

  return { usage: latestUsage, capacity: latestCapacity, updatedAt }
}

/**
 * Fetch real-time power grid status from Japanese electric utilities.
 * Currently supports TEPCO (Tokyo Electric Power Company).
 * Returns an empty array if the fetch or parse fails.
 */
export async function fetchPowerGrid(): Promise<PowerGridStatus[]> {
  const results: PowerGridStatus[] = []

  // --- TEPCO ---
  try {
    const res = await fetch(TEPCO_CSV_URL, {
      headers: {
        // TEPCO blocks default fetch user agents; mimic a browser
        'User-Agent': 'Mozilla/5.0 (compatible; JapanMonitor/1.0)',
        Accept: 'text/csv,text/plain,*/*',
      },
      // Use Next.js cache revalidation instead of Redis here so that the
      // Redis cachedFetch wrapper at the route layer controls TTL
      next: { revalidate: 300 },
    })

    if (res.ok) {
      const csvText = await res.text()
      const parsed = parseTEPCOCsv(csvText)

      if (parsed) {
        const percentage =
          parsed.capacity > 0 ? Math.round((parsed.usage / parsed.capacity) * 1000) / 10 : 0

        results.push({
          region: '東京',
          company: '東京電力パワーグリッド',
          usage: parsed.usage,
          capacity: parsed.capacity,
          percentage,
          updatedAt: parsed.updatedAt,
        })
      }
    }
  } catch (error) {
    console.error('fetchPowerGrid: TEPCO CSV fetch failed', error)
  }

  return results
}
