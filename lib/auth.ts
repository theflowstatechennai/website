import { NextRequest, NextResponse } from 'next/server';

// Simple session management using cookies
const SESSION_COOKIE_NAME = 'flowstate_admin_session';

export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD not set in environment variables');
  }
  return password === adminPassword;
}

export function createSession(): string {
  // Create a simple session token (timestamp + random string)
  const sessionData = JSON.stringify({
    timestamp: Date.now(),
    random: Math.random().toString(36).substring(7),
  });
  // Use btoa for base64 encoding (Edge runtime compatible)
  const token = btoa(sessionData);
  return token;
}

export function isValidSession(token: string): boolean {
  try {
    // Use atob for base64 decoding (Edge runtime compatible)
    const sessionData = atob(token);
    const session = JSON.parse(sessionData);
    // Session valid for 24 hours
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - session.timestamp < twentyFourHours;
  } catch {
    return false;
  }
}

export function getSessionFromRequest(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value || null;
}

export function isAuthenticated(request: NextRequest): boolean {
  const session = getSessionFromRequest(request);
  if (!session) return false;
  return isValidSession(session);
}

export function createAuthResponse(response: NextResponse): NextResponse {
  const session = createSession();
  response.cookies.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
  return response;
}

export function clearAuthResponse(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

// Middleware helper for protecting API routes
export function requireAuth<T = any>(
  handler: (request: NextRequest, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T) => {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(request, context);
  };
}
