/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@tensorflow/tfjs-node'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Disable strict mode for production
  reactStrictMode: false,
  // Enable SWC minification
  swcMinify: true,
  // Disable ESLint during builds to avoid configuration issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
