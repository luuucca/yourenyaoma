/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co').hostname
  } catch {
    return 'placeholder.supabase.co'
  }
})()

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' },
      // Kept Unsplash for any future user-supplied direct photo URLs.
      // Hangout covers no longer use external photos — they're brand-styled
      // gradient + brand illustration + emoji (see HangoutCover.tsx).
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
}

module.exports = nextConfig
