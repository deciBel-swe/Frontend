import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i1.sndcdn.com' },
      { protocol: 'https', hostname: 'i.ibb.co' },
    ],
  },
};


export default nextConfig;
