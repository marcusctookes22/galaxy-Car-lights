import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set STATIC_EXPORT=true for a client-only preview build. The normal build
  // keeps the server route available for secure quote delivery.
  output: process.env.STATIC_EXPORT === "true" ? "export" : undefined,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH?.trim() || undefined,
  typescript: {
    // Static preview generation is validated separately with `npm run typecheck`.
    ignoreBuildErrors: process.env.STATIC_EXPORT === "true",
  },
  experimental: process.env.STATIC_EXPORT === "true"
    ? { cpus: 1, workerThreads: true }
    : undefined,
  poweredByHeader: false,
  images: {
    unoptimized: process.env.STATIC_EXPORT === "true",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
