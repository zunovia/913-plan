import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['globe.gl', 'react-globe.gl', 'three-globe'],
  serverExternalPackages: ['rss-parser'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.nhk.or.jp' },
      { protocol: 'https', hostname: '**.japantimes.co.jp' },
    ],
  },
}

export default nextConfig
