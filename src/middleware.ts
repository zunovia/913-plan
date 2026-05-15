import { NextRequest, NextResponse } from 'next/server'

const PASSWORD = process.env.SITE_PASSWORD ?? '090909###'
const COOKIE_NAME = 'auth_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function hashToken(password: string): string {
  // Simple but sufficient token for cookie-based auth
  let h = 0
  for (let i = 0; i < password.length; i++) {
    h = (Math.imul(31, h) + password.charCodeAt(i)) | 0
  }
  return `v1_${h.toString(36)}`
}

const VALID_TOKEN = hashToken(PASSWORD)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth for API routes, static files, and the login page itself
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/login') ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.png' ||
    pathname === '/apple-icon.png' ||
    pathname.startsWith('/textures/')
  ) {
    return NextResponse.next()
  }

  // Handle login POST
  if (pathname === '/auth' && request.method === 'POST') {
    return // handled by route handler
  }

  // Check auth cookie
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (token === VALID_TOKEN) {
    return NextResponse.next()
  }

  // Redirect to login
  const loginUrl = new URL('/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)'],
}
