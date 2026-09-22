import config from './config';

// URL de base de l'API — utilisée dans tout le fichier
const API_BASE = config.apiBaseUrl;
export { API_BASE };

// Stockage du token en mémoire
let authToken: string | null = null;

// Définir le token d'authentification
export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem(config.auth.tokenKey, token);
  } else {
    localStorage.removeItem(config.auth.tokenKey);
  }
};

// Récupérer le token depuis le stockage local au chargement
if (typeof window !== 'undefined') {
  const token = localStorage.getItem(config.auth.tokenKey);
  if (token) {
    authToken = token;
  }
}

// En-têtes par défaut pour les requêtes
const getDefaultHeaders = (customHeaders: Record<string, string> = {}, accessToken?: string): HeadersInit => {
  const token = accessToken || authToken || null
  const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {}
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...authHeader,
    ...customHeaders,
  } as Record<string, string>
}


// Types
export type Template = {
  templateName: string;
  sections: any[];
  fonts?: any;
  colors?: any;
  layout?: any;
};

export type ResumeData = any;

interface PreviewResponse {
  html: string;
}

interface ExportResponse {
  file: string;
  url?: string;
}

// Gestionnaire de réponses API
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('Erreur API:', response.status, data);

    // Extraction du message d'erreur (FastAPI utilise souvent .detail pour les erreurs 422)
    let errorMessage = data.message;
    if (!errorMessage && data.detail) {
      errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    }
    
    // Gestion des erreurs d'authentification
    if (response.status === 401) {
      console.warn('Non autorisé (401)');
    }

    throw new Error(errorMessage || `Erreur ${response.status}`);
  }

  return data as T;
}

// ===== AUTHENTIFICATION =====

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Connexion
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  const data = await handleResponse<AuthResponse>(response);
  setAuthToken(data.access_token);
  return data;
}

// Inscription
export async function register(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await handleResponse<AuthResponse>(response);
  setAuthToken(data.access_token);
  return data;
}

// Déconnexion
export function logout(): void {
  setAuthToken(null);
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// Récupérer l'utilisateur connecté
export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE}/me`, {
    headers: getDefaultHeaders(),
  });
  return handleResponse<User>(response);
}

// ===== TEMPLATES =====

// Récupérer la liste des templates disponibles
export async function getTemplates(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/templates`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });
    return handleResponse<any[]>(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    return []; // Return empty array on failure to avoid crashing
  }
}

// === Prévisualisation HTML ===
export async function previewHtml(template: Template, data: ResumeData, config?: any, accessToken?: string): Promise<PreviewResponse> {
  const payload = {
    template_name: template.templateName,
    data,
    config
  };
  console.log("SENDING PREVIEW PAYLOAD: ", payload);

  const response = await fetch(`${API_BASE}/preview`, {
    method: 'POST',
    headers: getDefaultHeaders({}, accessToken),
    body: JSON.stringify(payload),
  });
  return handleResponse<PreviewResponse>(response);
}

// === Export PDF ===
export async function exportPdf(
  template: Template, 
  data: ResumeData, 
  out?: string, 
  config?: any, 
  accessToken?: string,
  guestData?: { email: string; name: string },
  plan: string = 'trial',
  templateId?: string | null,
  paymentId?: string
): Promise<ExportResponse> {
  const response = await fetch(`${API_BASE}/exports/export/pdf`, {
    method: 'POST',
    headers: getDefaultHeaders({}, accessToken),
    body: JSON.stringify({
      template_name: template.templateName,
      data,
      out,
      config,
      guest_email: guestData?.email,
      guest_name: guestData?.name,
      plan,
      template_id: templateId,
      payment_id: paymentId ? String(paymentId) : undefined
    }),
  });
  const res = await handleResponse<ExportResponse>(response);
  
  // Ensure the URL is absolute if it's a relative path from the backend
  if (res.url && res.url.startsWith('/')) {
    const urlObj = new URL(API_BASE);
    const backendBase = `${urlObj.protocol}//${urlObj.host}`;
    res.url = `${backendBase}${res.url}`;
  }
  
  return res;
}

