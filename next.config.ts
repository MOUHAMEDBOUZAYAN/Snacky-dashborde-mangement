import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack from treating a parent-folder lockfile as the workspace root
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
