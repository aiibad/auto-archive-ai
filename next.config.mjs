/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is the magic fix for the "Module not found" error
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;