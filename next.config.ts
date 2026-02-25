import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/templates": ["./templates/**/*"],
    "/api/extract": ["./templates/**/*"],
    "/api/admin/files": ["./templates/**/*"],
    "/api/assemble-prompt": ["./templates/**/*"],
  },
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
