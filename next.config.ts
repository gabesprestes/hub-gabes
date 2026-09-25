import type { NextConfig } from "next";

const repo = "hub-gabes";
const isPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isPages ? `/${repo}` : "",
  assetPrefix: isPages ? `/${repo}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: isPages ? `/${repo}` : "",
  },
};

export default nextConfig;
