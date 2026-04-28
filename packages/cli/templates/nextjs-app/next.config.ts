import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@workspace/ui'],
  output: 'standalone',
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
