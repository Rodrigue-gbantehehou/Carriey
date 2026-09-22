
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
  const safeTemplateName = (templateName || 'classique').toLowerCase();
  const TemplateComponent = TEMPLATE_REGISTRY[safeTemplateName] || TEMPLATE_REGISTRY.classique;

  const isTwoColumn = ['abidjan', 'dakar', 'moderne', 'professional', 'tokyo', 'creatif', 'rodrigue'].includes(safeTemplateName);
  
  const defaultSections = [
    { type: 'photo', enabled: true, column: 'left' },
    { type: 'identity', enabled: true, column: 'left' },
    { type: 'contact', enabled: true, column: 'left' },
    { type: 'skills', enabled: true, column: 'left' },
    { type: 'languages', enabled: true, column: 'left' },
    { type: 'interests', enabled: true, column: 'left' },
    { type: 'summary', enabled: true, column: 'right' },
    { type: 'experience', enabled: true, column: 'right' },
    { type: 'education', enabled: true, column: 'right' },
    { type: 'projects', enabled: true, column: 'right' },
    { type: 'references', enabled: true, column: 'right' },
  ];

  const sectionsToUse = config?.sections && config.sections.length > 0 ? config.sections : defaultSections;

  const normalizedSections = sectionsToUse.map((s: any) => {
    if (isTwoColumn && ['skills', 'languages', 'contact', 'identity', 'interests', 'photo'].includes(s.type)) {
      return { ...s, column: s.column || 'left' };
    }
    return s;
  });

  const normalizedConfig = {
    ...config,
    templateName: safeTemplateName,
    sections: normalizedSections,
  };

  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement du template...</div>}>
      <TemplateComponent data={data} config={normalizedConfig} apiBaseUrl={apiBaseUrl} />
    </Suspense>
  );
};
