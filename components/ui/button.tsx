import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button text-[15px] font-semibold transition-colors focus-ring disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-terracotta-500 text-white hover:bg-terracotta-600',
        secondary: 'bg-cream-200 text-[#1A1A1A] hover:bg-cream-300',
        ghost: 'bg-transparent text-[#6B6560] hover:bg-cream-200 hover:text-[#1A1A1A]',
        danger: 'bg-danger-500 text-white hover:bg-[#ad3636]',
        outline: 'border border-cream-300 bg-white text-[#1A1A1A] hover:bg-cream-50'
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
