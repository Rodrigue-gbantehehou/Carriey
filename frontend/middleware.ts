import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Chemins protégés qui nécessitent une authentification
const protectedPaths = ['/editor', '/profile', '/templates', '/dashboard'];
// Chemins accessibles uniquement aux utilisateurs non connectés
const guestPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NextAuth stocke la session dans ces cookies (HTTP ou HTTPS)
  const nextAuthToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  // Vérifier si le chemin actuel est protégé
  const isProtectedPath = protectedPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Vérifier si le chemin actuel est réservé aux invités
  const isGuestPath = guestPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Rediriger les utilisateurs non connectés des routes protégées vers la page de connexion
  if (isProtectedPath && !nextAuthToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rediriger les utilisateurs connectés des pages de connexion/inscription vers le dashboard
  if (isGuestPath && nextAuthToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configuration des chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
