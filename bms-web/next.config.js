/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@tensorflow/tfjs-node'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://bms-backend-production.up.railway.app',
  },
  images: {
    domains: ['bms-backend-production.up.railway.app', 'localhost'],
    unoptimized: true,
  },
  // Disable strict mode for production
  reactStrictMode: false,
  // Enable SWC minification
  swcMinify: true,
}

module.exports = nextConfig
