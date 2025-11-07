import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@morina/ui", "@morina/realtime-client"],
};

export default nextConfig;
