/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Fix "ReferenceError: __dirname is not defined" sur Vercel.
  // serverComponentsExternalPackages empêche Next.js de bundler ces packages
  // en ESM (où __dirname n'existe pas). Ils sont chargés via require() natif.
  experimental: {
    serverComponentsExternalPackages: ['nunjucks', '@prisma/client', '@auth/prisma-adapter', 'bcryptjs'],
  },

  // Fallback: injecte __dirname dans tous les bundles webpack serveur.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.node = {
        ...config.node,
        __dirname: true,
        __filename: true,
      };
    }
    return config;
  },

  async rewrites() {
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