import React, { Suspense } from 'react';
import { PublicPageData } from '@/types/public-page';
import { PUBLIC_PAGE_TEMPLATE_REGISTRY } from './registry';

interface PublicPageTemplateRendererProps {
  templateName: string;
  data: PublicPageData;
  accent: string;
}

export function PublicPageTemplateRenderer({ templateName, data, accent }: PublicPageTemplateRendererProps) {
  const normalizedName = (templateName || 'modern').toLowerCase();
  
  // Utilisation du registre généré automatiquement
  const TemplateComponent = PUBLIC_PAGE_TEMPLATE_REGISTRY[normalizedName] || PUBLIC_PAGE_TEMPLATE_REGISTRY['modern'];

  if (!TemplateComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center text-red-500 bg-gray-50">
        Template "{normalizedName}" non trouvé dans le registre généré.
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Chargement de la page publique...</div>}>
      <TemplateComponent data={data} accent={accent} />
    </Suspense>
  );
}
