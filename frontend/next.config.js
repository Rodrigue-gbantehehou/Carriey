/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  webpack: (config) => {
    // Configuration des alias
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
  async rewrites() {
    // En production sur Vercel, on préfère appeler l'API directement via NEXT_PUBLIC_API_URL
    // Mais on garde la réecriture pour le développement local
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    return [
      {
        source: '/backend/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ]
  },
};

module.exports = nextConfig;
