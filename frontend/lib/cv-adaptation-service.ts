import { aiApi } from '@/lib/ai-api';
import { cvApi } from '@/lib/cv-api';
import { useCvStore } from '@/store/cv';

/**
 * CV-002: Service commun d'adaptation de CV.
 * Centralise l'appel IA et la création du CV avec le bon format.
 */
export const createTailoredCv = async (
  token: string,
  jobDescription: string,
  titleSuffix?: string
) => {
  // 1. Adapter le contenu via l'IA
  const tailoredData = await aiApi.tailorCv(token, jobDescription);

  // 2. Préparer le nom du CV
  const title = titleSuffix
    ? `CV Ciblé – ${titleSuffix}`
    : `CV Ciblé - ${new Date().toLocaleDateString()}`;

  // 3. Préparer le payload unifié
  const payload = {
    title,
    template_id: 'classique',
    doc_type: 'cv',
    content: {
      usage: 'ciblee',
      disabledSections: tailoredData.disabledSections || [],
      disabledItems: tailoredData.disabledItems || {},
      overrides: {
        summary: tailoredData.summary || '',
        experiences: tailoredData.experiences || {},
      },
    },
  };

  // 4. Créer le CV en base
  const newCv = await cvApi.createResume(token, payload);
  
  // 5. Mettre à jour le store global
  useCvStore.getState().addCv(newCv);
  
  return newCv;
};
