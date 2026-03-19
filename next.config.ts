import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "images.salsify.com",
        pathname: "/image/upload/**",
      },
      {
        protocol: "https",
        hostname: "images.salsify.com",
        pathname: "/image/upload/**",
      },
      {
        protocol: "http",
        hostname: "images.salsify.com",
        pathname: "/video/upload/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
