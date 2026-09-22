'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPrintData } from '@/lib/api';
import { CVTemplateRenderer } from '@/components/app/cv/templates';
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

  useEffect(() => {
    if (!id) {
      setError("Aucun identifiant d'impression fourni.");
      return;
    }

    const fetchData = async () => {
      try {
        const result = await getPrintData(id);
        setData(result);
        
        // Wait a short moment for fonts to load and the DOM to settle before signaling Playwright
        setTimeout(() => {
          window.__CV_PRINT_READY__ = true;
        }, 1500);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Impossible de charger les données du CV.");
      }
    };

    fetchData();
  }, [id]);

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
    <div className="print-container" style={{ width: '210mm', minHeight: '297mm', background: 'white', margin: '0 auto' }}>
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
      `}} />
      <CVTemplateRenderer 
        templateName={data.template_name}
        data={data.data}
        config={data.config}
        apiBaseUrl=""
      />
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div className="p-4">Chargement...</div>}>
      <PrintContent />
    </Suspense>
  );
}
