import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-card bg-white px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-100">
        <Icon className="h-8 w-8 text-cream-400" />
      </div>
      <h3 className="font-display text-[22px] font-bold text-[#1A1A1A]">{title}</h3>
      {description ? <p className="max-w-md text-[15px] text-[#6B6560]">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
