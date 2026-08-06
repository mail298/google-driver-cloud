import { MoreVertical } from 'lucide-react'
import type { MouseEvent } from 'react'
import { Card } from '@/components/ui/card'
import type { FileItem } from '@/data/drive-data'
import { cn } from '@/lib/utils'
import { getFileCategoryInfo, useFileThumbnailUrl } from '@/lib/file-utils'

export type FileSizeScale = 'xs' | 'sm' | 'md' | 'lg'

const scaleConfig: Record<
  FileSizeScale,
  {
    grid: string
    card: string
    checkbox: string
    menuBtn: string
    title: string
    date: string
    tagsShell: string
    tag: string
    mtCard: string
  }
> = {
  xs: {
    grid: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3',
    card: 'p-3',
    checkbox: 'h-4 w-4',
    menuBtn: '-mr-1.5 -mt-1.5 h-7 w-7',
    title: 'text-xs min-h-7 mt-2 font-bold',
    date: 'text-[10px] mt-0.5 text-slate-400',
    tagsShell: 'mt-1.5 gap-1',
    tag: 'px-1.5 py-0.5 text-[9px]',
    mtCard: 'mt-2',
  },
  sm: {
    grid: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5',
    card: 'p-3.5',
    checkbox: 'h-4.5 w-4.5',
    menuBtn: '-mr-1.5 -mt-1.5 h-8 w-8',
    title: 'text-xs min-h-8 mt-2.5 font-bold',
    date: 'text-[10px] mt-1 text-slate-400',
    tagsShell: 'mt-2 gap-1.5',
    tag: 'px-2 py-0.5 text-[10px]',
    mtCard: 'mt-2.5',
  },
  md: {
    grid: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5',
    card: 'p-4',
    checkbox: 'h-5 w-5',
    menuBtn: '-mr-1 -mt-1 h-9 w-9',
    title: 'line-clamp-2 min-h-10 text-sm font-extrabold text-slate-950 mt-3',
    date: 'mt-1 truncate text-xs text-slate-500',
    tagsShell: 'mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600',
    tag: 'rounded-full bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1',
    mtCard: 'mt-3',
  },
  lg: {
    grid: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6',
    card: 'p-5',
    checkbox: 'h-6 w-6',
    menuBtn: '-mr-2 -mt-2 h-10 w-10',
    title: 'line-clamp-2 min-h-12 text-base font-extrabold text-slate-950 mt-4 sm:text-lg',
    date: 'mt-1 truncate text-sm text-slate-500',
    tagsShell: 'mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-600',
    tag: 'rounded-full bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5',
    mtCard: 'mt-4',
  },
}

function FileCardPreview({ file }: { file: FileItem }) {
  const info = getFileCategoryInfo(file.name, file.mimeType)
  const isImage = info.category === 'image'
  const { imageUrl, loading } = useFileThumbnailUrl(file.id, isImage)
  const { Icon, bgGradient, iconBg, badgeClass, extension } = info

  if (isImage && imageUrl) {
    return (
      <div className="relative h-36 sm:h-44 w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-900 shadow-inner group/thumb dark:border-slate-800 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={file.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
        />
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-lg bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-md tracking-wider">
          {extension}
        </div>
      </div>
    )
  }

  if (isImage && loading) {
    return (
      <div className="h-36 sm:h-44 w-full animate-pulse rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <Icon className="h-10 w-10 text-amber-500/40" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative h-36 sm:h-44 w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br shadow-sm dark:border-slate-800 flex items-center justify-center group/thumb transition-all hover:shadow-md',
        bgGradient
      )}
    >
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover/thumb:scale-110',
          iconBg
        )}
      >
        <Icon className="h-7 w-7" />
      </div>
      <div
        className={cn(
          'absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-lg backdrop-blur-md shadow-sm border tracking-wider',
          badgeClass
        )}
      >
        {extension}
      </div>
    </div>
  )
}

export function FileGrid({
  files,
  selectedFileIds = new Set<string>(),
  sizeScale = 'md',
  onFileContextMenu,
  onToggleFile,
}: {
  files: FileItem[]
  selectedFileIds?: Set<string>
  sizeScale?: FileSizeScale
  onFileContextMenu?: (event: MouseEvent<HTMLElement>, file: FileItem) => void
  onToggleFile?: (file: FileItem) => void
}) {
  const cfg = scaleConfig[sizeScale]
  return (
    <div className={cn('mt-5 grid', cfg.grid)}>
      {files.map((file) => {
        const selected = selectedFileIds.has(file.id ?? '')
        return (
          <Card
            key={file.id ?? file.name}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('text/plain', file.id ?? '')
              event.dataTransfer.effectAllowed = 'move'
            }}
            onClick={() => onToggleFile?.(file)}
            onContextMenu={(event) => onFileContextMenu?.(event, file)}
            className={cn(
              'group relative overflow-hidden transition-all duration-200 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-lg',
              selected
                ? 'file-selected shadow-md border-blue-500/50 ring-2 ring-blue-500/30'
                : 'border-slate-200/80 dark:border-slate-800',
              cfg.card
            )}
          >
            {/* Action Bar Overlay */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
              <input
                type="checkbox"
                className={cn('pointer-events-auto shrink-0 accent-blue-600 shadow-sm', cfg.checkbox)}
                checked={selected}
                onChange={() => onToggleFile?.(file)}
                onClick={(event) => event.stopPropagation()}
              />
              <button
                className={cn(
                  'pointer-events-auto flex shrink-0 items-center justify-center rounded-xl bg-white/80 text-slate-600 backdrop-blur-md shadow-sm hover:bg-white dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50',
                  cfg.menuBtn
                )}
                onClick={(event) => {
                  event.stopPropagation()
                  onFileContextMenu?.(event, file)
                }}
                aria-label={`Open ${file.name} menu`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Main Preview */}
            <FileCardPreview file={file} />

            {/* Info Footer */}
            <div className={cn('min-w-0', cfg.mtCard)}>
              <h3 className={cn('font-extrabold text-slate-950 dark:text-slate-100 line-clamp-1', cfg.title)} title={file.name}>
                {file.name}
              </h3>
              <div className="flex items-center justify-between gap-2 mt-1">
                <p className={cfg.date}>{file.date}</p>
                <span className={cn('rounded-full font-bold text-slate-500 bg-slate-100 dark:bg-slate-800/80', cfg.tag)}>
                  {file.size}
                </span>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
