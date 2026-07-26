import { Folder, MoreVertical, User } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { FileIcon } from '@/components/drive/FileIcon'
import type { FileItem } from '@/data/drive-data'
import { cn } from '@/lib/utils'
import { getAccessToken } from '@/lib/auth'
import { API_URL } from '@/lib/api'

export type FileSizeScale = 'xs' | 'sm' | 'md' | 'lg'

const scaleConfig: Record<FileSizeScale, {
  grid: string
  card: string
  headerGap: string
  icon: string
  title: string
  aspect: string
  previewIcon: string
}> = {
  xs: {
    grid: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5',
    card: 'p-2 rounded-xl',
    headerGap: 'gap-1.5 mb-1.5',
    icon: 'h-4 w-4',
    title: 'text-[11px]',
    aspect: 'aspect-[4/3] rounded-lg',
    previewIcon: 'h-8 w-8',
  },
  sm: {
    grid: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3',
    card: 'p-2.5 rounded-xl',
    headerGap: 'gap-2 mb-2',
    icon: 'h-4.5 w-4.5',
    title: 'text-xs',
    aspect: 'aspect-[4/3] rounded-lg',
    previewIcon: 'h-10 w-10',
  },
  md: {
    grid: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4',
    card: 'p-3 rounded-2xl',
    headerGap: 'gap-2 mb-2.5',
    icon: 'h-5 w-5',
    title: 'text-xs sm:text-sm font-semibold',
    aspect: 'aspect-[4/3] rounded-xl',
    previewIcon: 'h-12 w-12 sm:h-14 sm:w-14',
  },
  lg: {
    grid: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5',
    card: 'p-4 rounded-2xl',
    headerGap: 'gap-2.5 mb-3',
    icon: 'h-6 w-6',
    title: 'text-sm sm:text-base font-semibold',
    aspect: 'aspect-[16/10] rounded-xl',
    previewIcon: 'h-16 w-16 sm:h-20 sm:w-20',
  },
}

function FileThumbnail({ file, cfg }: { file: FileItem; cfg: typeof scaleConfig['md'] }) {
  const [imageError, setImageError] = useState(false)
  const isImage = (file.kind === 'image' || file.mimeType?.startsWith('image/')) && file.id

  if (!isImage || imageError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-4 text-slate-400 dark:text-slate-500">
        <FileIcon kind={file.kind} mimeType={file.mimeType} className={cfg.previewIcon} />
      </div>
    )
  }

  const token = getAccessToken()
  const src = `${API_URL}/files/${file.id}/inline?token=${token}`

  return (
    <img
      src={src}
      alt={file.name}
      onError={() => setImageError(true)}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      loading="lazy"
    />
  )
}

export function FileGrid({
  files,
  selectedFileIds = new Set<string>(),
  sizeScale = 'md',
  onFileContextMenu,
  onToggleFile
}: {
  files: FileItem[]
  selectedFileIds?: Set<string>
  sizeScale?: FileSizeScale
  onFileContextMenu?: (event: MouseEvent<HTMLElement>, file: FileItem) => void
  onToggleFile?: (file: FileItem) => void
}) {
  const cfg = scaleConfig[sizeScale]
  return (
    <div className={cn("mt-5 grid", cfg.grid)}>
      {files.map((file) => {
        const selected = selectedFileIds.has(file.id ?? '')
        const locationText = file.folderName || file.location || (file.folderId ? 'In Folder' : 'My Drive')
        return (
          <div
            key={file.id ?? file.name}
            draggable
            onDragStart={(event) => { event.dataTransfer.setData('text/plain', file.id ?? ''); event.dataTransfer.effectAllowed = 'move' }}
            onClick={() => onToggleFile?.(file)}
            onContextMenu={(event) => onFileContextMenu?.(event, file)}
            className={cn(
              "group relative flex flex-col justify-between bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800/90 transition-all duration-200 border border-slate-200/50 dark:border-slate-700/50 cursor-pointer shadow-xs hover:shadow-md select-none overflow-hidden",
              selected
                ? 'ring-2 ring-blue-600 bg-blue-50/80 dark:bg-blue-950/40 border-blue-300'
                : '',
              cfg.card
            )}
          >
            {/* Header: Icon, Title, and More Menu */}
            <div className={cn("flex items-center justify-between min-w-0", cfg.headerGap)}>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Selection Checkbox (visible on hover or when selected) */}
                <input
                  type="checkbox"
                  className={cn(
                    "shrink-0 accent-blue-600 cursor-pointer transition-opacity",
                    selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                  checked={selected}
                  onChange={() => onToggleFile?.(file)}
                  onClick={(event) => event.stopPropagation()}
                />
                
                {/* File Icon */}
                <FileIcon kind={file.kind} mimeType={file.mimeType} className={cn("shrink-0", cfg.icon)} />

                {/* File Name */}
                <span
                  className={cn("truncate text-slate-800 dark:text-slate-100 min-w-0 flex-1", cfg.title)}
                  title={file.name}
                >
                  {file.name}
                </span>
              </div>

              {/* Context Menu Button */}
              <button
                className="flex shrink-0 items-center justify-center p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-full transition-colors"
                onClick={(event) => {
                  event.stopPropagation()
                  onFileContextMenu?.(event, file)
                }}
                aria-label={`Open ${file.name} menu`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Content / Thumbnail Box */}
            <div className={cn("relative w-full overflow-hidden bg-slate-200/60 dark:bg-slate-900/60 flex items-center justify-center", cfg.aspect)}>
              <FileThumbnail file={file} cfg={cfg} />
            </div>

            {/* Bottom Location & Account Details Footer */}
            <div className="mt-2 flex flex-col gap-1 px-0.5 min-w-0 text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <div className="flex items-center gap-1 min-w-0 flex-1 truncate" title={`Location: ${locationText}`}>
                  <Folder className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate font-medium text-[11px]">
                    {locationText}
                  </span>
                </div>
                {file.size && (
                  <span className="shrink-0 text-[10px] text-slate-400 font-mono">
                    {file.size}
                  </span>
                )}
              </div>

              {/* Connected Account Info */}
              <div className="flex items-center gap-1 min-w-0 text-slate-500 dark:text-slate-400 text-[10px]" title={`Account: ${file.accountEmail || file.access}`}>
                <User className="h-3 w-3 shrink-0 text-blue-500" />
                <span className="truncate font-medium text-slate-600 dark:text-slate-300">
                  {file.accountEmail || file.access || 'Google Drive'}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
