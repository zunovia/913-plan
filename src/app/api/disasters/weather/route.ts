import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  // JMA weather warnings - placeholder for now
  return NextResponse.json({
    data: [],
    updatedAt: new Date().toISOString(),
  })
}
