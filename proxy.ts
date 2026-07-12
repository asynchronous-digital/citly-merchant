import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function proxy(request: NextRequest) {
  const sid = request.cookies.get('sid')?.value;
  const { pathname } = request.nextUrl;
  
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');
  
  // If no session and trying to access a protected route, redirect to login
  if (!sid && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If session exists and trying to access auth route or root, redirect to dashboard
  if (sid && (isAuthRoute || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Redirect root to dashboard if no other rules hit (should be caught above, but just in case)
  if (pathname === '/') {
    return NextResponse.redirect(new URL(sid ? '/dashboard' : '/login', request.url))
  }
 
  return NextResponse.next();
}
 
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
