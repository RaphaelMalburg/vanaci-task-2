import type { NextConfig } from "next";
import webpack from "webpack";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: "crypto-browserify",
        stream: "stream-browserify",
      };
      config.plugins.push(
        new NodePolyfillPlugin(),
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );
    }
    return config;
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  transpilePackages: [],
};

export default nextConfig;
