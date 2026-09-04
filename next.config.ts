import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.trycloudflare.com",
    "appreciated-samba-gap-wine.trycloudflare.com",
  ],
};

export default nextConfig;
