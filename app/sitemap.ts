import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Static sitemap for the public surface. Listings + hangouts are dynamic and
// re-rendered per request; we don't index every transient row but we DO want
// the discovery pages above them.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const staticRoutes: { path: string; priority: number }[] = [
    { path: '', priority: 1.0 },
    { path: '/browse', priority: 0.9 },
    { path: '/pros', priority: 0.9 },
    { path: '/buddies', priority: 0.9 },
    { path: '/free', priority: 0.8 },
    { path: '/safety', priority: 0.7 },
    { path: '/about', priority: 0.6 },
    { path: '/rules', priority: 0.5 },
    { path: '/privacy', priority: 0.3 },
    { path: '/terms', priority: 0.3 },
  ]
  return staticRoutes.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority,
  }))
}
