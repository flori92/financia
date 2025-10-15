/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true, // allow importing tokens from ../bms
  },
  reactStrictMode: true,
};

export default nextConfig;
