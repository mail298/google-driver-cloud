import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'card rounded-2xl border border-slate-200/80 bg-white/90 text-slate-900 shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-slate-100',
        className
      )}
      {...props}
    />
  )
}
