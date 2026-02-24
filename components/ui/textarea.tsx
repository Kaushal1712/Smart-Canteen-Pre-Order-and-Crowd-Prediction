import * as React from 'react'

import { cn } from '@/lib/utils/cn'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'focus-ring min-h-[84px] w-full rounded-button border border-transparent bg-cream-200 px-4 py-3 text-[15px] text-[#1A1A1A] placeholder:text-[#9C9590] disabled:cursor-not-allowed disabled:opacity-60',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
