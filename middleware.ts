import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Authentication & Route Protection
 * 
 * NOTE: Due to issues with Appwrite cookies in Vercel Edge Runtime,
 * we've simplified this middleware. Auth protection is now primarily
 * handled client-side in AuthContext and individual page components.
 * 
 * This middleware only handles basic logging and passes requests through.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function middleware(_request: NextRequest) {
  // Simply pass through all requests
  // Auth protection is handled client-side
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
