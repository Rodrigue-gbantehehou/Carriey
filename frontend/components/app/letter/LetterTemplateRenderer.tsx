import React, { Suspense } from 'react';
import { LetterData } from './types';
import { LETTER_TEMPLATE_REGISTRY } from './templates/registry';

interface LetterTemplateRendererProps {
  templateName: string;
  folderName?: string;
  data: LetterData;
}

export function LetterTemplateRenderer({ templateName, folderName, data }: LetterTemplateRendererProps) {
  // Normalize template name
  let normalizedName = folderName || (templateName || '').toLowerCase();
                         
  // Si le slug de base de données est préfixé par "lettre-", on le retire pour trouver le bon dossier React
  if (!folderName && normalizedName.startsWith('lettre-')) {
    normalizedName = normalizedName.replace('lettre-', '');
  }
  // Si le slug est suffixé par "_lettre" (ex: "classique_lettre"), on retire le suffixe
  if (!folderName && normalizedName.endsWith('_lettre')) {
    normalizedName = normalizedName.replace('_lettre', '');
  }

  // Utilisation du registre généré automatiquement
  const TemplateComponent = LETTER_TEMPLATE_REGISTRY[normalizedName];

  if (!TemplateComponent) {
    return (
      <div className="p-8 text-center text-red-500">
        Template "{normalizedName}" non trouvé dans le registre généré.
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Chargement du modèle...</div>}>
      <TemplateComponent data={data} />
    </Suspense>
  );
}
