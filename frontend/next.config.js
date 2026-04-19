/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Configuration des alias
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
  async rewrites() {
    // En production sur Vercel, l'API est appelée directement via NEXT_PUBLIC_API_URL
    // Le proxy local n'est utilisé qu'en développement
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    return [
      {
        source: '/backend/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
