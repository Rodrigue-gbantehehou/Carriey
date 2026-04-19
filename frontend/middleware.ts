import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: Le middleware Next.js tourne TOUJOURS sur Edge Runtime (pas configurable)
// Ce middleware est un simple pass-through pour laisser Next.js App Router gérer le routage

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
