/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fixes the build error by telling Next.js how to handle the PDF library
  serverExternalPackages: ["pdf-parse"],
};

module.exports = nextConfig;