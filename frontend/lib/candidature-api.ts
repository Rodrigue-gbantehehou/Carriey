import config from './config';

export const candidaturesApi = {
  async list(token: string) {
    const res = await fetch(`${config.apiBaseUrl}/candidatures/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch candidatures');
    return res.json();
  },

  async get(id: string, token: string) {
    const res = await fetch(`${config.apiBaseUrl}/candidatures/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch candidature');
    return res.json();
  },

  async create(data: any, token: string) {
    const res = await fetch(`${config.apiBaseUrl}/candidatures/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create candidature');
    return res.json();
  },

  async update(id: string, data: any, token: string) {
    const res = await fetch(`${config.apiBaseUrl}/candidatures/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update candidature');
    return res.json();
  },

  async delete(id: string, token: string) {
    const res = await fetch(`${config.apiBaseUrl}/candidatures/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to delete candidature');
    return res.json();
  }
};
