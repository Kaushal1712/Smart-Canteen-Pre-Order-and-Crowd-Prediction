'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { QuickActions } from '@/components/dashboard/quick-actions'
import { ActiveOrderCard } from '@/components/dashboard/active-order-card'
import { CanteenMinimap } from '@/components/dashboard/canteen-minimap'
import { PageTransition } from '@/components/shared/page-transition'
import { Skeleton } from '@/components/ui/skeleton'
import { AUTH_PLACEHOLDER_MODE } from '@/lib/config'
import { DEMO_CANTEEN_TABLES, DEMO_OCCUPIED_BOOKINGS, DEMO_SEATS } from '@/lib/demo-data'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/stores/use-cart-store'
import { useOrderStore } from '@/lib/stores/use-order-store'
import type { CanteenTable, OrderWithItems, Seat, SeatBooking, SeatBookingWithMeta } from '@/lib/types'
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
  const [canteenTables, setCanteenTables] = useState<CanteenTable[]>([])
  const [canteenSeats, setCanteenSeats] = useState<Seat[]>([])
  const [canteenBookings, setCanteenBookings] = useState<SeatBooking[]>([])
  const [canteenLoading, setCanteenLoading] = useState(false)

  async function fetchCanteenData() {
    setCanteenLoading(true)

    if (AUTH_PLACEHOLDER_MODE) {
      setCanteenTables(DEMO_CANTEEN_TABLES)
      setCanteenSeats(DEMO_SEATS)
      setCanteenBookings(DEMO_OCCUPIED_BOOKINGS)
      setCanteenLoading(false)
      return
    }

    try {
      const [{ data: tableRows }, { data: seatRows }, { data: bookingRows }] = await Promise.all([
        supabase.from('canteen_tables').select('*').order('grid_row', { ascending: true }).order('grid_col', { ascending: true }),
        supabase.from('seats').select('*'),
        supabase.from('seat_bookings').select('*').in('status', ['held', 'occupied'])
      ])

      if (tableRows) setCanteenTables(tableRows as CanteenTable[])
      if (seatRows) setCanteenSeats(seatRows as Seat[])
      if (bookingRows) setCanteenBookings(bookingRows as SeatBooking[])
    } catch (error) {
      console.error('Failed to fetch canteen data:', error)
    } finally {
      setCanteenLoading(false)
    }
  }

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
    document.title = 'Smart Canteen'
  }, [])

  useEffect(() => {
    void fetchDashboardData()
    void fetchCanteenData()
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

    setDiningMode('takeaway')
    router.push('/menu')
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

  async function handlePickedUp(orderId: string) {
    if (AUTH_PLACEHOLDER_MODE) {
      updateOrderStatus(orderId, 'picked_up')
      // Also release seat if this was a dine-in order
      const order = activeOrders.find((o) => o.id === orderId)
      if (order?.order_type === 'dine-in' && activeBooking) {
        setActiveBooking(null)
        setSelectedSeat(null)
      }
      toast.success('Order marked as picked up!')
      await fetchDashboardData()
      return
    }

    if (!user) return

    const { error } = await supabase
      .from('orders')
      .update({ status: 'picked_up' })
      .eq('id', orderId)

    if (error) {
      toast.error('Unable to update order right now.')
      return
    }

    // Release the seat if this was a dine-in order
    const order = activeOrders.find((o) => o.id === orderId)
    if (order?.order_type === 'dine-in' && activeBooking) {
      await supabase.rpc('release_seat', { p_user_id: user.id })
      setActiveBooking(null)
      setSelectedSeat(null)
    }

    toast.success('Order marked as picked up!')
    await fetchDashboardData()
  }

  const primaryOrder = activeOrders[0]
  const bookingTableMeta = activeBooking?.seats?.canteen_tables
  const resolvedBookingTable = Array.isArray(bookingTableMeta) ? bookingTableMeta[0] : bookingTableMeta

  const occupancyPercent = seatStats.total === 0 ? 0 : Math.round((seatStats.occupied / seatStats.total) * 100)

  return (
    <PageTransition>
      <section className="h-[calc(100dvh-172px)] lg:h-[calc(100dvh-80px)] flex flex-col overflow-hidden bg-white max-w-screen-2xl mx-auto w-full">
        {/* Header — desktop only */}
        <header className="hidden lg:flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-cream-100 flex-shrink-0">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Overview</p>
            <h1 className="font-display text-[28px] font-bold text-[#1A1A1A]">
              Hey, {profile?.name || 'Student'}!
            </h1>
          </div>
        </header>

        {/* Main Content Grid - Takes remaining space */}
        {loading ? (
          <div className="flex-1 flex flex-col gap-2 lg:grid lg:gap-3 lg:grid-cols-3 lg:grid-rows-1 lg:pt-4 overflow-hidden">
            <div className="lg:col-span-2 flex flex-col gap-2 lg:gap-3 min-w-0 min-h-0 flex-1 lg:flex-initial bg-cream-50 border border-cream-200 rounded-card p-2 lg:p-3 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center">
                <div className="space-y-4 h-full flex flex-col">
                  <Skeleton className="h-6 w-32 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden space-y-2">
                    <Skeleton className="h-[120px] w-full rounded-2xl" />
                    <Skeleton className="h-[120px] w-full rounded-2xl" />
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 mt-auto pt-2 grid grid-cols-3 gap-2">
                 <Skeleton className="h-14 w-full rounded-xl" />
                 <Skeleton className="h-14 w-full rounded-xl" />
                 <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            </div>
            <div className="lg:col-span-1 min-h-0 min-w-0 overflow-hidden flex-1 lg:flex-initial bg-cream-50 border border-cream-200 rounded-card p-2 lg:p-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)]">
               <div className="flex flex-col h-full gap-4 p-2">
                 <div className="flex justify-between items-center flex-shrink-0">
                   <Skeleton className="h-6 w-32" />
                   <Skeleton className="h-6 w-16" />
                 </div>
                 <Skeleton className="flex-1 min-h-[200px] w-full rounded-2xl" />
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-2 lg:grid lg:gap-3 lg:grid-cols-3 lg:grid-rows-1 lg:pt-4 overflow-hidden">
            {/* Left Column: Active Orders + Quick Actions */}
            <div className="lg:col-span-2 flex flex-col gap-2 lg:gap-3 min-w-0 min-h-0 flex-1 lg:flex-initial bg-cream-50 border border-cream-200 rounded-card p-2 lg:p-3 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)]">
              {/* Active Orders / Empty State — fills remaining space, buttons stay at bottom */}
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center">
                {primaryOrder ? (
                  <div className="space-y-2 h-full flex flex-col">
                    <h2 className="font-display text-[16px] font-bold text-[#1A1A1A] flex-shrink-0">Active Orders</h2>
                    <div className="flex-1 overflow-y-auto pr-2">
                      <div className="space-y-2">
                        {activeOrders.map((order) => (
                          <ActiveOrderCard
                            key={order.id}
                            order={order}
                            tableInfo={
                              order === primaryOrder && activeBooking?.seats && resolvedBookingTable
                                ? {
                                    tableNumber: resolvedBookingTable.table_number,
                                    seatNumber: activeBooking.seats.seat_number
                                  }
                                : null
                            }
                            onCancel={() => handleCancelOrder(order.id)}
                            onPickedUp={order.status === 'ready' ? () => handlePickedUp(order.id) : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Compact empty state for mobile */}
                    <div className="lg:hidden flex flex-col items-center justify-center gap-3 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-100">
                        <ClipboardList className="h-5 w-5 text-cream-400" />
                      </div>
                      <p className="text-[14px] font-semibold text-[#1A1A1A]">No active orders</p>
                      <p className="text-[12px] text-[#6B6560]">Place an order to get started</p>
                    </div>
                    {/* Full empty state for desktop */}
                    <div className="hidden lg:flex flex-col items-center justify-center gap-3 py-8">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-100 shadow-sm">
                        <ClipboardList className="h-7 w-7 text-cream-400" />
                      </div>
                      <h3 className="font-display text-[20px] font-bold text-[#1A1A1A]">No active orders</h3>
                      <p className="text-[14px] text-[#6B6560]">Use the actions below to place a new order</p>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Actions — pinned to bottom */}
              <div className="flex-shrink-0 mt-auto">
                <QuickActions
                  hasActiveOrders={activeOrders.length > 0}
                  onNewOrder={activeOrders.length > 0 ? handleOrderMore : () => router.push('/canteen')}
                  onFullMenu={() => router.push('/menu')}
                  onViewOrders={() => router.push('/orders')}
                />
              </div>
            </div>

            {/* Right Column / Bottom on mobile: Live Canteen Minimap */}
            <div className="lg:col-span-1 min-h-0 min-w-0 overflow-hidden flex-1 lg:flex-initial bg-cream-50 border border-cream-200 rounded-card p-2 lg:p-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)]">
              <CanteenMinimap
                tables={canteenTables}
                seats={canteenSeats}
                bookings={canteenBookings}
                loading={canteenLoading}
                occupied={seatStats.occupied}
                total={seatStats.total}
                onViewFull={() => router.push('/canteen')}
              />
            </div>
          </div>
        )}
      </section>
    </PageTransition>
  )
}
