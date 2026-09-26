import React, { lazy, Suspense } from 'react';
import { LetterData } from './types';

// Registry of available letter templates
export const LETTER_TEMPLATE_REGISTRY: Record<string, any> = {
  classique: lazy(() => import('./templates/classique/Template')),
  moderne: lazy(() => import('./templates/moderne/Template')),
  minimal: lazy(() => import('./templates/minimal/Template')),
};

interface LetterTemplateRendererProps {
  templateName: string;
  data: LetterData;
}

export function LetterTemplateRenderer({ templateName, data }: LetterTemplateRendererProps) {
  // Normalize template name (map 'classic' to 'classique', 'modern' to 'moderne', etc.)
  const normalizedName = templateName === 'classic' ? 'classique' : 
                         templateName === 'modern' ? 'moderne' : 
                         templateName === 'minimal' ? 'minimal' : 
                         'classique'; // Default fallback

  const TemplateComponent = LETTER_TEMPLATE_REGISTRY[normalizedName];

  if (!TemplateComponent) {
    return (
      <div className="p-8 text-center text-red-500">
        Template &quot;{templateName}&quot; non trouvé.
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Chargement du modèle...</div>}>
      <TemplateComponent data={data} />
    </Suspense>
  );
}
