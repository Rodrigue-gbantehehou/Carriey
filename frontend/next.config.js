/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Fix "ReferenceError: __dirname is not defined" sur Vercel.
  // Certains packages CJS (ex: @prisma/client, nunjucks) utilisent __dirname
  // en interne. Quand Next.js les bundle en ESM côté serveur, __dirname
  // n'existe pas. Ce fix webpack l'injecte explicitement dans le bundle serveur.
  serverExternalPackages: ['nunjucks', '@prisma/client', '@auth/prisma-adapter'],

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