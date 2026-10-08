import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/template-css/[slug]
 *
 * En développement : lit depuis components/app/cv/templates/[slug]/style.css
 * En production    : lit depuis public/template-assets/[slug]/style.css
 *                    (copié là par `npm run sync-css` au moment du prebuild)
 *
 * NOTE : next.config.js exclut ce chemin du proxy backend ((?!auth|template-css))
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const p = await params;
  const slug = (p.slug || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');

  if (!slug) {
    return new NextResponse('Not found', { status: 404 });
  }

  // En production Next.js, `components/` n'est pas dans le bundle serverless.
  // Le script prebuild (sync-css) copie les CSS dans public/template-assets/.
  // On lit d'abord depuis public/ (fonctionne en prod ET en dev),
  // puis fallback sur components/ pour le hot-reload en dev.
  const candidates = [
    path.join(process.cwd(), 'public', 'template-assets', slug, 'style.css'),
    path.join(process.cwd(), 'components', 'app', 'cv', 'templates', slug, 'style.css'),
  ];

  const cssPath = candidates.find(p => fs.existsSync(p));

  if (!cssPath) {
    return new NextResponse(`Template CSS not found: ${slug}`, { status: 404 });
  }

  const css = fs.readFileSync(cssPath, 'utf-8');

  return new NextResponse(css, {
    status: 200,
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control':
        process.env.NODE_ENV === 'production'
          ? 'public, max-age=86400, stale-while-revalidate=3600'
          : 'no-cache',
    },
  });
}

