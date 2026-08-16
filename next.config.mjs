/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["172.29.192.1", "locahost:3000", "*.ngrok-free.app"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },

      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },

      {
        protocol: "https",
        hostname: "cf.geekdo-images.com",
      },

      {
        protocol: "https",
        hostname: "*.geekdo-images.com",
      },

      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
