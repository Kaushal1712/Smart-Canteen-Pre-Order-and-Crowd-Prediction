'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, UtensilsCrossed } from 'lucide-react'

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
    <article className="rounded-card bg-white p-5 border border-cream-200/60 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-[16px] font-bold text-[#1A1A1A]">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
          <p className="text-[13px] text-[#6B6560]">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-4 flex items-center gap-3">
        {/* Render overlapping images */}
        <div className="flex -space-x-3">
          {(order.order_items || []).slice(0, 3).map((item, index) => (
             <div key={item.id} className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-white bg-cream-100 overflow-hidden shadow-sm relative z-10" style={{ zIndex: 10 - index }}>
                {item.menu_items?.image_url ? (
                   <img src={item.menu_items.image_url} alt={item.menu_items.name} className="h-full w-full object-cover" />
                ) : (
                   <UtensilsCrossed className="h-4 w-4 m-auto mt-[10px] text-cream-400" />
                )}
             </div>
          ))}
          {(order.order_items?.length || 0) > 3 && (
            <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-white bg-cream-100 text-[11px] font-bold text-[#6B6560] shadow-sm relative z-0">
               +{(order.order_items?.length || 0) - 3}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-[14px] text-[#6B6560] line-clamp-2">
          {(order.order_items || [])
            .map((item) => `${item.menu_items?.name || 'Item'} ×${item.quantity}`)
            .join(', ') || 'No items'}
        </div>
      </div>

      <div className="mt-5 border-t border-cream-200/60 pt-4 flex items-center justify-between">
        <div>
           <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Total</p>
           <p className="text-[16px] font-bold text-[#1A1A1A]">{formatCurrency(order.total_amount)}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? 'Hide Details' : 'View Details'}
          {expanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
        </Button>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-4 border-t border-cream-200/60 pt-4 md:grid-cols-[2fr_1fr]">
          <div>
            <h4 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Items</h4>
            <div className="space-y-2">
              {(order.order_items || []).map((item) => (
                <div key={item.id} className="rounded-card bg-cream-50 p-3 text-[13px] text-[#6B6560] border border-cream-200/40">
                  <div className="flex items-start gap-3 justify-between">
                    <div className="flex items-start gap-3">
                       <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-white border border-cream-200">
                          {item.menu_items?.image_url ? (
                             <img src={item.menu_items.image_url} alt={item.menu_items.name} className="h-full w-full object-cover" />
                          ) : (
                             <div className="h-full w-full flex items-center justify-center bg-cream-100">
                               <UtensilsCrossed className="h-5 w-5 text-cream-400" />
                             </div>
                          )}
                       </div>
                       <div>
                         <span className="font-semibold text-[#1A1A1A] text-[14px]">
                           {item.menu_items?.name || 'Item'} ×{item.quantity}
                         </span>
                         {item.customizations?.length ? (
                           <p className="mt-1 text-[12px] text-[#9C9590]">
                             {item.customizations.map((customization) => customization.name).join(', ')}
                           </p>
                         ) : null}
                         {item.special_instructions ? (
                           <p className="mt-1 text-[12px] text-[#9C9590]">Note: {item.special_instructions}</p>
                         ) : null}
                       </div>
                    </div>
                    <span className="font-semibold text-[#1A1A1A]">{formatCurrency(item.price_at_order * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Timeline</h4>
            <OrderTimeline status={order.status} />
            <div className="mt-3 rounded-card bg-cream-50 p-3 text-[13px] text-[#6B6560] border border-cream-200/40">
              <p>Payment: {order.payment_method}</p>
              <p>Order Type: {order.order_type}</p>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}
