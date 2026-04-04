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

    const isSessionInvalid = !session || session.error === 'RefreshAccessTokenError';

    // If not authenticated and trying to access protected route
    if (isSessionInvalid && !isPublicRoute) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        // Also could pass a query param indicating session expiry, but we rely on apiClient's query param if possible
        return NextResponse.redirect(loginUrl);
    }

    // If authenticated but email not verified, redirect to verification page
    if (
        !isSessionInvalid &&
        !session.user?.email_verified &&
        pathname !== '/verify-email' &&
        !isPublicRoute
    ) {
        return NextResponse.redirect(new URL('/verify-email', req.url));
    }

    // If authenticated and trying to access auth pages (not landing), redirect to dashboard
    if (!isSessionInvalid && isPublicRoute && pathname !== '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
