import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Inline auth functions for Edge runtime compatibility
const SESSION_COOKIE_NAME = 'flowstate_admin_session';

function isValidSession(token: string): boolean {
  try {
    const sessionData = atob(token);
    const session = JSON.parse(sessionData);
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - session.timestamp < twentyFourHours;
  } catch {
    return false;
  }
}

function isAuthenticated(request: NextRequest): boolean {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value || null;
  if (!session) return false;
  return isValidSession(session);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthenticated(request)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
