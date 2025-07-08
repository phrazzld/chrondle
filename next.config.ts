import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Server Actions are enabled by default in Next.js 15
  // No experimental configuration needed
};

export default withBundleAnalyzer(nextConfig);
