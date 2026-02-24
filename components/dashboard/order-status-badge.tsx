import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/lib/types'
import { formatOrderStatus } from '@/lib/utils/format'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const variant =
    status === 'confirmed'
      ? 'info'
      : status === 'preparing'
        ? 'warning'
        : status === 'ready' || status === 'picked_up'
          ? 'success'
          : 'danger'

  return <Badge variant={variant}>{formatOrderStatus(status)}</Badge>
}
