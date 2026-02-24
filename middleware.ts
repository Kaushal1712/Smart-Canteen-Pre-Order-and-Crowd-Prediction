import { NextResponse, type NextRequest } from 'next/server'

import { PUBLIC_ROUTES } from '@/lib/constants'
import { AUTH_PLACEHOLDER_MODE } from '@/lib/config'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  if (AUTH_PLACEHOLDER_MODE) {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const { response, user } = await updateSession(request)

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  )

  const isAuthenticated = Boolean(user)

  if (!isPublicRoute && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isPublicRoute && isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
