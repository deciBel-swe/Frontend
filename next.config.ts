import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'a-v2.sndcdn.com' }, // (SoundCloud)
      { protocol: 'https', hostname: 'tse3.mm.bing.net' }, //  (Bing)
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i1.sndcdn.com' },
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'decibelblob.blob.core.windows.net' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};


export default nextConfig;
