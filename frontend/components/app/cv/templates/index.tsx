
import React, { lazy, Suspense } from 'react';
import { TemplateProps } from '@/types/cv';
import { CV_TEMPLATE_REGISTRY } from './registry';
export { CV_TEMPLATE_REGISTRY as TEMPLATE_REGISTRY };

interface TemplateRendererProps extends Omit<TemplateProps, 'apiBaseUrl'> {
  templateName: string;
  apiBaseUrl: string;
}

export const getDefaultSections = (templateName: string) => {
  const rawName = (templateName || 'classique').toLowerCase();
  const resolvedSlug = rawName || 'classique';
  const isTwoColumn = ['abidjan', 'dakar', 'moderne', 'professional', 'tokyo', 'creatif', 'rodrigue'].includes(resolvedSlug);
  
  const defaultTwoColumnSections = [
    { type: 'photo', enabled: true, column: 'left' },
    { type: 'identity', enabled: true, column: 'left' },
    { type: 'contact', enabled: true, column: 'left' },
    { type: 'skills', enabled: true, column: 'left' },
    { type: 'languages', enabled: true, column: 'left' },
    { type: 'interests', enabled: true, column: 'left' },
    { type: 'summary', enabled: true, column: 'right' },
    { type: 'experience', enabled: true, column: 'right' },
    { type: 'education', enabled: true, column: 'right' },
    { type: 'certifications', enabled: true, column: 'right' },
    { type: 'projects', enabled: true, column: 'right' },
    { type: 'references', enabled: true, column: 'right' },
  ];

  const defaultOneColumnSections = [
    { type: 'summary', enabled: true, column: 'left' },
    { type: 'experience', enabled: true, column: 'left' },
    { type: 'education', enabled: true, column: 'left' },
    { type: 'skills', enabled: true, column: 'left' },
    { type: 'languages', enabled: true, column: 'left' },
    { type: 'projects', enabled: true, column: 'left' },
    { type: 'certifications', enabled: true, column: 'left' },
    { type: 'references', enabled: true, column: 'left' },
    { type: 'interests', enabled: true, column: 'left' },
    { type: 'photo', enabled: true, column: 'left' },
    { type: 'identity', enabled: true, column: 'left' },
    { type: 'contact', enabled: true, column: 'left' },
  ];

  return isTwoColumn ? defaultTwoColumnSections : defaultOneColumnSections;
};

/**
 * Main renderer component that dynamically loads the selected template
 */
export const CVTemplateRenderer: React.FC<TemplateRendererProps> = ({ templateName, data, config, apiBaseUrl }) => {
  const rawName = (templateName || '').toLowerCase();
  
  // Utilisation de la registry générée
  const TemplateComponent = CV_TEMPLATE_REGISTRY[rawName];

  if (!TemplateComponent) {
    return (
      <div className="p-8 text-center bg-gray-50 border border-red-200 rounded-lg h-full flex flex-col items-center justify-center">
        <div className="text-red-500 font-bold mb-2">Modèle non disponible</div>
        <p className="text-sm text-gray-500">
          Le modèle "{rawName}" n'existe pas dans le registre. (Avez-vous lancé npm run generate-templates ?)
        </p>
      </div>
    );
  }

  const resolvedSlug = rawName;

  const isTwoColumn = ['abidjan', 'dakar', 'moderne', 'professional', 'tokyo', 'creatif', 'rodrigue'].includes(resolvedSlug);
  
  const defaultSections = getDefaultSections(resolvedSlug);

  // Si l'utilisateur a sauvegardé ses propres sections on les garde, sinon on utilise l'ordre par défaut du template.
  let sectionsToUse = config?.sections && config.sections.length > 0 ? config.sections : defaultSections;

  // Auto-migration en temps réel : si le CV utilise un template 1-colonne mais possède l'ordre par défaut 2-colonnes
  const typesOrder = sectionsToUse.map((s: any) => s.type).join(',');
  const twoColumnDefaults = getDefaultSections('abidjan');
  const oneColumnDefaults = getDefaultSections('classique');
  const defaultTwoColumnTypes = twoColumnDefaults.map(s => s.type).join(',');
  
  if (!isTwoColumn && typesOrder === defaultTwoColumnTypes) {
    sectionsToUse = [...sectionsToUse].sort((a: any, b: any) => {
      const idxA = oneColumnDefaults.findIndex(s => s.type === a.type);
      const idxB = oneColumnDefaults.findIndex(s => s.type === b.type);
      return (idxA !== -1 ? idxA : 999) - (idxB !== -1 ? idxB : 999);
    });
  }

  // Normalisation des colonnes pour s'assurer que les templates 2-colonnes ne cassent pas
  const normalizedSections = sectionsToUse.map((s: any) => {
    if (isTwoColumn && ['skills', 'languages', 'contact', 'identity', 'interests', 'photo'].includes(s.type)) {
      return { ...s, column: s.column || 'left' };
    }
    return s;
  });

  const normalizedConfig = {
    ...config,
    templateName: resolvedSlug,
    sections: normalizedSections,
  };

  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement du template...</div>}>
      <TemplateComponent data={data} config={normalizedConfig} apiBaseUrl={apiBaseUrl} />
    </Suspense>
  );
};
