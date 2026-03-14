// Configuration de l'application
export const config = {
  // URL de base de l'API
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  
  // Configuration de l'authentification
  auth: {
    // Durée de validité du token en secondes (24 heures par défaut)
    tokenExpiry: 24 * 60 * 60,
    // Clé pour le stockage local du token
    tokenKey: 'auth_token',
    // Clé pour le stockage local des informations utilisateur
    userKey: 'user_data',
  },

  // Chemins de l'application
  paths: {
    login: '/login',
    register: '/register',
    home: '/',
    editor: '/editor',
    templates: '/templates',
    profile: '/profile',
  },

  // Configuration des requêtes API
  api: {
    timeout: 30000, // 30 secondes
    maxRetries: 3,
  },

  // Fonction utilitaire pour obtenir l'en-tête d'authentification
  getAuthHeader: (token?: string) => {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },
};

export default config;
