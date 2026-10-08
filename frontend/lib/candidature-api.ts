import config from './config';
import { getSession } from 'next-auth/react';

export const candidaturesApi = {
  async list() {
    const session = await getSession();
    if (!session?.user?.accessToken) return [];

    const res = await fetch(`${config.apiBaseUrl}/candidatures/`, {
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch candidatures');
    return res.json();
  },

  async get(id: string) {
    const session = await getSession();
    if (!session?.user?.accessToken) return null;

    const res = await fetch(`${config.apiBaseUrl}/candidatures/${id}`, {
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch candidature');
    return res.json();
  },

  async create(data: any) {
    const session = await getSession();
    if (!session?.user?.accessToken) throw new Error("Unauthorized");

    const res = await fetch(`${config.apiBaseUrl}/candidatures/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create candidature');
    return res.json();
  },

  async update(id: string, data: any) {
    const session = await getSession();
    if (!session?.user?.accessToken) throw new Error("Unauthorized");

    const res = await fetch(`${config.apiBaseUrl}/candidatures/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update candidature');
    return res.json();
  },

  async delete(id: string) {
    const session = await getSession();
    if (!session?.user?.accessToken) throw new Error("Unauthorized");

    const res = await fetch(`${config.apiBaseUrl}/candidatures/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`
      }
    });
    if (!res.ok) throw new Error('Failed to delete candidature');
    return res.json();
  }
};
