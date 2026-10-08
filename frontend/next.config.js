/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    workerThreads: false,
    cpus: 1,
    staticGenerationMaxConcurrency: 1,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },

  async rewrites() {
    return [
      {
        // Proxy all /api/* requests EXCEPT /api/auth/* and /api/template-css/* to the FastAPI backend
        source: '/api/:path((?!auth|template-css).*)',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api'}/:path*`,
      },
      {
        // Proxy static backend files (photos, exports, etc.) through Next.js
        source: '/backend-static/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '/static') : 'http://localhost:10000/static'}/:path*`,
      },
      {
        // Legacy backend proxy
        source: '/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:10000'}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;