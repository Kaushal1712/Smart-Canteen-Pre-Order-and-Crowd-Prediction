import type * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-chip px-3 py-1 text-[11px] font-semibold tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-cream-200 text-[#6B6560]',
        success: 'bg-sage-50 text-sage-600',
        warning: 'bg-amber-50 text-amber-500',
        danger: 'bg-danger-50 text-danger-500',
        info: 'bg-info-50 text-info-500',
        primary: 'bg-terracotta-50 text-terracotta-600'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
