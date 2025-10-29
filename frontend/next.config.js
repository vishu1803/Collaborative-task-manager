/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ React strict mode (same as before)
  reactStrictMode: true,

  // ✅ Environment variables (unchanged)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  },

  // ✅ Performance optimization
  experimental: {
    optimizeCss: true,
  },

  // ✅ Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },

  // ✅ Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // ✅ Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // ✅ Turbopack configuration (required for Next.js 16)
  turbopack: {
    // You can add advanced options here if needed later
  },

  // ✅ Output configuration (optional for deployment)
  // output: 'standalone',

  // ✅ Miscellaneous settings
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
