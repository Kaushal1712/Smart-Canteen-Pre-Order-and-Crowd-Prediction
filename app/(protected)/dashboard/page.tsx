'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { CanteenStatusBadge } from '@/components/canteen/canteen-status-badge'
import { OrderStatusBadge } from '@/components/dashboard/order-status-badge'
import { PrepProgressBar } from '@/components/dashboard/prep-progress-bar'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { PageTransition } from '@/components/shared/page-transition'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { AUTH_PLACEHOLDER_MODE } from '@/lib/config'
import { DEMO_OCCUPIED_BOOKINGS, DEMO_SEATS } from '@/lib/demo-data'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/stores/use-cart-store'
import { useOrderStore } from '@/lib/stores/use-order-store'
import type { OrderWithItems, SeatBookingWithMeta } from '@/lib/types'
import { formatCurrency } from '@/lib/utils/format'
import { getAutoStatus } from '@/lib/utils/order-lifecycle'

const ACTIVE_ORDER_STATUSES = ['confirmed', 'preparing', 'ready']

export default function DashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { user, profile } = useCurrentUser()

  const { setDiningMode, setSelectedSeat, setActiveBooking, selectedSeat, activeBookingId } = useCartStore()
  const { orders: demoOrders, updateOrderStatus } = useOrderStore()

  const [loading, setLoading] = useState(true)
  const [activeOrders, setActiveOrders] = useState<OrderWithItems[]>([])
  const [activeBooking, setActiveBookingState] = useState<SeatBookingWithMeta | null>(null)
  const [recentOrders, setRecentOrders] = useState<OrderWithItems[]>([])
  const [seatStats, setSeatStats] = useState({ total: 0, occupied: 0 })

  async function fetchDashboardData() {
    if (!user) {
      return
    }

    if (AUTH_PLACEHOLDER_MODE) {
      setLoading(true)
      const active = demoOrders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status))
      const recent = demoOrders.filter((order) => !ACTIVE_ORDER_STATUSES.includes(order.status)).slice(0, 5)

      setActiveOrders(active)
      setRecentOrders(recent)
      setSeatStats({
        total: DEMO_SEATS.length,
        occupied: DEMO_OCCUPIED_BOOKINGS.length + (selectedSeat ? 1 : 0)
      })

      if (selectedSeat) {
        setActiveBookingState({
          id: activeBookingId || 'demo-booking-active',
          seat_id: selectedSeat.seat_id,
          user_id: user.id,
          status: 'occupied',
          held_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
          extended: false,
          released_at: null,
          created_at: new Date().toISOString(),
          seats: {
            id: selectedSeat.seat_id,
            seat_number: selectedSeat.seat_number,
            table_id: selectedSeat.table_id,
            canteen_tables: {
              id: selectedSeat.table_id,
              table_number: selectedSeat.table_number,
              seats_count: 8,
              grid_row: 0,
              grid_col: 0
            }
          }
        })
      } else {
        setActiveBookingState(null)
      }

      setLoading(false)
      return
    }

    setLoading(true)

    const [
      { data: activeOrderRows, error: activeOrderError },
      { data: activeBookingRow, error: activeBookingError },
      { data: recentOrderRows, error: recentOrderError },
      { count: seatCount },
      { count: occupiedCount }
    ] = await Promise.all([
      supabase
        .from('orders')
        .select('*, order_items(*, menu_items(*))')
        .eq('user_id', user.id)
        .in('status', ACTIVE_ORDER_STATUSES)
        .order('created_at', { ascending: false }),
      supabase
        .from('seat_bookings')
        .select(
          `
            *,
            seats (
              id,
              seat_number,
              table_id,
              canteen_tables (
                id,
                table_number
              )
            )
          `
        )
        .eq('user_id', user.id)
        .in('status', ['held', 'occupied'])
        .maybeSingle(),
      supabase
        .from('orders')
        .select('*, order_items(*, menu_items(*))')
        .eq('user_id', user.id)
        .not('status', 'in', '(confirmed,preparing,ready)')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('seats').select('*', { count: 'exact', head: true }),
      supabase.from('seat_bookings').select('*', { count: 'exact', head: true }).in('status', ['held', 'occupied'])
    ])

    if (activeOrderError || activeBookingError || recentOrderError) {
      toast.error('Unable to load dashboard data right now.')
      setLoading(false)
      return
    }

    setActiveOrders((activeOrderRows || []) as OrderWithItems[])
    setActiveBookingState((activeBookingRow || null) as SeatBookingWithMeta | null)
    setRecentOrders((recentOrderRows || []) as OrderWithItems[])
    setSeatStats({
      total: seatCount || 0,
      occupied: occupiedCount || 0
    })

    setLoading(false)
  }

  useEffect(() => {
    void fetchDashboardData()
  }, [activeBookingId, demoOrders, selectedSeat, user])

  useEffect(() => {
    if (AUTH_PLACEHOLDER_MODE || !user) {
      return
    }

    const channel = supabase
      .channel(`dashboard-orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          void fetchDashboardData()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase, user])

  useEffect(() => {
    if (!activeOrders.length) {
      return
    }

    const interval = setInterval(() => {
      activeOrders.forEach((order) => {
        const computedStatus = getAutoStatus(order.estimated_prep_minutes, order.created_at)

        if (computedStatus !== order.status && computedStatus !== 'cancelled') {
          if (AUTH_PLACEHOLDER_MODE) {
            updateOrderStatus(order.id, computedStatus)
            return
          }

          void supabase.from('orders').update({ status: computedStatus }).eq('id', order.id)
        }
      })
    }, 30_000)

    return () => clearInterval(interval)
  }, [activeOrders, supabase, updateOrderStatus])

  async function handleOrderMore() {
    const bookingTableMeta = activeBooking?.seats?.canteen_tables
    const resolvedBookingTable = Array.isArray(bookingTableMeta) ? bookingTableMeta[0] : bookingTableMeta

    if (activeBooking?.seats && resolvedBookingTable) {
      setDiningMode('dine-in')
      setSelectedSeat({
        seat_id: activeBooking.seat_id,
        seat_number: activeBooking.seats.seat_number,
        table_id: activeBooking.seats.table_id,
        table_number: resolvedBookingTable.table_number
      })
      setActiveBooking(activeBooking.id, activeBooking.expires_at)
      router.push('/menu')
      return
    }

    router.push('/canteen')
  }

  async function handleCancelOrder(orderId: string) {
    const confirmed = window.confirm('Cancel this order? This cannot be undone.')

    if (!confirmed) {
      return
    }

    if (AUTH_PLACEHOLDER_MODE) {
      updateOrderStatus(orderId, 'cancelled')
      const remainingActiveOrders = activeOrders.filter((order) => order.id !== orderId)

      if (remainingActiveOrders.length === 0) {
        setActiveBooking(null)
        setSelectedSeat(null)
      }

      toast.success('Order cancelled')
      await fetchDashboardData()
      return
    }

    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)

    if (error) {
      toast.error('Unable to cancel order right now.')
      return
    }

    const remainingActiveOrders = activeOrders.filter((order) => order.id !== orderId)

    if (activeBooking && remainingActiveOrders.length === 0 && user) {
      await supabase.rpc('release_seat', { p_user_id: user.id })
      setActiveBooking(null)
      setSelectedSeat(null)
    }

    toast.success('Order cancelled')
    await fetchDashboardData()
  }

  async function handleDoneEating() {
    if (!user) {
      return
    }

    const confirmed = window.confirm('Release your seat now?')

    if (!confirmed) {
      return
    }

    if (AUTH_PLACEHOLDER_MODE) {
      setActiveBooking(null)
      setSelectedSeat(null)
      toast.success('Seat released. Thanks for visiting!')
      await fetchDashboardData()
      return
    }

    const { data, error } = await supabase.rpc('release_seat', { p_user_id: user.id })

    if (error || !data?.success) {
      toast.error('Unable to release seat right now.')
      return
    }

    setActiveBooking(null)
    setSelectedSeat(null)
    toast.success('Seat released. Thanks for visiting!')
    await fetchDashboardData()
  }

  const primaryOrder = activeOrders[0]
  const bookingTableMeta = activeBooking?.seats?.canteen_tables
  const resolvedBookingTable = Array.isArray(bookingTableMeta) ? bookingTableMeta[0] : bookingTableMeta

  return (
    <PageTransition>
      <section className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Overview</p>
            <h1 className="font-display text-[28px] font-bold text-[#1A1A1A]">
              Hey, {profile?.name || 'Student'}!
            </h1>
          </div>
          <CanteenStatusBadge occupied={seatStats.occupied} total={seatStats.total} />
        </header>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-card bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-[#6B6560]" />
          </div>
        ) : primaryOrder ? (
          <article className="rounded-card bg-[#1A1A1A] p-6 text-white shadow-warmLg">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[12px] uppercase tracking-[0.08em] text-[#A0A0A0]">Active Order</p>
                <h2 className="mt-1 font-display text-[30px] font-bold">#{primaryOrder.id.slice(0, 8).toUpperCase()}</h2>
              </div>
              <OrderStatusBadge status={primaryOrder.status} />
            </div>

            <div className="mt-4 space-y-3">
              {activeBooking?.seats && resolvedBookingTable ? (
                <p className="text-[14px] text-[#DADADA]">
                  Seat: Table {resolvedBookingTable.table_number}, Seat {activeBooking.seats.seat_number}
                </p>
              ) : (
                <p className="text-[14px] text-[#DADADA]">Takeaway order — pick up at counter</p>
              )}

              <p className="text-[14px] text-[#DADADA]">
                Items:{' '}
                {primaryOrder.order_items
                  ?.map((item) => `${item.menu_items?.name || 'Item'} ×${item.quantity}`)
                  .join(', ') || 'No items'}
              </p>

              <PrepProgressBar
                estimatedMinutes={primaryOrder.estimated_prep_minutes}
                createdAt={primaryOrder.created_at}
                status={primaryOrder.status}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={handleOrderMore}>Order More</Button>
              {primaryOrder.status !== 'ready' ? (
                <Button variant="outline" onClick={() => handleCancelOrder(primaryOrder.id)}>
                  Cancel Order
                </Button>
              ) : null}
              {(primaryOrder.status === 'ready' || primaryOrder.status === 'picked_up') && activeBooking ? (
                <Button variant="secondary" onClick={handleDoneEating}>
                  I&apos;m Done Eating
                </Button>
              ) : null}
            </div>
          </article>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No active orders"
            description="Start a new order to reserve your seat and skip the queue."
            actionLabel="Start New Order"
            onAction={() => router.push('/canteen')}
          />
        )}

        <QuickActions
          onNewOrder={() => router.push('/canteen')}
          onViewCanteen={() => router.push('/canteen')}
          onFullMenu={() => router.push('/menu')}
        />

        <section className="rounded-card bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[24px] font-bold text-[#1A1A1A]">Recent Orders</h2>
            <Button variant="ghost" onClick={() => router.push('/orders')}>
              View All Orders
            </Button>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-[14px] text-[#6B6560]">No recent orders found.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <article key={order.id} className="rounded-button bg-cream-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-semibold text-[#1A1A1A]">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[12px] text-[#6B6560]">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <span className="text-[14px] font-semibold text-[#1A1A1A]">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </PageTransition>
  )
}
