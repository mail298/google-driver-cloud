import { cn } from '@/lib/utils'

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-transparent shadow-md shadow-blue-500/10', className)}>
      <img src="/favicon.svg" alt="9Drive logo" className="h-full w-full object-cover" />
    </div>
  )
}

