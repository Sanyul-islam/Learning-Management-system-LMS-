import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  // Tell Next.js NOT to bundle these Node.js/CommonJS packages
  // They run server-side only via the /api/[...path] route handler
  serverExternalPackages: [
    'express',
    'mongoose',
    'bcryptjs',
    'jsonwebtoken',
    'cors',
    'dotenv',
  ],
};

export default nextConfig;
