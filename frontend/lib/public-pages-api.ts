import axios from 'axios';
import { PublicPage, PublicPageCreate, PublicPageUpdate, SlugCheck, PublicPageData } from '@/types/public-page';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function authHeaders(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const publicPagesApi = {
  /** List my pages */
  list: async (token: string): Promise<PublicPage[]> => {
    const { data } = await axios.get(`${BASE}/pages/`, authHeaders(token));
    return data;
  },

  /** Create a new page */
  create: async (token: string, payload: PublicPageCreate): Promise<PublicPage> => {
    const { data } = await axios.post(`${BASE}/pages/`, payload, authHeaders(token));
    return data;
  },

  /** Update an existing page */
  update: async (token: string, id: string, payload: PublicPageUpdate): Promise<PublicPage> => {
    const { data } = await axios.patch(`${BASE}/pages/${id}`, payload, authHeaders(token));
    return data;
  },

  /** Delete a page */
  delete: async (token: string, id: string): Promise<void> => {
    await axios.delete(`${BASE}/pages/${id}`, authHeaders(token));
  },

  /** Check if a slug is available */
  checkSlug: async (token: string, slug: string, excludeId?: string): Promise<SlugCheck> => {
    const params = new URLSearchParams({ slug });
    if (excludeId) params.append('exclude_id', excludeId);
    const { data } = await axios.get(`${BASE}/pages/check-slug?${params}`, authHeaders(token));
    return data;
  },

  /** Fetch a public page (no auth) */
  getPublic: async (slug: string): Promise<PublicPageData> => {
    const { data } = await axios.get(`${BASE}/pages/public/${slug}`);
    return data;
  },
};
