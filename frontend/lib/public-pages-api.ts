import { PublicPage, PublicPageCreate, PublicPageUpdate, SlugCheck, PublicPageData } from '@/types/public-page';

const BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Erreur ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch { /* ignore */ }
    throw Object.assign(new Error(detail), { response: { status: res.status, data: { detail } } });
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const publicPagesApi = {
  /** List my pages */
  list: async (token: string): Promise<PublicPage[]> => {
    const res = await fetch(`${BASE}/pages/`, { headers: authHeaders(token) });
    return handleResponse<PublicPage[]>(res);
  },

  /** Create a new page */
  create: async (token: string, payload: PublicPageCreate): Promise<PublicPage> => {
    const res = await fetch(`${BASE}/pages/`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<PublicPage>(res);
  },

  /** Update an existing page */
  update: async (token: string, id: string, payload: PublicPageUpdate): Promise<PublicPage> => {
    const res = await fetch(`${BASE}/pages/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse<PublicPage>(res);
  },

  /** Delete a page */
  delete: async (token: string, id: string): Promise<void> => {
    const res = await fetch(`${BASE}/pages/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return handleResponse<void>(res);
  },

  /** Check if a slug is available */
  checkSlug: async (token: string, slug: string, excludeId?: string): Promise<SlugCheck> => {
    const params = new URLSearchParams({ slug });
    if (excludeId) params.append('exclude_id', excludeId);
    const res = await fetch(`${BASE}/pages/check-slug?${params}`, {
      headers: authHeaders(token),
    });
    return handleResponse<SlugCheck>(res);
  },

  /** Fetch a public page (no auth) */
  getPublic: async (slug: string): Promise<PublicPageData> => {
    const res = await fetch(`${BASE}/pages/public/${slug}`, { cache: 'no-store' });
    return handleResponse<PublicPageData>(res);
  },
};
