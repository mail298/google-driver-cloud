import { MoreVertical } from 'lucide-react'
import type { MouseEvent } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { FolderItem } from '@/data/drive-data'
import { FolderVisual } from '@/components/drive/FolderVisual'

export type FolderSizeScale = 'xs' | 'sm' | 'md' | 'lg'

const scaleConfig: Record<FolderSizeScale, {
  grid: string
  innerHeight: string
  innerIconSize: string
  cardPadding: string
}> = {
  xs: {
    grid: 'grid-cols-3 sm:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3',
    innerHeight: 'h-16 sm:h-20',
    innerIconSize: 'h-8 w-8 sm:h-10 sm:w-10',
    cardPadding: 'p-2 sm:p-3',
  },
  sm: {
    grid: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-4',
    innerHeight: 'h-20 sm:h-28',
    innerIconSize: 'h-10 w-10 sm:h-14 sm:w-14',
    cardPadding: 'p-2.5 sm:p-3.5',
  },
  md: {
    grid: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5',
    innerHeight: 'h-28 sm:h-44',
    innerIconSize: 'h-14 w-14 sm:h-24 sm:w-24',
    cardPadding: 'p-3 sm:p-5',
  },
  lg: {
    grid: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6',
    innerHeight: 'h-36 sm:h-56',
    innerIconSize: 'h-20 w-20 sm:h-32 sm:w-32',
    cardPadding: 'p-4 sm:p-6',
  },
}

export function FolderGrid({
  items,
  mobileTwoColumns = true,
  sizeScale = 'md',
  onFolderMenu,
  onFolderOpen,
  onDropItem,
}: {
  items: FolderItem[]
  mobileTwoColumns?: boolean
  sizeScale?: FolderSizeScale
  onFolderMenu?: (event: MouseEvent<HTMLElement>, folder: FolderItem) => void
  onFolderOpen?: (folder: FolderItem) => void
  onDropItem?: (fileId: string, folderId: string) => void
}) {
  const cfg = scaleConfig[sizeScale] || scaleConfig.md

  return (
    <div className={cn('mt-4 grid', cfg.grid, mobileTwoColumns && sizeScale === 'md' && 'grid-cols-2')}>
      {items.map((folder) => {
        return (
          <Card
            key={folder.id || folder.name}
            onClick={() => onFolderOpen?.(folder)}
            onContextMenu={(event) => onFolderMenu?.(event, folder)}
            onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move' }}
            onDragEnter={(event) => { event.currentTarget.classList.add('bg-blue-50/50', 'border-blue-300') }}
            onDragLeave={(event) => { event.currentTarget.classList.remove('bg-blue-50/50', 'border-blue-300') }}
            onDrop={(event) => {
              event.preventDefault()
              event.currentTarget.classList.remove('bg-blue-50/50', 'border-blue-300')
              const fileId = event.dataTransfer.getData('text/plain')
              if (fileId && folder.id) onDropItem?.(fileId, folder.id)
            }}
            className={cn(
              'group relative flex flex-col justify-between cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 transition-all duration-200 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-amber-500/30',
              cfg.cardPadding
            )}
          >
            {/* Top Header Row */}
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="h-3.5 w-3.5 rounded border border-slate-300/80 dark:border-slate-700/80 bg-slate-200/60 dark:bg-slate-800/60 shrink-0 opacity-40 grayscale cursor-not-allowed" title="Actions available via 3-dots menu" />
                <FolderVisual folder={folder} className="h-4 w-4 shrink-0" />
                <span className="truncate text-xs sm:text-base font-bold text-slate-800 dark:text-slate-100" title={folder.name}>
                  {folder.name}
                </span>
              </div>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 shrink-0"
                onClick={(event) => { event.stopPropagation(); onFolderMenu?.(event, folder) }}
                aria-label={`Open ${folder.name} menu`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Middle Inner Center Preview Box */}
            <div className={cn('my-2.5 flex w-full items-center justify-center rounded-xl border border-dashed border-amber-500/25 bg-amber-500/5 dark:border-amber-500/20 dark:bg-slate-950/40 transition-transform group-hover:scale-[1.02]', cfg.innerHeight)}>
              <FolderVisual folder={folder} className={cn('drop-shadow-md transition-transform group-hover:scale-110', cfg.innerIconSize)} />
            </div>

            {/* Bottom Info Row */}
            <div className="flex items-center justify-between gap-1 min-w-0 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <FolderVisual folder={folder} className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate font-semibold text-slate-700 dark:text-slate-300" title={folder.name}>
                  {folder.name}
                </span>
              </div>
              <span className="shrink-0 font-medium text-slate-400 dark:text-slate-500">
                Folder
              </span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
