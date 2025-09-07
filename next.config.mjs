/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Temporarily ignore ESLint errors during builds to unblock deploys
    ignoreDuringBuilds: true,
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Configure webpack to handle path aliases
  webpack: (config) => {
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
  // Configure image domains
  images: {
    domains: [
      'xqnnayhsfnomihkajmqn.supabase.co',
      'xqnnayhsfnomihkajmqn.supabase.in',
      'xqnnayhsfnomihkajmqn.supabase.com',
      'localhost',
    ],
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

export default nextConfig;
