import { cn } from '@/lib/utils'

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-transparent', className)}>
      <svg viewBox="0 0 512 512" className="h-full w-full" role="img" aria-label="9Drive logo">
        <image href="/logo.png" width="512" height="512" preserveAspectRatio="xMidYMid meet" />
      </svg>
    </div>
  )
}
