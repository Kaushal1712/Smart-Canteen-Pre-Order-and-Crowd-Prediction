import * as React from 'react'

import { cn } from '@/lib/utils/cn'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'focus-ring flex h-11 w-full rounded-button border border-transparent bg-cream-200 px-4 py-2 text-[15px] text-[#1A1A1A] placeholder:text-[#9C9590] disabled:cursor-not-allowed disabled:opacity-60',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
