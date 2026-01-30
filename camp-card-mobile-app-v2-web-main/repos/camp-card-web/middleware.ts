import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/set-password',
  '/claim-gift',
  '/join/scout',
  '/join/parent',
  '/consent/verify',
  '/subscription/renew',
  '/download',
];

// Roles that are NOT allowed to access the admin portal
const blockedRoles = ['SCOUT', 'PARENT'];

// Routes restricted by role - only these roles can access
const routeRestrictions: Record<string, string[]> = {
  '/councils': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN'],
  '/organizations': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN'],
  '/users': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN'],
  '/bulk-users': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN'],
  '/merchants': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN'],
  '/offers': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN'],
  '/camp-cards': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN'],
  '/subscriptions': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN'],
  '/health': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN'],
  '/config': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN'],
  '/feature-flags': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN'],
  '/ai-marketing': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN'],
  '/notifications': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN'],
  '/redemptions': ['GLOBAL_SYSTEM_ADMIN', 'ADMIN', 'NATIONAL_ADMIN', 'COUNCIL_ADMIN'],
};

/**
 * Add cache control headers to prevent browser caching of dynamic content
 */
function addNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
  return response;
}

/**
 * Middleware to protect routes and enforce role-based access control
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Allow API auth routes with no-cache headers
  if (pathname.startsWith('/api/auth')) {
    const response = NextResponse.next();
    return addNoCacheHeaders(response);
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // If already logged in and trying to access login, redirect to dashboard
    if (token && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    const response = NextResponse.next();
    return addNoCacheHeaders(response);
  }

  // Redirect to login if not authenticated
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    const response = NextResponse.redirect(url);
    return addNoCacheHeaders(response);
  }

  // Check if user role is blocked from admin portal
  const userRole = token.role as string;
  if (blockedRoles.includes(userRole)) {
    // Sign them out and redirect to login with error
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'AccessDenied');
    url.searchParams.set('message', 'This account cannot access the admin portal. Please use the mobile app.');
    const response = NextResponse.redirect(url);
    return addNoCacheHeaders(response);
  }

  // Check route-based restrictions for specific roles (e.g., UNIT_LEADER)
  for (const [restrictedPath, allowedRoles] of Object.entries(routeRestrictions)) {
    if (pathname.startsWith(restrictedPath) && !allowedRoles.includes(userRole)) {
      // Redirect to dashboard with access denied message
      const url = new URL('/dashboard', request.url);
      url.searchParams.set('error', 'AccessDenied');
      url.searchParams.set('message', 'You do not have permission to access this page.');
      const response = NextResponse.redirect(url);
      return addNoCacheHeaders(response);
    }
  }

  const response = NextResponse.next();
  return addNoCacheHeaders(response);
}

export const config = {
  matcher: [
    // Match all routes except static files, images, and _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
