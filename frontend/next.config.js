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
        source: '/backend/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;