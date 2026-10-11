import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'xs' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    const variantStyles = {
      default:
        'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 border border-zinc-900 shadow-xs dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:border-zinc-200',
      secondary:
        'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200 shadow-xs dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700/80 dark:border-zinc-700/60',
      outline:
        'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
      ghost:
        'bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60',
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
