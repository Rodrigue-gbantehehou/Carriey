// Middleware volontairement vide.
// Ne pas supprimer ce fichier — sa présence (même vide) évite des 404 sur Vercel.
// Pas d'import de next/server car Edge Runtime ne supporte pas __dirname
// et certaines dépendances (next-auth) le référencent indirectement.

import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // Pass-through : aucune logique, aucun import lourd
}

export const config = {
  // Ne matcher AUCUNE route — désactive le middleware sans le supprimer
  matcher: [],
};
