import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Forcer le runtime Node.js (évite les incompatibilités Edge Runtime avec next-auth)
export const runtime = 'nodejs';

export function middleware(request: NextRequest) {
  // Middleware pass-through — le routage est géré par Next.js App Router
  return NextResponse.next();
}

export const config = {
  // Exclure les assets statiques, images et routes API internes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
