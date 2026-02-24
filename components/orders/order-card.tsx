'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { OrderStatusBadge } from '@/components/dashboard/order-status-badge'
import { Button } from '@/components/ui/button'
import type { OrderWithItems } from '@/lib/types'
import { formatCurrency } from '@/lib/utils/format'

import { OrderTimeline } from './order-timeline'

interface OrderCardProps {
  order: OrderWithItems
}

export function OrderCard({ order }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="rounded-card bg-white p-5 shadow-warmSm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#1A1A1A]">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-[12px] text-[#6B6560]">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <p className="text-[16px] font-bold text-[#1A1A1A]">{formatCurrency(order.total_amount)}</p>
        </div>
      </div>

      <div className="mt-3 text-[14px] text-[#6B6560]">
        {(order.order_items || [])
          .slice(0, 3)
          .map((item) => `${item.menu_items?.name || 'Item'} ×${item.quantity}`)
          .join(', ') || 'No items'}
      </div>

      <div className="mt-4">
        <Button variant="ghost" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? 'Hide Details' : 'View Details'}
        </Button>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-4 border-t border-cream-300 pt-4 md:grid-cols-[2fr_1fr]">
          <div>
            <h4 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Items</h4>
            <div className="space-y-2">
              {(order.order_items || []).map((item) => (
                <div key={item.id} className="rounded-button bg-cream-50 px-3 py-2 text-[13px] text-[#6B6560]">
                  <div className="flex items-center justify-between gap-2">
                    <span>
                      {item.menu_items?.name || 'Item'} ×{item.quantity}
                    </span>
                    <span className="font-semibold text-[#1A1A1A]">{formatCurrency(item.price_at_order * item.quantity)}</span>
                  </div>
                  {item.customizations?.length ? (
                    <p className="mt-1 text-[12px] text-[#9C9590]">
                      {item.customizations.map((customization) => customization.name).join(', ')}
                    </p>
                  ) : null}
                  {item.special_instructions ? (
                    <p className="mt-1 text-[12px] text-[#9C9590]">Note: {item.special_instructions}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Timeline</h4>
            <OrderTimeline status={order.status} />
            <div className="mt-3 rounded-button bg-cream-50 px-3 py-2 text-[13px] text-[#6B6560]">
              <p>Payment: {order.payment_method}</p>
              <p>Order Type: {order.order_type}</p>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}
