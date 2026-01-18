import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/verify-email'];

// Roles that are NOT allowed to access the admin portal
const blockedRoles = ['SCOUT', 'PARENT'];

/**
 * Middleware to protect routes and enforce role-based access control
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Allow API auth routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // If already logged in and trying to access login, redirect to dashboard
    if (token && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Check if user role is blocked from admin portal
  const userRole = token.role as string;
  if (blockedRoles.includes(userRole)) {
    // Sign them out and redirect to login with error
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'AccessDenied');
    url.searchParams.set('message', 'This account cannot access the admin portal. Please use the mobile app.');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, images, and _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
