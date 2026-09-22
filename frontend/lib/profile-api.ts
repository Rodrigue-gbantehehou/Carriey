import { API_BASE } from './api';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const profileApi = {
  getProfile: async (token: string) => {
    const res = await fetch(`${API_BASE}/profile/me`, { headers: getHeaders(token) });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
  },
  
  createProfile: async (token: string, data: any) => {
    const res = await fetch(`${API_BASE}/profile/me`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create profile");
    return res.json();
  },

  updateProfile: async (token: string, data: any) => {
    const res = await fetch(`${API_BASE}/profile/me`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
  },

  // Sub-entities generic helper
  addSubEntity: async (token: string, entity: string, data: any) => {
    const res = await fetch(`${API_BASE}/profile/me/${entity}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to add ${entity}`);
    return res.json();
  },

  deleteSubEntity: async (token: string, entity: string, id: string) => {
    const res = await fetch(`${API_BASE}/profile/me/${entity}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    if (!res.ok) throw new Error(`Failed to delete ${entity}`);
    return true;
  }
};
