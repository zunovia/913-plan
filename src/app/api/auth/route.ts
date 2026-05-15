import { NextRequest, NextResponse } from 'next/server'

const PASSWORD = process.env.SITE_PASSWORD ?? '090909###'
const COOKIE_NAME = 'auth_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function hashToken(password: string): string {
  let h = 0
  for (let i = 0; i < password.length; i++) {
    h = (Math.imul(31, h) + password.charCodeAt(i)) | 0
  }
  return `v1_${h.toString(36)}`
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { password } = body as { password?: string }

  if (password !== PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = hashToken(password)
  const response = NextResponse.json({ ok: true })

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return response
}
