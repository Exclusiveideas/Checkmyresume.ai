import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Increase serverActions timeout for long-running operations
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Configure max duration for API routes (in seconds)
  // This is especially important for Vercel deployments
  // Note: Vercel Hobby has a 10s limit, Pro has 60s limit
  // For self-hosted deployments, this can be higher
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'x-vercel-maxDuration',
            value: '120', // 2 minutes for API routes
          },
        ],
      },
    ];
  },
};

export default nextConfig;
