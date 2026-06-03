import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/', '/login']
const adminRoutes = ['/admin']
const sellerRoutes = ['/seller']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Get session
  const session = await auth()

  // If no session and trying to access protected route, redirect to login
  if (!session) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/seller') || pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // If session exists, check role-based access
  if (session) {
    // Admin trying to access seller route
    if (session.user.role === 'admin' && pathname.startsWith('/seller')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Seller trying to access admin route
    if (session.user.role === 'seller' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/seller', request.url))
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
