/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mongoose relies on Node APIs; keep it external to the server bundle.
  serverExternalPackages: ['mongoose'],
};

export default nextConfig;
