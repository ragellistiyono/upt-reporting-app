import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Authentication & Route Protection
 * 
 * This middleware runs on EVERY request and handles:
 * 1. Protecting admin routes (/admin/*)
 * 2. Protecting UPT routes (/upt/*)
 * 3. Redirecting authenticated users from login page to their dashboard
 * 4. Redirecting unauthenticated users to login
 */

// Define protected routes
const ADMIN_ROUTES = ['/admin'];
const UPT_ROUTES = ['/upt'];
const PUBLIC_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session cookie (Appwrite creates this automatically)
  // Try multiple cookie patterns to support both local and production
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const sessionCookie = 
    request.cookies.get(`a_session_${projectId}`) ||
    request.cookies.get(`a_session_${projectId}_legacy`) ||
    // Fallback: check if ANY Appwrite session cookie exists
    Array.from(request.cookies.getAll()).find(cookie => 
      cookie.name.startsWith('a_session')
    );
  
  const isAuthenticated = !!sessionCookie;

  // Check route type
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  const isUPTRoute = UPT_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedRoute = isAdminRoute || isUPTRoute;

  // CASE 1: Unauthenticated user trying to access protected route
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // CASE 2: Authenticated user trying to access login page
  // Check if there's a redirect parameter, use it; otherwise go to home
  if (isPublicRoute && isAuthenticated) {
    const redirect = request.nextUrl.searchParams.get('redirect');
    const redirectUrl = redirect && redirect !== '/login' ? redirect : '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // CASE 3: For authenticated users on root path, redirect to appropriate dashboard
  // This will be handled by the home page component based on role

  // Allow the request to continue
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
