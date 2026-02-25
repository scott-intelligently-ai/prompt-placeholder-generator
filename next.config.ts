import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/templates": ["./templates/**/*"],
    "/api/extract": ["./templates/**/*"],
    "/api/admin/files": ["./templates/**/*"],
  },
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
