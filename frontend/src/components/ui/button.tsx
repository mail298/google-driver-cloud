import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.25)] hover:bg-blue-700',
        outline: 'border border-slate-200/80 bg-white/80 text-slate-900 shadow-sm hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800 dark:disabled:text-slate-400 dark:disabled:bg-slate-900/40',
        ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
        soft: 'bg-slate-100 text-slate-950 shadow-sm hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
        danger: 'text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/40',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 px-3',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
