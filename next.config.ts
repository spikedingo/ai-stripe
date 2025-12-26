import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Empty turbopack config to enable Turbopack (Next.js 16 default)
  turbopack: {},
  
  // Transpile Privy packages
  transpilePackages: ["@privy-io/react-auth"],
};

export default nextConfig;
