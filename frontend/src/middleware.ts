import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.some((route) =>
        route === '/' ? pathname === '/' : pathname.startsWith(route)
    );

    // If not authenticated and trying to access protected route
    if (!session && !isPublicRoute) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If authenticated but email not verified, redirect to verification page
    if (
        session &&
        !session.user?.email_verified &&
        pathname !== '/verify-email' &&
        !isPublicRoute
    ) {
        return NextResponse.redirect(new URL('/verify-email', req.url));
    }

    // If authenticated and trying to access auth pages (not landing), redirect to dashboard
    if (session && isPublicRoute && pathname !== '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
