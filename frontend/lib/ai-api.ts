import { API_BASE } from './api';
import { z } from 'zod';

// ─── Schémas Zod (validation runtime) ────────────────────────────────────────
// CV-001: Source de vérité partagée entre TypeScript et l'API backend.
// Toute modification du prompt dans service.py doit être reflétée ici.

export const TailorCvResponseSchema = z.object({
  /** Accroche adaptée pour l'offre (2-3 phrases) */
  summary: z.string(),
  /**
   * Map id_expérience → { description: string }
   * Les descriptions sont réécrites avec les mots-clés de l'offre.
   */
  experiences: z.record(z.string(), z.object({ description: z.string() })).default({}),
  /** Sections hors-sujet à masquer (ex: ["projects"]) */
  disabledSections: z.array(z.string()).default([]),
  /** Items hors-sujet par section (ex: { experiences: ["id1"] }) */
  disabledItems: z.record(z.string(), z.array(z.string())).default({}),
});

export type TailorCvResponse = z.infer<typeof TailorCvResponseSchema>;

export const AnalyzeFitResponseSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  location: z.string().optional(),
  score: z.number().min(0).max(100),
  verdict: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  angle: z.object({
    title: z.string(),
    advice: z.string(),
  }),
  keywords_to_use: z.array(z.string()),
});

export type AnalyzeFitResponse = z.infer<typeof AnalyzeFitResponseSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function parseJsonResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
  errorMsg: string,
): Promise<T> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const detail = (err as any)?.detail || errorMsg;
    throw new Error(`${response.status}: ${detail}`);
  }
  const raw = await response.json();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error('[AI API] Validation échouée:', parsed.error.flatten());
    // On log et on renvoie quand même les données brutes castées pour ne pas bloquer l'UX
    // mais on peut choisir de lever une erreur si la rigueur est requise
    return raw as T;
  }
  return parsed.data;
}

// ─── API ──────────────────────────────────────────────────────────────────────

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
      const detail = (err as any)?.detail || 'Erreur lors de la génération des slugs';
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

    return parseJsonResponse(
      response,
      TailorCvResponseSchema,
      "Erreur lors de l'adaptation du CV",
    );
  },

  analyzeFit: async (token: string, jobDescription: string): Promise<AnalyzeFitResponse> => {
    const response = await fetch(`${API_BASE}/ai/analyze-fit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ job_description: jobDescription }),
    });

    return parseJsonResponse(
      response,
      AnalyzeFitResponseSchema,
      "Erreur lors de l'analyse de correspondance",
    );
  },
};
