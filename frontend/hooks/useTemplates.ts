/**
 * useTemplates — charge les templates actifs depuis l'API backend.
 * Remplace l'ancien fichier statique config/themes.ts :
 * le prix, le label et le slug viennent directement de la BDD.
 */
'use client';

import { useEffect, useState } from 'react';

export interface ApiTemplate {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  preview_image: string | null;
  is_active: boolean;
  template_type: string;
}

export function useTemplates(templateType: string = 'cv') {
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTemplates() {
      try {
        const res = await fetch('/api/templates');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiTemplate[] = await res.json();
        if (!cancelled) {
          // Filtre par type et actifs uniquement
          setTemplates(data.filter(t => t.is_active && t.template_type === templateType));
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTemplates();
    return () => { cancelled = true; };
  }, [templateType]);

  /** Retrouve le label d'un template à partir de son slug ou id */
  function getLabel(slugOrId: string): string {
    const t = templates.find(t => t.slug === slugOrId || t.id === slugOrId);
    return t ? t.name : slugOrId;
  }

  /** Retrouve le prix formaté d'un template */
  function getPrice(slugOrId: string): number {
    const t = templates.find(t => t.slug === slugOrId || t.id === slugOrId);
    return t ? Number(t.price) : 0;
  }

  return { templates, loading, error, getLabel, getPrice };
}
