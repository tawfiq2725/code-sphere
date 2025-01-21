import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async headers() {
    return [];
  },
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "codesphere.s3.ap-southeast-2.amazonaws.com",
    ],
  },
};

export default nextConfig;
