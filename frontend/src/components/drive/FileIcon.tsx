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
  const isVideo = info.category === 'video'
  const shouldLoad = isImage || isVideo
  const { imageUrl, loading } = useFileThumbnailUrl(fileId, shouldLoad)

  // List View Thumbnail for Images & Videos
  if ((isImage || isVideo) && imageUrl) {
    return (
      <div className={cn('relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800 bg-slate-950 flex items-center justify-center', className)}>
        {isImage ? (
          <img src={imageUrl} alt={fileName} className="h-full w-full object-cover" />
        ) : (
          <video src={imageUrl} preload="metadata" muted playsInline className="h-full w-full object-cover" />
        )}
      </div>
    )
  }

  // Loading image/video skeleton
  if (shouldLoad && loading) {
    return (
      <div className={cn('h-9 w-9 shrink-0 animate-pulse rounded-xl bg-purple-500/20 border border-purple-500/30', className)} />
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
