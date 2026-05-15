import { NextResponse } from 'next/server'

export const runtime = 'edge'

// AISstream WebSocket doesn't work in Vercel Serverless (10s limit + WS message issues).
// Vessel data requires a long-lived WebSocket connection or a dedicated worker service.
// Return empty until a REST-based AIS API or external worker is configured.
//
// To enable: set up an external worker that collects AIS data and writes to
// Upstash Redis or Vercel KV, then read from cache here.

export async function GET() {
  return NextResponse.json(
    {
      data: [],
      count: 0,
      updatedAt: new Date().toISOString(),
      note: 'Vessel tracking requires Vercel Pro plan or external worker service',
    },
    {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
    },
  )
}
