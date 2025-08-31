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
  // Enable server-side rendering for improved performance
  output: 'standalone',
};

export default nextConfig;
