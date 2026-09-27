import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export interface CV {
  id: string;
  title: string;
  template_id: string;
  doc_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  content?: {
    usage?: string;
    disabledSections?: string[];
    disabledItems?: Record<string, string[]>;
    [key: string]: any;
  };
  config?: {
    sections?: any[];
    tokens?: Record<string, any>;
    [key: string]: any;
  };
}

export const cvApi = {
  getResumes: async (token: string): Promise<CV[]> => {
    const res = await axios.get(`${API_BASE}/resumes/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getResume: async (token: string, id: string): Promise<CV> => {
    const res = await axios.get(`${API_BASE}/resumes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  createResume: async (token: string, data: { title: string, template_id?: string, doc_type: string, content?: Record<string, any>, config?: Record<string, any> }): Promise<CV> => {
    const res = await axios.post(`${API_BASE}/resumes/`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  updateResume: async (token: string, id: string, data: Partial<CV>): Promise<CV> => {
    const res = await axios.put(`${API_BASE}/resumes/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  deleteResume: async (token: string, id: string): Promise<void> => {
    await axios.delete(`${API_BASE}/resumes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
