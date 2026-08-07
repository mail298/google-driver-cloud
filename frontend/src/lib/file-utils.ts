import { useState, useEffect } from 'react'
import {
  Image,
  Video,
  Music,
  FileText,
  Table2,
  Presentation,
  FileCode2,
  FileArchive,
  File,
  type LucideIcon
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { getAccessToken } from '@/lib/auth'

export type FileCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'code'
  | 'archive'
  | 'other'

export interface CategoryInfo {
  category: FileCategory
  label: string
  extension: string
  bgGradient: string
  iconBg: string
  iconColor: string
  badgeClass: string
  Icon: LucideIcon
}

const blobCache = new Map<string, string>()

export function getFileExtension(filename: string): string {
  if (!filename) return ''
  const parts = filename.split('.')
  if (parts.length <= 1) return ''
  return parts.pop()!.toLowerCase()
}

export function getFileCategoryInfo(filename: string, mimeType?: string): CategoryInfo {
  const ext = getFileExtension(filename)
  const mime = mimeType?.toLowerCase() ?? ''

  // Image
  if (
    mime.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'heic'].includes(ext)
  ) {
    return {
      category: 'image',
      label: 'Image',
      extension: ext.toUpperCase() || 'IMG',
      bgGradient: 'from-amber-500/15 via-orange-500/10 to-amber-500/5',
      iconBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
      iconColor: 'text-amber-500',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20',
      Icon: Image,
    }
  }

  // Video
  if (
    mime.startsWith('video/') ||
    ['mp4', 'mkv', 'webm', 'avi', 'mov', 'wmv', 'flv', 'm4v', '3gp'].includes(ext)
  ) {
    return {
      category: 'video',
      label: 'Video',
      extension: ext.toUpperCase() || 'VID',
      bgGradient: 'from-purple-500/15 via-indigo-500/10 to-purple-500/5',
      iconBg: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
      iconColor: 'text-purple-500',
      badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20',
      Icon: Video,
    }
  }

  // Audio
  if (
    mime.startsWith('audio/') ||
    ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma'].includes(ext)
  ) {
    return {
      category: 'audio',
      label: 'Audio',
      extension: ext.toUpperCase() || 'AUD',
      bgGradient: 'from-pink-500/15 via-rose-500/10 to-pink-500/5',
      iconBg: 'bg-pink-500/20 text-pink-600 dark:text-pink-400',
      iconColor: 'text-pink-500',
      badgeClass: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/20',
      Icon: Music,
    }
  }

  // PDF
  if (mime === 'application/pdf' || ext === 'pdf') {
    return {
      category: 'pdf',
      label: 'PDF Document',
      extension: 'PDF',
      bgGradient: 'from-red-500/15 via-rose-500/10 to-red-500/5',
      iconBg: 'bg-red-500/20 text-red-600 dark:text-red-400',
      iconColor: 'text-red-500',
      badgeClass: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/20',
      Icon: FileText,
    }
  }

  // Spreadsheet / Excel
  if (
    mime.includes('excel') ||
    mime.includes('spreadsheet') ||
    ['xls', 'xlsx', 'csv', 'ods'].includes(ext)
  ) {
    return {
      category: 'spreadsheet',
      label: 'Spreadsheet',
      extension: ext.toUpperCase() || 'XLS',
      bgGradient: 'from-emerald-500/15 via-teal-500/10 to-emerald-500/5',
      iconBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      iconColor: 'text-emerald-500',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      Icon: Table2,
    }
  }

  // Word / Document
  if (
    mime.includes('word') ||
    mime.includes('document') ||
    ['doc', 'docx', 'odt', 'rtf', 'txt', 'md'].includes(ext)
  ) {
    return {
      category: 'document',
      label: 'Document',
      extension: ext.toUpperCase() || 'DOC',
      bgGradient: 'from-blue-500/15 via-sky-500/10 to-blue-500/5',
      iconBg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      iconColor: 'text-blue-500',
      badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20',
      Icon: FileText,
    }
  }

  // Presentation / Slides
  if (
    mime.includes('presentation') ||
    mime.includes('powerpoint') ||
    ['ppt', 'pptx', 'odp', 'key'].includes(ext)
  ) {
    return {
      category: 'presentation',
      label: 'Presentation',
      extension: ext.toUpperCase() || 'PPT',
      bgGradient: 'from-orange-500/15 via-amber-500/10 to-orange-500/5',
      iconBg: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
      iconColor: 'text-orange-500',
      badgeClass: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/20',
      Icon: Presentation,
    }
  }

  // Code
  if (
    mime.includes('json') ||
    mime.includes('javascript') ||
    mime.includes('typescript') ||
    mime.includes('xml') ||
    ['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'json', 'py', 'php', 'sql', 'sh', 'yml', 'yaml', 'xml', 'c', 'cpp', 'go', 'rs', 'java'].includes(ext)
  ) {
    return {
      category: 'code',
      label: 'Code File',
      extension: ext.toUpperCase() || 'CODE',
      bgGradient: 'from-violet-500/15 via-slate-500/10 to-violet-500/5',
      iconBg: 'bg-violet-500/20 text-violet-600 dark:text-violet-400',
      iconColor: 'text-violet-500',
      badgeClass: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/20',
      Icon: FileCode2,
    }
  }

  // Archive
  if (
    mime.includes('zip') ||
    mime.includes('compressed') ||
    mime.includes('tar') ||
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso'].includes(ext)
  ) {
    return {
      category: 'archive',
      label: 'Archive',
      extension: ext.toUpperCase() || 'ZIP',
      bgGradient: 'from-teal-500/15 via-cyan-500/10 to-teal-500/5',
      iconBg: 'bg-teal-500/20 text-teal-600 dark:text-teal-400',
      iconColor: 'text-teal-500',
      badgeClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/20',
      Icon: FileArchive,
    }
  }

  // Other / Fallback
  return {
    category: 'other',
    label: 'File',
    extension: ext.toUpperCase() || 'FILE',
    bgGradient: 'from-slate-500/15 via-slate-600/10 to-slate-500/5',
    iconBg: 'bg-slate-500/20 text-slate-600 dark:text-slate-400',
    iconColor: 'text-slate-500',
    badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20',
    Icon: File,
  }
}

export function getFileStreamUrl(fileId?: string): string {
  if (!fileId) return ''
  const token = getAccessToken()
  return token ? `${API_URL}/files/${fileId}/download?token=${encodeURIComponent(token)}` : `${API_URL}/files/${fileId}/download`
}

export function useFileThumbnailUrl(fileId?: string, shouldLoad = false): { imageUrl: string | null; loading: boolean } {
  const [imageUrl, setImageUrl] = useState<string | null>(() => (fileId ? blobCache.get(fileId) ?? null : null))
  const [loading, setLoading] = useState<boolean>(!imageUrl && shouldLoad && Boolean(fileId))

  useEffect(() => {
    if (!shouldLoad || !fileId) {
      setLoading(false)
      return
    }

    if (blobCache.has(fileId)) {
      setImageUrl(blobCache.get(fileId)!)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)

    const token = getAccessToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    fetch(`${API_URL}/files/${fileId}/download`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load media preview')
        return res.blob()
      })
      .then((blob) => {
        if (!active) return
        const url = URL.createObjectURL(blob)
        blobCache.set(fileId, url)
        setImageUrl(url)
      })
      .catch(() => {
        if (active) setImageUrl(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [fileId, shouldLoad])

  return { imageUrl, loading }
}
