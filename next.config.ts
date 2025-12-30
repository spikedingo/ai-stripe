import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Transpile Privy packages
  transpilePackages: ["@privy-io/react-auth"],

  // Webpack configuration to fix build issues with test files
  webpack: (config, { webpack }) => {
    // Ignore test files and problematic dependencies
    config.plugins.push(
      new webpack.IgnorePlugin({
        // Ignore test directories
        resourceRegExp: /\/test\//,
      }),
      new webpack.IgnorePlugin({
        // Ignore test files
        resourceRegExp: /\.test\.(js|jsx|ts|tsx|mjs)$/,
      }),
      new webpack.IgnorePlugin({
        // Ignore bench files
        resourceRegExp: /\/bench\.(js|mjs)$/,
      }),
      new webpack.IgnorePlugin({
        // Ignore problematic test dependencies
        resourceRegExp: /^(tap|tape|why-is-node-running|pino-elasticsearch|fastbench)$/,
      })
    );

    return config;
  },
};

export default nextConfig;
