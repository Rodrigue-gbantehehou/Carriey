import fs from 'fs';
import path from 'path';
import { CVTemplateRenderer } from '@/components/app/cv/templates';

interface PrintPageProps {
  searchParams: { id?: string };
}

async function getPrintDataServer(id: string) {
  try {
    // ESSENTIEL : Au lieu de faire un fetch() HTTP vers FastAPI,
    // on lit directement le fichier cache sur le disque.
    // Cela évite un DEADLOCK sur cPanel/Passenger où le seul worker Python
    // attend le PDF de Render, qui lui-même attend le Next.js SSR,
    // qui lui-même tente de requêter le même worker Python !
    
    // Chemin relatif depuis frontend/ (process.cwd()) vers backend/static/cache/
    const cachePath = path.join(process.cwd(), '..', 'backend', 'static', 'cache', `${id}.json`);
    
    if (fs.existsSync(cachePath)) {
      const data = fs.readFileSync(cachePath, 'utf8');
      return JSON.parse(data);
    } else {
      console.error(`Fichier cache introuvable : ${cachePath}`);
      return null;
    }
  } catch (err) {
    console.error("Erreur lecture données CV depuis le disque:", err);
    return null;
  }
}

function getTemplateCss(slug: string): string {
  try {
    const cssPath = path.join(process.cwd(), 'public', 'template-assets', slug, 'style.css');
    if (fs.existsSync(cssPath)) {
      return fs.readFileSync(cssPath, 'utf-8');
    }
  } catch (e) {
    console.warn("Impossible de lire style.css:", e);
  }
  return '';
}

export default async function PrintPage({ searchParams }: PrintPageProps) {
  const id = searchParams?.id;
  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-black p-4">
        <h1>Aucun identifiant d'impression fourni.</h1>
      </div>
    );
  }

  const printData = await getPrintDataServer(id);
  if (!printData) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-red-600 p-4">
        <h1>Impossible de charger les données du CV (document introuvable ou expiré).</h1>
      </div>
    );
  }

  const slug = (printData.template_name || 'classique').toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const templateCss = getTemplateCss(slug);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://carapi.nomiks.net/api';

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background: white;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @page {
          size: A4 portrait;
          margin: 0;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          html, body, div, main {
            height: auto !important;
            min-height: auto !important;
          }
          body > div {
            display: block !important;
          }
        }
        ${templateCss}
      `}} />

      {/* Rendu SSR immédiat du template A4 (HTML statique complet envoyé au navigateur) */}
      <div 
        className="a4-print-container" 
        style={{ width: '210mm', minHeight: '297mm', background: 'white', margin: '0 auto' }} 
      >
        <CVTemplateRenderer 
          templateName={printData.template_name}
          data={printData.data}
          config={printData.config}
          apiBaseUrl={apiBaseUrl}
        />
      </div>

      {/* Signal pour Playwright : actif dès que le HTML est analysé */}
      <script dangerouslySetInnerHTML={{__html: `
        window.__CV_PRINT_READY__ = true;
      `}} />
    </>
  );
}
