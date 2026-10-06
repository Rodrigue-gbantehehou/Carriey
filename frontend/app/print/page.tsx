'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPrintData, API_BASE } from '@/lib/api';
import { CVTemplateRenderer } from '@/components/app/cv/templates';

// We augment the window interface directly here to avoid global type issues
declare global {
  interface Window {
    __CV_PRINT_READY__?: boolean;
  }
}

function PrintContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [data, setData] = useState<{
    template_name: string;
    data: any;
    config: any;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      setError("Aucun identifiant d'impression fourni.");
      window.__CV_PRINT_READY__ = true;
      return;
    }

    const fetchData = async () => {
      try {
        const result = await getPrintData(id);
        setData(result);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Impossible de charger les données du CV.");
        window.__CV_PRINT_READY__ = true;
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!data || !sourceRef.current || !targetRef.current) return;

    let isCancelled = false;
    let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;

    const runPageFlow = async () => {
      if (isCancelled || !sourceRef.current || !targetRef.current) return;

      try {
        const { PageFlow, PageNumberPlugin, mmToPx } = await import('pageflow-js');
        const pf = new PageFlow({
          pageSize: 'A4',
          margin: { top: 0, right: 0, bottom: mmToPx(1), left: 0 },
          atomic: ['.header', '.item-group', '.skill-item', '.about-text', '.meta-item', '.exp-meta', '.exp-header'],
          keepWithNext: ['.section-title', '.exp-meta', '.exp-header'],
          pagination: { lookahead: 3, optimizeWhitespace: true },
          plugins: [
            new PageNumberPlugin({ position: 'bottom-right' })
          ]
        });

        targetRef.current.innerHTML = '';
        await pf.flow(sourceRef.current, targetRef.current);

        // Si PageFlow n'a rien généré ou a échoué silencieusement, fallback sur le HTML direct
        if (!targetRef.current.children || targetRef.current.children.length === 0) {
          targetRef.current.innerHTML = sourceRef.current.innerHTML;
        }
      } catch (error) {
        console.error("PageFlow error:", error);
        // Fallback immédiat : injection directe du template source dans le conteneur cible
        if (sourceRef.current && targetRef.current) {
          targetRef.current.innerHTML = sourceRef.current.innerHTML;
        }
      } finally {
        if (!isCancelled) {
          setIsReady(true);
          if (document.fonts) {
            try { await document.fonts.ready; } catch (_) {}
          }
          setTimeout(() => {
            window.__CV_PRINT_READY__ = true;
          }, 300);
        }
      }
    };

    const handleCssReady = () => {
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      runPageFlow();
    };

    sourceRef.current.addEventListener('pageflow:css-ready', handleCssReady);

    // Fallback : exécuter après 1s si RemoteStyles n'émet pas l'événement
    fallbackTimeout = setTimeout(() => {
      runPageFlow();
    }, 1000);

    return () => {
      isCancelled = true;
      sourceRef.current?.removeEventListener('pageflow:css-ready', handleCssReady);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [data]);

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
        /* Masquer la scrollbar */
        ::-webkit-scrollbar {
          display: none;
        }
        
        /* FIX: Prevent flexbox from breaking print pagination */
        @media print {
          .no-print, .print-hide-loader {
            display: none !important;
          }
          html, body, div, main {
            height: auto !important;
            min-height: auto !important;
          }
          body > div {
            display: block !important;
          }
          .pf-container {
            display: block !important;
          }
          .pf-page {
            margin: 0 !important;
          }
        }
      `}} />

      {/* Message d'erreur visible à l'écran mais pas sur l'impression */}
      {error && (
        <div className="flex items-center justify-center h-screen bg-white text-red-600 p-4">
          <h1>{error}</h1>
        </div>
      )}

      {/* Écran d'attente masqué en mode impression (@media print) */}
      {(!data || !isReady) && !error && (
        <div className="print-hide-loader flex items-center justify-center h-screen bg-white text-black p-4 fixed inset-0 z-50">
          <h1 className="text-lg font-semibold">Chargement du document...</h1>
        </div>
      )}
      
      {/* SOURCE : Positionné hors-écran pour que PageFlow puisse calculer les hauteurs sans display:none */}
      <div 
        ref={sourceRef}
        className="print-source"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '210mm',
          opacity: 0,
          pointerEvents: 'none'
        }}
      >
        {data && (
          <CVTemplateRenderer 
            templateName={data.template_name}
            data={data.data}
            config={data.config}
            apiBaseUrl={API_BASE}
          />
        )}
      </div>

      {/* TARGET : Conteneur visible où PageFlow injecte les pages formatées A4 */}
      <div 
        ref={targetRef} 
        className="print-container" 
        style={{ width: '210mm', minHeight: '297mm', background: 'white', margin: '0 auto' }} 
      />
    </>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div className="p-4">Chargement...</div>}>
      <PrintContent />
    </Suspense>
  );
}
