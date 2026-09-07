import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const sessionToken = request.cookies.get('mq_session')?.value;
  const adminSessionToken = request.cookies.get('mq_admin_session')?.value;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (adminSessionToken) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (!adminSessionToken) {
      const returnTo = encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
      return NextResponse.redirect(new URL(`/admin/login?returnTo=${returnTo}`, request.url));
    }
  }

  // Protect /account and all sub-routes
  if (pathname.startsWith('/account')) {
    if (!sessionToken) {
      const returnTo = encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
      const loginUrl = new URL(`/login?returnTo=${returnTo}`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages (/login, /register)
  if ((pathname === '/login' || pathname === '/register') && sessionToken) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/login', '/register', '/admin/:path*'],
};
