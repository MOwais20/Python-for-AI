import type { NextConfig } from "next";
import path from "node:path";
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};
export default nextConfig;
