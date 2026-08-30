import { useEffect } from 'react'

interface SeoProps {
  title: string
  description?: string
  keywords?: string
  canonicalUrl?: string
  ogImage?: string
  ogType?: string
}

function setMetaTag(nameOrProperty: 'name' | 'property', key: string, content: string) {
  let element = document.querySelector(`meta[${nameOrProperty}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(nameOrProperty, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export function Seo({
  title,
  description = 'Platform Google Drive Storage Gateway & CDN Media Proxy tercepat. Gabungkan kuota multi-akun Google Drive, stream video & audio tanpa buffering (HTTP 206 Partial Content), host aset web, dan integrasi API Key terenkripsi AES-256.',
  keywords = 'drive9, Google Drive gateway, cloud storage gateway, virtual cloud storage, Google Drive API, multi account Google Drive, file streaming cloud, Google Drive quota manager',
  canonicalUrl,
  ogImage = 'https://drive9.wn-cdn.net/logo.png',
  ogType = 'website'
}: SeoProps) {
  useEffect(() => {
    // 1. Update Title
    document.title = title

    // 2. Update Standard Meta Tags
    setMetaTag('name', 'title', title)
    setMetaTag('name', 'description', description)
    setMetaTag('name', 'keywords', keywords)

    // 3. Update Canonical Link
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://drive9.wn-cdn.net'
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
    const targetUrl = canonicalUrl || `${currentOrigin}${currentPath}`

    let linkCanonical = document.querySelector('link[rel="canonical"]')
    if (!linkCanonical) {
      linkCanonical = document.createElement('link')
      linkCanonical.setAttribute('rel', 'canonical')
      document.head.appendChild(linkCanonical)
    }
    linkCanonical.setAttribute('href', targetUrl)

    // 4. Update Open Graph (Facebook / LinkedIn / WhatsApp)
    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:url', targetUrl)
    setMetaTag('property', 'og:image', ogImage)
    setMetaTag('property', 'og:type', ogType)

    // 5. Update Twitter Cards
    setMetaTag('property', 'twitter:title', title)
    setMetaTag('property', 'twitter:description', description)
    setMetaTag('property', 'twitter:url', targetUrl)
    setMetaTag('property', 'twitter:image', ogImage)
  }, [title, description, keywords, canonicalUrl, ogImage, ogType])

  return null
}

