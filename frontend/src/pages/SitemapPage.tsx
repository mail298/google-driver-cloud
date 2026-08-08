import { useEffect } from 'react'

export function SitemapPage() {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://googledrivefrontend.ikan212.com'
  const today = new Date().toISOString().split('T')[0]

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${origin}/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${origin}/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`

  useEffect(() => {
    document.title = 'sitemap.xml'
  }, [])

  return (
    <pre className="p-6 bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-blue-600 selection:text-white min-h-screen">
      {xmlContent}
    </pre>
  )
}
