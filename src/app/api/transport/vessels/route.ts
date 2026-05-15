import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  // AIS vessel data requires WebSocket connection to aisstream.io
  // Placeholder for REST endpoint that returns cached vessel positions
  return NextResponse.json({
    data: [],
    count: 0,
    updatedAt: new Date().toISOString(),
  })
}
