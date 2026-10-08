// Configuration de l'application
export const config = {
  // Informations de base de l'application
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Carriey',
  appLogo: process.env.NEXT_PUBLIC_APP_LOGO || '/logo.png',

  // Configuration de l'API
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  
  // URL de base de l'API (ex: http://localhost:8000/api ou /api)
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  
  // URL pour les fichiers statiques du backend (ex: http://localhost:8000/static)
  staticBaseUrl: (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000') + '/static',

  // Configuration de l'authentification
  auth: {
    // Durée de validité du token en secondes (24 heures par défaut)
    tokenExpiry: 24 * 60 * 60,
    // Clé legacy (non utilisée — auth gérée par NextAuth)
    tokenKey: 'auth_token',
  },

  // Configuration Légale (CGU / Confidentialité)
  legal: {
    currentTermsVersion: '1.1', // Incrementez ceci pour forcer les utilisateurs à réaccepter les CGU
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
};

export default config;
