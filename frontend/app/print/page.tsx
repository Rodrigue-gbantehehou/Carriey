'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPrintData } from '@/lib/api';
import { CVTemplateRenderer } from '@/components/app/cv/templates';
import { PageFlow, PageNumberPlugin, mmToPx } from 'pageflow-js';
// Removed ResumeData import to fix TS error

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

  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      setError("Aucun identifiant d'impression fourni.");
      return;
    }

    const fetchData = async () => {
      try {
        const result = await getPrintData(id);
        setData(result);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Impossible de charger les données du CV.");
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
        
        // S'assurer que les polices (Google Fonts) sont bien chargées avant de générer le PDF
        if (document.fonts) {
          await document.fonts.ready;
        }
        
        // Ajouter un micro-délai pour laisser le DOM respirer (surtout pour Chromium/Playwright)
        setTimeout(() => {
          window.__CV_PRINT_READY__ = true;
        }, 500);
      } catch (error) {
        console.error("PageFlow error:", error);
        window.__CV_PRINT_READY__ = true; // Signal anyway to avoid timeout hang
      }
    };

    const handleCssReady = () => {
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      runPageFlow();
    };

    sourceRef.current.addEventListener('pageflow:css-ready', handleCssReady);

    // Fallback: run after 3s if RemoteStyles never fires
    fallbackTimeout = setTimeout(() => {
      runPageFlow();
    }, 3000);

    return () => {
      isCancelled = true;
      sourceRef.current?.removeEventListener('pageflow:css-ready', handleCssReady);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [data]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-black p-4">
        <h1>{error}</h1>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-black p-4">
        <h1>Chargement du document...</h1>
      </div>
    );
  }

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
          html, body, div, main {
            height: auto !important;
            min-height: auto !important;
          }
          /* Next.js layout wrappers */
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
      
      {/* Hidden source container for PageFlow */}
      <div style={{ display: 'none' }}>
        <div ref={sourceRef}>
          <CVTemplateRenderer 
            templateName={data.template_name}
            data={data.data}
            config={data.config}
            apiBaseUrl=""
          />
        </div>
      </div>

      {/* Visible target container for printed pages */}
      <div ref={targetRef} className="print-container" style={{ width: '210mm', minHeight: '297mm', background: 'white', margin: '0 auto' }} />
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
