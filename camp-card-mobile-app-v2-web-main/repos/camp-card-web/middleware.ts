import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware to protect routes
 */
export async function middleware(request: NextRequest) {
 const token = await getToken({
 req: request,
 secret: process.env.NEXTAUTH_SECRET,
 });

 const { pathname } = request.nextUrl;

 // Allow public routes
 if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
 return NextResponse.next();
 }

 // Redirect to login if not authenticated
 if (!token && pathname.startsWith('/dashboard')) {
 const url = new URL('/login', request.url);
 url.searchParams.set('callbackUrl', pathname);
 return NextResponse.redirect(url);
 }

 return NextResponse.next();
}

export const config = {
 matcher: ['/dashboard/:path*', '/login'],
};
