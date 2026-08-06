import { cn } from '@/lib/utils'
import type { FileItem } from '@/data/drive-data'
import { getFileCategoryInfo, useFileThumbnailUrl } from '@/lib/file-utils'

export function FileIcon({
  file,
  kind: _kind,
  name,
  mimeType,
  className,
}: {
  file?: Partial<FileItem>
  kind?: FileItem['kind']
  name?: string
  mimeType?: string
  className?: string
}) {
  const fileName = file?.name ?? name ?? 'File'
  const fileMime = file?.mimeType ?? mimeType
  const fileId = file?.id

  const info = getFileCategoryInfo(fileName, fileMime)
  const isImage = info.category === 'image'
  const { imageUrl, loading } = useFileThumbnailUrl(fileId, isImage)

  // List View Thumbnail for Images
  if (isImage && imageUrl) {
    return (
      <div className={cn('relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800 bg-slate-100 dark:bg-slate-900', className)}>
        <img src={imageUrl} alt={fileName} className="h-full w-full object-cover" />
      </div>
    )
  }

  // Loading image skeleton
  if (isImage && loading) {
    return (
      <div className={cn('h-9 w-9 shrink-0 animate-pulse rounded-xl bg-amber-500/20 border border-amber-500/30', className)} />
    )
  }

  // Styled File Icon Badge for all other categories
  const { Icon, iconBg } = info

  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold shadow-sm transition-transform group-hover:scale-105',
        iconBg,
        className
      )}
    >
      <Icon className="h-4.5 w-4.5" />
    </div>
  )
}
