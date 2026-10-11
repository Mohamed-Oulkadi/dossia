import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'attente' | 'consultation' | 'termine' | 'annule'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default:
      'border-transparent bg-zinc-100 text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700/60',
    secondary:
      'border-zinc-800 bg-zinc-900 text-zinc-300',
    outline:
      'border-zinc-800 text-zinc-400 bg-transparent',
    attente:
      'badge-attente font-medium',
    consultation:
      'badge-consultation font-medium',
    termine:
      'badge-termine font-medium',
    annule:
      'badge-annule font-medium',
  }[variant]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium transition-colors border',
        variantStyles,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
