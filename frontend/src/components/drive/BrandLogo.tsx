import { cn } from '@/lib/utils'

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl', className)}>
      <img
        src="/logo.png"
        alt="Drive9 logo"
        className="h-full w-full object-contain"
        draggable={false}
      />
    </div>
  )
}
