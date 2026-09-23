/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Prevent ESLint from failing production builds (we have many unescaped entities)
    ignoreDuringBuilds: true,
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
        // Proxy all /api/v1/* requests to the FastAPI backend (avoids CORS)
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
      },
      {
        // Proxy static backend files (photos, exports, etc.) through Next.js
        source: '/backend-static/:path*',
        destination: 'http://localhost:8000/static/:path*',
      },
      {
        // Legacy backend proxy
        source: '/backend/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;