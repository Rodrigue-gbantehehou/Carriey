import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/template-css/[slug]
 *
 * Sert le fichier style.css directement depuis le dossier source du template.
 * Aucune copie dans public/, aucune liste à maintenir.
 * Ajouter un template = créer son dossier avec style.css, c'est tout.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Sécurité : on sanitize le slug pour éviter toute traversée de répertoire
  const slug = (params.slug || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');

  if (!slug) {
    return new NextResponse('Not found', { status: 404 });
  }

  const cssPath = path.join(
    process.cwd(),
    'components',
    'app',
    'cv',
    'templates',
    slug,
    'style.css'
  );

  if (!fs.existsSync(cssPath)) {
    return new NextResponse(`Template CSS not found: ${slug}`, { status: 404 });
  }

  const css = fs.readFileSync(cssPath, 'utf-8');

  return new NextResponse(css, {
    status: 200,
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      // Cache côté navigateur 1h en dev, 24h en prod
      'Cache-Control':
        process.env.NODE_ENV === 'production'
          ? 'public, max-age=86400, stale-while-revalidate=3600'
          : 'no-cache',
    },
  });
}
