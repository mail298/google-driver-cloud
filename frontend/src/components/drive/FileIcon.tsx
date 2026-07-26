import { Code2, File, FileArchive, FileImage, FileText, Film, Folder, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FileItem } from '@/data/drive-data'

export function FileIcon({ kind, mimeType, className }: { kind?: FileItem['kind'] | string; mimeType?: string; className?: string }) {
  const base = 'h-4 w-4 rounded p-0.5 text-white shrink-0'

  // Infer kind from mimeType if kind is generic or missing
  let resolvedKind = kind
  if (mimeType) {
    if (mimeType.startsWith('image/')) resolvedKind = 'image'
    else if (mimeType.startsWith('video/')) resolvedKind = 'video'
    else if (mimeType.startsWith('audio/')) resolvedKind = 'audio'
    else if (mimeType.includes('pdf')) resolvedKind = 'pdf'
    else if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('tar') || mimeType.includes('rar')) resolvedKind = 'archive'
    else if (mimeType.includes('code') || mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('typescript')) resolvedKind = 'code'
    else if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('text')) resolvedKind = 'doc'
  }

  if (resolvedKind === 'image') return <FileImage className={cn(base, 'bg-red-500', className)} />
  if (resolvedKind === 'video') return <Film className={cn(base, 'bg-red-600', className)} />
  if (resolvedKind === 'pdf') return <FileText className={cn(base, 'bg-red-500', className)} />
  if (resolvedKind === 'doc') return <FileText className={cn(base, 'bg-blue-500', className)} />
  if (resolvedKind === 'audio') return <Music className={cn(base, 'bg-emerald-500', className)} />
  if (resolvedKind === 'archive') return <FileArchive className={cn(base, 'bg-amber-500', className)} />
  if (resolvedKind === 'code') return <Code2 className={cn(base, 'bg-indigo-500', className)} />
  if (resolvedKind === 'folder') return <Folder className={cn(base, 'bg-lime-500', className)} />

  return <File className={cn(base, 'bg-slate-500', className)} />
}

