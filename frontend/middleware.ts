import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;

        // Toutes les routes privées de l'espace connecté (groupe app)
        const protectedPaths = [
          '/accueil',
          '/profil',
          '/mes-documents',
          '/candidatures',
          '/themes',
          '/parametres',
          '/statistiques',
          '/paiement',
          '/apercu',
          // Ancien routing (au cas où)
          '/cv',
          '/lettre',
          '/dashboard',
        ];

        const isProtected = protectedPaths.some(
          (p) => path === p || path.startsWith(`${p}/`)
        );

        if (path.startsWith('/admin')) {
          return !!token && (token.role === 'ADMIN' || token.role === 'SUPER_ADMIN');
        }

        if (isProtected) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Appliquer le middleware à toutes les routes privées
export const config = {
  matcher: [
    '/accueil/:path*',
    '/profil/:path*',
    '/mes-documents/:path*',
    '/candidatures/:path*',
    '/themes/:path*',
    '/parametres/:path*',
    '/statistiques/:path*',
    '/paiement/:path*',
    '/apercu/:path*',
    // Ancien routing
    '/cv/:path*',
    '/lettre/:path*',
    '/dashboard/:path*',
    '/admin/:path*'
  ],
};

