import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Return NextResponse.next() to continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // If the path starts with /accueil, /profil, /cv, /lettre, etc.
        // the user must be authenticated.
        const path = req.nextUrl.pathname;
        const protectedPaths = ['/accueil', '/profil', '/cv', '/lettre', '/dashboard'];
        
        const isProtected = protectedPaths.some(p => path === p || path.startsWith(`${p}/`));
        
        if (isProtected) {
          return !!token; // Returns true if token exists, false otherwise (redirects to login)
        }
        
        return true; // Allow access to non-protected routes (like /, /login, /register)
      }
    },
    pages: {
      signIn: '/login', // Redirect to this page if not authenticated
    }
  }
);

// Apply middleware to these routes
export const config = {
  matcher: [
    '/accueil/:path*',
    '/profil/:path*',
    '/cv/:path*',
    '/lettre/:path*',
    '/dashboard/:path*'
  ],
};
