/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // Temporarily ignore ESLint errors during builds to unblock deploys
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;



