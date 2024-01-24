/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "pub-4832181b1dbd4148b56deccedb1811d5.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pub-02f7232c65e74c62973ec271fd4d9a11.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pub-be98badc6a8347d3ac3567baa175a738.r2.dev",
      }
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
