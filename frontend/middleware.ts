import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simplification temporaire pour débogage
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Matcher simplifié
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
