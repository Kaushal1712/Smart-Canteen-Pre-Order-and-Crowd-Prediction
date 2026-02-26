'use client'

import { CheckCheck, X } from 'lucide-react'
import { OrderStatusBadge } from '@/components/dashboard/order-status-badge'
import { PrepProgressBar } from '@/components/dashboard/prep-progress-bar'
import { Card, CardContent } from '@/components/ui/card'
import type { OrderWithItems } from '@/lib/types'

interface ActiveOrderCardProps {
  order: OrderWithItems
  tableInfo?: { tableNumber: number; seatNumber: number } | null
  onCancel?: () => void
  onPickedUp?: () => void
}

export function ActiveOrderCard({
  order,
  tableInfo,
  onCancel,
  onPickedUp
}: ActiveOrderCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        {/* Header row: order ID + status badge + cancel */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Order</p>
            <p className="font-display text-[16px] font-bold text-[#1A1A1A]">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            {onCancel && order.status !== 'ready' && order.status !== 'picked_up' && (
              <button
                type="button"
                onClick={onCancel}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-100/50 text-[#6B6560] hover:bg-cream-200 transition-colors"
                title="Cancel Order"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Order details */}
        <div className="space-y-2 mb-3">
          {tableInfo ? (
            <p className="text-[12px] text-[#6B6560]">
              T{tableInfo.tableNumber}, S{tableInfo.seatNumber}
            </p>
          ) : (
            <p className="text-[12px] text-[#6B6560]">Takeaway</p>
          )}

          <p className="text-[12px] text-[#6B6560] line-clamp-2">
            {order.order_items
              ?.map((item) => `${item.menu_items?.name || 'Item'} ×${item.quantity}`)
              .join(', ') || 'No items'}
          </p>

          <div className="pt-1">
            <PrepProgressBar
              estimatedMinutes={order.estimated_prep_minutes}
              createdAt={order.created_at}
              status={order.status}
            />
          </div>
        </div>

        {/* Pick-up confirmation — only shown when ready */}
        {onPickedUp && order.status === 'ready' && (
          <button
            type="button"
            onClick={onPickedUp}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-button bg-[#1A1A1A] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2A2A2A] active:bg-[#333]"
          >
            <CheckCheck className="h-4 w-4" />
            Mark as Picked Up
          </button>
        )}
      </CardContent>
    </Card>
  )
}
