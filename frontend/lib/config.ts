// Configuration de l'application
export const config = {
  // Informations de base de l'application
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Carriey',
  appLogo: process.env.NEXT_PUBLIC_APP_LOGO || '/logo.png',

  // URL de base de l'API
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '/api/v1',

  // Configuration de l'authentification
  auth: {
    // Durée de validité du token en secondes (24 heures par défaut)
    tokenExpiry: 24 * 60 * 60,
    // Clé legacy (non utilisée — auth gérée par NextAuth)
    tokenKey: 'auth_token',
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
