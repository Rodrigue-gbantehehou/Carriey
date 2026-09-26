import { API_BASE } from './api';

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
      throw new Error('Erreur lors de la génération des slugs');
    }

    const data = await response.json();
    return { suggestions: data.suggestions ?? [], titles: data.titles ?? [] };
  }
};
