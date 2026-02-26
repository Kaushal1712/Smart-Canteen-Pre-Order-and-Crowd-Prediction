import { Badge } from '@/components/ui/badge'

interface CanteenStatusBadgeProps {
  occupied: number
  total: number
}

export function CanteenStatusBadge({ occupied, total }: CanteenStatusBadgeProps) {
  const percent = total === 0 ? 0 : Math.round((occupied / total) * 100)
  const available = Math.max(0, total - occupied)

  const variant = percent > 80 ? 'danger' : percent >= 50 ? 'warning' : 'success'

  return (
    <Badge variant={variant} className="gap-2 px-4 py-1.5 text-[13px] normal-case tracking-normal">
      <span
        className={
          percent > 80
            ? 'h-2 w-2 rounded-full bg-danger-500'
            : percent >= 50
              ? 'h-2 w-2 rounded-full bg-amber-500'
              : 'h-2 w-2 rounded-full bg-sage-500'
        }
      />
      {available} / {total} seats available
    </Badge>
  )
}
