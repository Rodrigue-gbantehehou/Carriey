
import React, { lazy, Suspense } from 'react';
import { TemplateProps } from '@/types/cv';

// Registry of available templates
export const TEMPLATE_REGISTRY: Record<string, any> = {
  classique: lazy(() => import('./classique/Template')),
  moderne: lazy(() => import('./moderne/Template')),
  creatif: lazy(() => import('./creatif/Template')),
  abidjan: lazy(() => import('./abidjan/Template')),
  dakar: lazy(() => import('./dakar/Template')),
  professional: lazy(() => import('./professional/Template')),
  rodrigue: lazy(() => import('./rodrigue/Template')),
  tokyo: lazy(() => import('./tokyo/Template')),
  // Lettres de motivation
  letter_classique: lazy(() => import('./letter_classique/Template')),
  letter_moderne: lazy(() => import('./letter_moderne/Template')),
  letter_professional: lazy(() => import('./letter_professional/Template')),
};

interface TemplateRendererProps extends Omit<TemplateProps, 'apiBaseUrl'> {
  templateName: string;
  apiBaseUrl: string;
}

/**
 * Main renderer component that dynamically loads the selected template
 */
export const CVTemplateRenderer: React.FC<TemplateRendererProps> = ({ templateName, data, config, apiBaseUrl }) => {
  const TemplateComponent = TEMPLATE_REGISTRY[templateName.toLowerCase()] || TEMPLATE_REGISTRY.classique;

  // Normaliser la configuration des sections pour les templates 2 colonnes
  // afin que les sections "sidebar" (compétences, langues, contact, etc.) s'affichent toujours
  const isTwoColumn = ['abidjan', 'dakar', 'moderne', 'professional', 'tokyo', 'creatif', 'rodrigue'].includes(templateName.toLowerCase());
  const normalizedConfig = { ...config };
  
  if (isTwoColumn && normalizedConfig.sections) {
    normalizedConfig.sections = normalizedConfig.sections.map((s: any) => {
      // Forcer ces sections dans la colonne de gauche car ces templates ne les gèrent que là
      if (['skills', 'languages', 'contact', 'identity', 'interests', 'photo'].includes(s.type)) {
        return { ...s, column: 'left' };
      }
      return s;
    });
  }

  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement du template...</div>}>
      <TemplateComponent data={data} config={normalizedConfig} apiBaseUrl={apiBaseUrl} />
    </Suspense>
  );
};
