/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Empêche Next.js de bundler nunjucks côté serveur.
  // nunjucks est un package CommonJS qui utilise __dirname en interne,
  // ce qui provoque un ReferenceError sur Vercel (ESM runtime).
  // Il est utilisé uniquement côté client via nunjucks/browser/nunjucks.js.
  serverExternalPackages: ['nunjucks'],

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