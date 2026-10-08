import { API_BASE } from './api';

/**
 * CV-001 — Contrat du endpoint POST /ai/tailor-cv
 * Toute modification de ce type DOIT être répercutée dans service.py (tailor_cv)
 */
export interface TailorCvResponse {
  /** Accroche adaptée pour l'offre */
  summary: string;
  /**
   * Map id_expérience → { description: string }
   * Les descriptions sont réécrites avec les mots-clés de l'offre.
   */
  experiences: Record<string, { description: string }>;
  /** Sections hors-sujet à masquer (ex: ["projects"]) */
  disabledSections: string[];
  /** Items hors-sujet par section (ex: { experiences: ["id1"] }) */
  disabledItems: Record<string, string[]>;
}

export const aiApi = {
  generateCoverLetter: async (token: string, jobDescription: string) => {
    const response = await fetch(`${API_BASE}/ai/generate-cover-letter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ job_description: jobDescription }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de la lettre');
    }

    return response.json();
  },

  generatePublicBio: async (token: string, targetAudience: string = "Recruteurs et professionnels") => {
    const response = await fetch(`${API_BASE}/ai/generate-public-bio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ target_audience: targetAudience }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de la bio IA');
    }

    return response.json();
  },

  generateSlugSuggestions: async (token: string): Promise<{ suggestions: string[]; titles: string[] }> => {
    const response = await fetch(`${API_BASE}/ai/generate-slug-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const detail = err?.detail || 'Erreur lors de la génération des slugs';
      throw new Error(`${response.status}: ${detail}`);
    }

    const data = await response.json();
    return { suggestions: data.suggestions ?? [], titles: data.titles ?? [] };
  },

  tailorCv: async (token: string, jobDescription: string): Promise<TailorCvResponse> => {
    const response = await fetch(`${API_BASE}/ai/tailor-cv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ job_description: jobDescription }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const detail = err?.detail || "Erreur lors de l'adaptation du CV";
      throw new Error(`${response.status}: ${detail}`);
    }

    return response.json() as Promise<TailorCvResponse>;
  }
};
