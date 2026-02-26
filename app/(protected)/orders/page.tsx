'use client'

import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { OrderCard } from '@/components/orders/order-card'
import { PageTransition } from '@/components/shared/page-transition'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { AUTH_PLACEHOLDER_MODE } from '@/lib/config'
import { appCache } from '@/lib/cache'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { createClient } from '@/lib/supabase/client'
import { useOrderStore } from '@/lib/stores/use-order-store'
import type { OrderWithItems } from '@/lib/types'

const FILTERS = ['All', 'Active', 'Completed', 'Cancelled'] as const

type FilterType = (typeof FILTERS)[number]

export default function OrdersPage() {
  const supabase = useMemo(() => createClient(), [])
  const { user } = useCurrentUser()
  const { orders: demoOrders } = useOrderStore()

  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('All')

  useEffect(() => {
    document.title = 'Orders | Smart Canteen'
  }, [])

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        return
      }

      if (AUTH_PLACEHOLDER_MODE) {
        setLoading(true)
        setOrders(demoOrders)
        setLoading(false)
        return
      }

      const cacheKey = `orders:${user.id}`
      const cached = appCache.get<OrderWithItems[]>(cacheKey)

      if (cached) {
        // Serve from cache immediately — no spinner
        setOrders(cached)
        setLoading(false)
      } else {
        setLoading(true)
      }

      // Always re-fetch in the background to catch new orders
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        if (!cached) toast.error('Unable to load orders right now.')
        setLoading(false)
        return
      }

      const fresh = (data || []) as OrderWithItems[]
      appCache.set(cacheKey, fresh)
      setOrders(fresh)
      setLoading(false)
    }

    void fetchOrders()
  }, [demoOrders, supabase, user])

  const filteredOrders = useMemo(() => {
    if (filter === 'All') {
      return orders
    }

    if (filter === 'Active') {
      return orders.filter((order) => ['confirmed', 'preparing', 'ready'].includes(order.status))
    }

    if (filter === 'Completed') {
      return orders.filter((order) => order.status === 'picked_up')
    }

    return orders.filter((order) => order.status === 'cancelled')
  }, [filter, orders])

  return (
    <PageTransition>
      <section className="space-y-6">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Order History</p>
          <h1 className="font-display text-[28px] font-bold text-[#1A1A1A]">My Orders</h1>
        </header>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`focus-ring rounded-chip px-4 py-2 text-[13px] font-semibold ${
                filter === value
                  ? 'bg-terracotta-50 text-terracotta-600'
                  : 'bg-cream-200 text-[#6B6560] hover:bg-cream-300'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-card bg-white p-4 shadow-warmSm">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-3 mt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="mt-2 flex justify-between items-center border-t border-cream-100 pt-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-9 w-28 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No orders found"
            description="Your orders will appear here once you place one."
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  )
}
