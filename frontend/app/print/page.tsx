'use client';

import { useEffect, useState, Suspense } from 'react';
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
        
        // Attendre que les polices web soient chargées
        if (typeof document !== 'undefined' && document.fonts) {
          try { await document.fonts.ready; } catch (_) {}
        }
        
        // Laisser 800ms pour que les composants React et styles soient peints
        setTimeout(() => {
          window.__CV_PRINT_READY__ = true;
        }, 800);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Impossible de charger les données du CV.");
        window.__CV_PRINT_READY__ = true;
      }
    };

    fetchData();
  }, [id]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-red-600 p-4">
        <h1>{error}</h1>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="print-hide-loader flex items-center justify-center h-screen bg-white text-black p-4 fixed inset-0 z-50">
        <h1 className="text-lg font-semibold">Chargement du document...</h1>
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
        }
      `}} />

      {/* Rendu direct du template A4 (Chromium gère nativement le rendu et la pagination @media print) */}
      <div 
        className="a4-print-container" 
        style={{ width: '210mm', minHeight: '297mm', background: 'white', margin: '0 auto' }} 
      >
        <CVTemplateRenderer 
          templateName={data.template_name}
          data={data.data}
          config={data.config}
          apiBaseUrl={API_BASE}
        />
      </div>
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
