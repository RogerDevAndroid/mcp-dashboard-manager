/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'storage.googleapis.com',
      'services.leadconnectorhq.com',
    ],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  async rewrites() {
    return [
      {
        source: '/api/ghl/:path*',
        destination: 'https://services.leadconnectorhq.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
