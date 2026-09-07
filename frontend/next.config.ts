import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Docker production image
  allowedDevOrigins: ["192.168.1.20", "192.168.1.21"],
  async rewrites() {
    // Proxy API calls to the FastAPI backend (same-origin for cookies/Bearer)
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL ?? "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
