
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

  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement du template...</div>}>
      <TemplateComponent data={data} config={config} apiBaseUrl={apiBaseUrl} />
    </Suspense>
  );
};
