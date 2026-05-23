import { NextResponse } from 'next/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /me
Disallow: /publish
Disallow: /api

Sitemap: ${siteUrl}/sitemap.xml
`
  return new NextResponse(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
