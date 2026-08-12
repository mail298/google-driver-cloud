import { useEffect } from 'react'

export function RobotsPage() {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://drive9.wn-cdn.net'

  const content = `User-agent: *
Allow: /
Allow: /privacy
Allow: /terms
Disallow: /all-files
Disallow: /quota
Disallow: /shared
Disallow: /recent
Disallow: /starred
Disallow: /archived
Disallow: /trash
Disallow: /activity
Disallow: /settings
Disallow: /api

Sitemap: ${origin}/sitemap.xml`

  useEffect(() => {
    document.title = 'robots.txt'
  }, [])

  return (
    <pre className="p-6 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-blue-600 selection:text-white min-h-screen">
      {content}
    </pre>
  )
}
