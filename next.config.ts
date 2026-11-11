import type { NextConfig } from "next";

// GitHub Pages serves a project site under /<repo>; the deploy workflow passes that in.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // The atlas is fully client-side, so it ships as plain static files (written to ./out).
  output: "export",
  basePath,
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
