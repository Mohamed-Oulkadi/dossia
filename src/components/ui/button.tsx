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
        'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200 shadow-xs dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:border-zinc-200',
      secondary:
        'bg-zinc-800 text-zinc-100 hover:bg-zinc-700/80 border border-zinc-700/60 shadow-xs',
      outline:
        'border border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-900 hover:text-zinc-100',
      ghost:
        'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60',
      destructive:
        'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
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
