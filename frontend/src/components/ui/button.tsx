import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'accent'
  size?: 'default' | 'sm' | 'xs' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    const variantStyles = {
      default:
        'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 border border-zinc-900 shadow-2xs dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:border-zinc-200',
      accent:
        'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600 shadow-2xs dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:border-emerald-500',
      secondary:
        'bg-zinc-100 text-zinc-800 hover:bg-zinc-200/80 border border-zinc-200/90 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700/80 dark:border-zinc-700/60',
      outline:
        'border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100/70 hover:border-zinc-400 dark:border-zinc-800 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:border-zinc-700 shadow-2xs',
      ghost:
        'bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60',
      destructive:
        'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 dark:border-red-500/20',
    }[variant]

    const sizeStyles = {
      default: 'h-9 px-3.5 text-xs',
      sm: 'h-8 px-2.5 text-xs',
      xs: 'h-7 px-2 text-[11px]',
      icon: 'h-8 w-8 p-0',
    }[size]

    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
          variantStyles,
          sizeStyles,
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