// === Export DOCX ===
export async function exportDocx(
  template: Template, 
  data: ResumeData, 
  out?: string, 
  config?: any, 
  accessToken?: string,
  guestData?: { email: string; name: string },
  plan: string = 'trial',
  templateId?: string | null,
  paymentId?: string
): Promise<ExportResponse> {
  const response = await fetch(`${API_BASE}/exports/export/docx`, {
    method: 'POST',
    headers: getDefaultHeaders({}, accessToken),
    body: JSON.stringify({
      template_name: template.templateName,
      data,
      out,
      config,
      guest_email: guestData?.email,
      guest_name: guestData?.name,
      plan,
      template_id: templateId,
      payment_id: paymentId ? String(paymentId) : undefined
    }),
  });
  const res = await handleResponse<ExportResponse>(response);
  
  // Ensure the URL is absolute if it's a relative path from the backend
  if (res.url && res.url.startsWith('/')) {
    const backendBase = API_BASE.replace(/\/api$/, '');
    res.url = `${backendBase}${res.url}`;
  }
  
  return res;
}

// === Get Print Data ===
export async function getPrintData(printId: string): Promise<{ template_name: string; data: any; config: any }> {
  const response = await fetch(`${API_BASE}/exports/print-data/${printId}`, {
    method: 'GET',
    headers: getDefaultHeaders(),
  });
  return handleResponse(response);
}

// === Génération de contenu IA ===
interface GenerateRequest {
  prompt?: string;
  data?: ResumeData;
  role?: string;
}

interface GenerateResponse {
  data: ResumeData;
  source: 'huggingface' | 'openai' | 'stub';
  message?: string;
  error?: string;
}

export async function generateContent(req: GenerateRequest, accessToken?: string): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: getDefaultHeaders({}, accessToken),
    body: JSON.stringify(req),
  });
  return handleResponse<GenerateResponse>(response);
}

/**
 * Génère ou reformule un résumé professionnel percutant avec l'IA
 */
export async function generateSummaryAI(role: string, currentSummary?: string, accessToken?: string): Promise<string | null> {
  try {
    const res = await generateContent({
      prompt: `Rédige un résumé professionnel captivant et percutant de 3-4 phrases en français pour le poste: ${role}.${currentSummary ? ` En tenant compte du profil existant : "${currentSummary}"` : ''}`,
      role: role
    }, accessToken);
    return res.data?.summary || null;
  } catch (err) {
    console.error('Erreur génération résumé IA:', err);
    return null;
  }
}

/**
 * Génère 3 réalisations percutantes avec verbes d'action pour une expérience donnée
 */
export async function generateExperienceBulletsAI(role: string, company: string, accessToken?: string): Promise<string[] | null> {
  try {
    const res = await generateContent({
      prompt: `Donne 3 puces de réalisations chiffrées et concrètes avec verbes d'action pour le poste "${role}" chez "${company || 'l\'entreprise'}".`,
      role: role
    }, accessToken);
    if (res.data?.experience && res.data.experience.length > 0) {
      const exp = res.data.experience[0];
      if (exp.bullets && exp.bullets.length > 0) return exp.bullets;
      if (exp.description) return [exp.description];
    }
    return null;
  } catch (err) {
    console.error('Erreur génération expériences IA:', err);
    return null;
  }
}

// Vérification de la connexion au serveur
export async function checkServerStatus(): Promise<boolean> {
  try {
    const response = await fetch(API_BASE, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur de connexion au serveur:', error);
    return false;
  }
}

// Ré-exporter les fonctions d'authentification depuis la configuration
export const { isAuthenticated } = config;

// Rediriger vers la page de connexion si non authentifié
export function requireAuth(): void {
  if (typeof window !== 'undefined' && !isAuthenticated()) {
    window.location.href = config.paths.login;
  }
}

/**
 * Force le téléchargement d'un fichier à partir d'une URL
 * Utile pour éviter que le navigateur n'ouvre le PDF dans un nouvel onglet
 */
export async function triggerDownload(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Nettoyage
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Erreur lors du téléchargement forcé:', error);
    // Repli sur l'ouverture classique si le fetch échoue (ex: CORS ou réseau)
    window.open(url, '_blank');
  }
}
