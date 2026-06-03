import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/', '/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Redirect unauthenticated users to login when accessing protected routes
  if (!token) {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/seller') ||
      pathname.startsWith('/buyer') ||
      pathname === '/dashboard'
    ) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (token) {
    if (token.role === 'admin') {
      if (pathname.startsWith('/seller') || pathname.startsWith('/buyer')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }

    if (token.role === 'seller') {
      if (pathname.startsWith('/admin') || pathname.startsWith('/buyer')) {
        return NextResponse.redirect(new URL('/seller', request.url))
      }
    }

    if (token.role === 'buyer') {
      if (pathname.startsWith('/admin') || pathname.startsWith('/seller') || pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/buyer', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
