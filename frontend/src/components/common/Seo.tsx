import { useEffect } from 'react'

interface SeoProps {
  title: string
  description?: string
  keywords?: string
  canonicalUrl?: string
}

export function Seo({
  title,
  description = 'drive9 adalah platform Google Drive Storage Gateway aman untuk mengoperasikan file streaming, mengorganisir folder virtual, memantau kuota multi-akun, dan mengintegrasikan API Key terenkripsi AES-256.',
  keywords = 'drive9, Google Drive gateway, cloud storage gateway, virtual cloud storage, Google Drive API, multi account Google Drive, file streaming cloud, Google Drive quota manager',
  canonicalUrl
}: SeoProps) {
  useEffect(() => {
    // 1. Update Title
    document.title = title

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', description)

    // 3. Update Meta Keywords
    let metaKey = document.querySelector('meta[name="keywords"]')
    if (!metaKey) {
      metaKey = document.createElement('meta')
      metaKey.setAttribute('name', 'keywords')
      document.head.appendChild(metaKey)
    }
    metaKey.setAttribute('content', keywords)

    // 4. Update Canonical Link
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://googledrivefrontend.ikan212.com'
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
    const targetUrl = canonicalUrl || `${currentOrigin}${currentPath}`

    let linkCanonical = document.querySelector('link[rel="canonical"]')
    if (!linkCanonical) {
      linkCanonical = document.createElement('link')
      linkCanonical.setAttribute('rel', 'canonical')
      document.head.appendChild(linkCanonical)
    }
    linkCanonical.setAttribute('href', targetUrl)
  }, [title, description, keywords, canonicalUrl])

  return null
}
