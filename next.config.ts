import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Satori embeds fonts from disk. Trace them explicitly so the OG routes keep
  // their typography in a serverless bundle instead of falling back to tofu.
  outputFileTracingIncludes: {
    '/og': ['./src/app/og/fonts/**'],
    '/og/board': ['./src/app/og/fonts/**'],
    '/og/duel': ['./src/app/og/fonts/**'],
    '/og/listing': ['./src/app/og/fonts/**'],
    '/og/text': ['./src/app/og/fonts/**'],
  },
}

export default nextConfig
