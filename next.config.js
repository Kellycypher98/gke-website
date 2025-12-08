/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack with default configuration (required in Next.js 16
  // when not using the legacy webpack-based builder)
  turbopack: {},
  // Configure image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
  },
  // Enable server-side rendering for improved performance
  output: 'standalone',
};

module.exports = nextConfig;



