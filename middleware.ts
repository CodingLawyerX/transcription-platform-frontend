import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
    const secret = process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req: req, secret: secret });
    
    const { pathname } = req.nextUrl;

    // Geschützte Routen
    const protectedRoutes = [
        '/transcribe',
        '/profile',
    ];

    // Wenn Benutzer nicht angemeldet ist und versucht, auf geschützte Routen zuzugreifen
    if (!token) {
        const isProtectedRoute = protectedRoutes.some(route =>
            pathname.startsWith(route)
        );
        
        if (isProtectedRoute) {
            const signInUrl = new URL('/login', req.url);
            signInUrl.searchParams.set('callbackUrl', req.url);
            return NextResponse.redirect(signInUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
