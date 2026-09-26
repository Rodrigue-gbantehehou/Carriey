'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPrintData } from '@/lib/api';
import { LetterTemplateRenderer } from '@/components/app/letter/LetterTemplateRenderer';

declare global {
  interface Window {
    __CV_PRINT_READY__?: boolean;
  }
}

function PrintLetterContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [data, setData] = useState<{
    template_name: string;
    data: any;
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
        
        if (document.fonts) {
          await document.fonts.ready;
        }
        
        setTimeout(() => {
          window.__CV_PRINT_READY__ = true;
        }, 1000);
      } catch (err) {
        console.error("Erreur lors de la récupération des données de la lettre:", err);
        setError("Impossible de charger les données de la lettre.");
        window.__CV_PRINT_READY__ = true;
      }
    };

    fetchData();
  }, [id]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="p-4">Chargement...</div>;
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
        ::-webkit-scrollbar {
          display: none;
        }
      `}} />
      
      <div 
        className="a4-print-container" 
        style={{ width: '210mm', minHeight: '297mm', background: 'white', margin: '0 auto', padding: '20mm', overflow: 'hidden' }}
      >
        <LetterTemplateRenderer 
          templateName={data.template_name}
          data={data.data}
        />
      </div>
    </>
  );
}

export default function PrintLetterPage() {
  return (
    <Suspense fallback={<div className="p-4">Chargement de l'impression...</div>}>
      <PrintLetterContent />
    </Suspense>
  );
}
