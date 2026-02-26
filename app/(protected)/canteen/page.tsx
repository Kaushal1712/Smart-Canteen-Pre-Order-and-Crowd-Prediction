'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Armchair, ChevronRight, Loader2, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

import { CanteenStatusBadge } from '@/components/canteen/canteen-status-badge'
import { SeatPicker } from '@/components/canteen/seat-picker'
import { TableCard } from '@/components/canteen/table-card'
import { PageTransition } from '@/components/shared/page-transition'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { LoadingButton } from '@/components/ui/loading-button'
import { AUTH_PLACEHOLDER_MODE } from '@/lib/config'
import { DEMO_CANTEEN_TABLES, DEMO_OCCUPIED_BOOKINGS, DEMO_SEATS } from '@/lib/demo-data'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/stores/use-cart-store'
import type { CanteenTable, Seat, SeatBooking } from '@/lib/types'

export default function CanteenPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { user } = useCurrentUser()

  const {
    diningMode,
    selectedSeat,
    holdExpiresAt,
    setDiningMode,
    setSelectedSeat,
    setActiveBooking,
    clearSeatState
  } = useCartStore()

  const [tables, setTables] = useState<CanteenTable[]>([])
  const [seats, setSeats] = useState<Seat[]>([])
  const [bookings, setBookings] = useState<SeatBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [reservingSeatId, setReservingSeatId] = useState<string | null>(null)
  const [holdRemainingSeconds, setHoldRemainingSeconds] = useState<number | null>(null)

  async function fetchBookingsOnly() {
    if (AUTH_PLACEHOLDER_MODE) {
      const demoBookings = [...DEMO_OCCUPIED_BOOKINGS]

      if (selectedSeat && user) {
        demoBookings.push({
          id: 'demo-current-user-booking',
          seat_id: selectedSeat.seat_id,
          user_id: user.id,
          status: 'held',
          held_at: new Date().toISOString(),
          expires_at: holdExpiresAt || new Date(Date.now() + 5 * 60_000).toISOString(),
          extended: false,
          released_at: null,
          created_at: new Date().toISOString()
        })
      }

      setBookings(demoBookings)
      return
    }

    const { data, error } = await supabase
      .from('seat_bookings')
      .select('*')
      .in('status', ['held', 'occupied'])

    if (error) {
      return
    }

    setBookings((data || []) as SeatBooking[])
  }

  async function fetchMapData() {
    if (!user) {
      return
    }

    if (AUTH_PLACEHOLDER_MODE) {
      setLoading(true)
      setTables(DEMO_CANTEEN_TABLES)
      setSeats(DEMO_SEATS)
      await fetchBookingsOnly()
      setLoading(false)
      return
    }

    setLoading(true)

    const [{ data: tableRows, error: tableError }, { data: seatRows, error: seatError }, { data: bookingRows, error: bookingError }] =
      await Promise.all([
        supabase.from('canteen_tables').select('*').order('grid_row', { ascending: true }).order('grid_col', { ascending: true }),
        supabase.from('seats').select('*'),
        supabase.from('seat_bookings').select('*').in('status', ['held', 'occupied'])
      ])

    if (tableError || seatError || bookingError) {
      toast.error('Unable to load canteen map right now.')
      setLoading(false)
      return
    }

    setTables((tableRows || []) as CanteenTable[])
    setSeats((seatRows || []) as Seat[])
    setBookings((bookingRows || []) as SeatBooking[])

    const { data: activeBooking } = await supabase
      .from('seat_bookings')
      .select(
        `
          id,
          seat_id,
          status,
          expires_at,
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
      .maybeSingle()

    if (activeBooking?.id && activeBooking.seats) {
      const seatMeta = activeBooking.seats as unknown as {
        id: string
        seat_number: number
        table_id: string
        canteen_tables?:
          | {
              id: string
              table_number: number
            }
          | Array<{
              id: string
              table_number: number
            }>
      }

      const tableMeta = Array.isArray(seatMeta.canteen_tables)
        ? seatMeta.canteen_tables[0]
        : seatMeta.canteen_tables

      if (tableMeta) {
        setSelectedSeat({
          seat_id: seatMeta.id,
          seat_number: seatMeta.seat_number,
          table_id: seatMeta.table_id,
          table_number: tableMeta.table_number
        })
        setDiningMode('dine-in')
        setActiveBooking(activeBooking.id, activeBooking.expires_at)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    document.title = 'Live Canteen | Smart Canteen'
  }, [])

  useEffect(() => {
    void fetchMapData()
  }, [user])

  useEffect(() => {
    if (AUTH_PLACEHOLDER_MODE) {
      return
    }

    const channel = supabase
      .channel('canteen-live-map')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seat_bookings' }, () => {
        void fetchBookingsOnly()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase])

  useEffect(() => {
    if (!holdExpiresAt) {
      setHoldRemainingSeconds(null)
      return
    }

    const expiresAtMs = new Date(holdExpiresAt).getTime()

    const calculateRemaining = () => Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000))
    setHoldRemainingSeconds(calculateRemaining())

    const interval = setInterval(() => {
      const remaining = calculateRemaining()
      setHoldRemainingSeconds(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [holdExpiresAt])

  function getBookingForSeat(seatId: string): SeatBooking | undefined {
    return bookings.find((booking) => booking.seat_id === seatId && ['held', 'occupied'].includes(booking.status))
  }

  const totalSeats = seats.length
  const occupiedSeats = bookings.length
  const fullyBooked = totalSeats > 0 && occupiedSeats >= totalSeats

  const selectedTable = tables.find((table) => table.id === selectedTableId) || null
  const selectedTableSeats = selectedTable ? seats.filter((seat) => seat.table_id === selectedTable.id) : []

  const holdMinutes = holdRemainingSeconds !== null ? Math.floor(holdRemainingSeconds / 60) : null
  const holdSeconds = holdRemainingSeconds !== null ? String(holdRemainingSeconds % 60).padStart(2, '0') : null

  async function handleTakeawayMode() {
    if (!AUTH_PLACEHOLDER_MODE && user && selectedSeat) {
      await supabase.rpc('release_seat', { p_user_id: user.id })
    }

    setDiningMode('takeaway')
    setSelectedSeat(null)
    setActiveBooking(null)
    router.push('/menu')
  }

  async function handleHoldSeat(seat: Seat) {
    if (!user || !selectedTable) {
      toast.error('Please login and choose a table first.')
      return
    }

    const existingBooking = getBookingForSeat(seat.id)

    if (existingBooking && existingBooking.user_id === user.id) {
      setSelectedSeat({
        seat_id: seat.id,
        seat_number: seat.seat_number,
        table_id: seat.table_id,
        table_number: selectedTable.table_number
      })
      setDiningMode('dine-in')
      setActiveBooking(existingBooking.id, existingBooking.expires_at)
      toast.success('Seat already reserved for you.')
      return
    }

    setReservingSeatId(seat.id)

    if (AUTH_PLACEHOLDER_MODE) {
      const holdExpires = new Date(Date.now() + 5 * 60_000).toISOString()
      setSelectedSeat({
        seat_id: seat.id,
        seat_number: seat.seat_number,
        table_id: seat.table_id,
        table_number: selectedTable.table_number
      })
      setDiningMode('dine-in')
      setActiveBooking(`demo-booking-${Date.now()}`, holdExpires)
      toast.success('Seat held for 5 minutes. Complete your order now.')
      setPickerOpen(false)
      await fetchBookingsOnly()
      setReservingSeatId(null)
      return
    }

    try {
      const { data, error } = await supabase.rpc('hold_seat', {
        p_seat_id: seat.id,
        p_user_id: user.id
      })

      if (error) {
        throw error
      }

      const response = data as { success: boolean; error?: string }

      if (!response?.success) {
        toast.error(response?.error || 'Seat is not available. Pick another seat.')
        return
      }

      const { data: bookingRow, error: bookingError } = await supabase
        .from('seat_bookings')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['held', 'occupied'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (bookingError || !bookingRow) {
        throw bookingError || new Error('Seat held but booking data could not be loaded.')
      }

      setSelectedSeat({
        seat_id: seat.id,
        seat_number: seat.seat_number,
        table_id: seat.table_id,
        table_number: selectedTable.table_number
      })
      setDiningMode('dine-in')
      setActiveBooking(bookingRow.id, bookingRow.expires_at)
      toast.success('Seat held for 5 minutes. Complete your order now.')
      setPickerOpen(false)

      await fetchBookingsOnly()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reserve seat.'
      toast.error(message)
    } finally {
      setReservingSeatId(null)
    }
  }

  function handleContinueToMenu() {
    if (!selectedSeat) {
      toast.error('Select a seat before proceeding.')
      return
    }

    setDiningMode('dine-in')
    router.push('/menu')
  }

  async function handleClearSeat() {
    if (AUTH_PLACEHOLDER_MODE) {
      clearSeatState()
      setDiningMode('dine-in')
      setBookings([...DEMO_OCCUPIED_BOOKINGS])
      toast.success('Seat released.')
      return
    }

    if (!AUTH_PLACEHOLDER_MODE && user) {
      await supabase.rpc('release_seat', { p_user_id: user.id })
    }

    clearSeatState()
    setDiningMode('dine-in')
    await fetchBookingsOnly()
    toast.success('Seat released.')
  }

  const tablesByRow = tables.reduce<Record<number, CanteenTable[]>>((acc, table) => {
    if (!acc[table.grid_row]) acc[table.grid_row] = []
    acc[table.grid_row].push(table)
    return acc
  }, {})
  const sortedRowIndices = Object.keys(tablesByRow).map(Number).sort((a, b) => a - b)

  return (
    <PageTransition>
      <section className="space-y-6">
        {/* ── Desktop header ── */}
        <header className="hidden sm:flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Seat Selection</p>
            <div className="flex items-center gap-3">
               <h1 className="font-display text-[28px] font-bold text-[#1A1A1A]">Live Canteen Map</h1>
               <CanteenStatusBadge occupied={occupiedSeats} total={totalSeats} />
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleTakeawayMode}
            className="flex items-center gap-2 rounded-button bg-[#1A1A1A] px-4 py-2.5 text-sm font-semibold text-white shadow-warmSm hover:bg-[#2A2A2A] active:bg-[#333] transition-all focus-ring"
          >
            <ShoppingBag className="h-4 w-4 text-white/70" />
            Skip to Takeaway
          </button>
        </header>

        {/* ── Mobile header ── */}
        <header className="flex flex-col gap-3 sm:hidden">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Seat Selection</p>
            <h1 className="font-display text-[26px] font-bold text-[#1A1A1A]">Live Canteen</h1>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Seats available box */}
            <div className="flex items-center justify-center gap-2 rounded-[14px] bg-[#F4FAF0] px-3 py-3 ring-1 ring-[#B7E0A4]">
              <span className="flex h-2 w-2 shrink-0 rounded-full bg-[#3DA830]" />
              <span className="text-[13px] font-semibold leading-snug text-[#2D7A22]">
                {Math.max(0, totalSeats - occupiedSeats)} / {totalSeats} seats free
              </span>
            </div>

            {/* Skip to Takeaway box */}
            <button
              type="button"
              onClick={handleTakeawayMode}
              className="flex items-center justify-center gap-2 rounded-[14px] bg-[#1A1A1A] px-3 py-3 text-[13px] font-semibold text-white shadow-warmSm active:bg-[#333] transition-all"
            >
              <ShoppingBag className="h-[15px] w-[15px] text-white/70 shrink-0" />
              Skip to Takeaway
            </button>
          </div>
        </header>

        {selectedSeat ? (
          <div className="flex flex-col gap-3 overflow-hidden rounded-card bg-[#1A1A1A] px-5 py-4 text-white sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#A0A0A0]">Active Seat Hold</p>
              <p className="mt-1 text-[15px] font-semibold">
                Table {selectedSeat.table_number}, Seat {selectedSeat.seat_number}
              </p>
              {holdMinutes !== null && holdSeconds !== null ? (
                <p className="mt-1 text-[13px] text-[#A0A0A0]">
                  Expires in {holdMinutes}:{holdSeconds}
                </p>
              ) : null}
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => {
                  void handleClearSeat()
                }}
              >
                Clear Seat
              </Button>
              <Button className="w-full sm:w-auto" onClick={handleContinueToMenu}>
                Continue to Menu
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="map-grid-background overflow-x-auto overflow-y-hidden rounded-card bg-[#FBF9F6] border border-cream-200/60 shadow-inner hide-scrollbar touch-pan-x relative">
            <div className="flex flex-col gap-4 md:gap-5 min-w-[760px] lg:min-w-full w-full p-4 md:p-6">
              {[5, 5, 6].map((colCount, r) => (
                <div 
                  key={r} 
                  className="grid gap-4 border border-cream-200 p-2 md:p-4 rounded-xl"
                  style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: colCount }).map((_, c) => (
                    <Skeleton key={c} className="aspect-square w-full rounded-xl bg-white" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : fullyBooked ? (
          <EmptyState
            icon={Armchair}
            title="All seats are currently occupied"
            description="Try takeaway mode or check back in a few minutes for newly released seats."
            actionLabel="Order Takeaway"
            onAction={handleTakeawayMode}
          />
        ) : (
          <div className="map-grid-background overflow-x-auto overflow-y-hidden rounded-card bg-[#FBF9F6] border border-cream-200/60 shadow-inner hide-scrollbar touch-pan-x relative">
            <div className="flex flex-col gap-4 md:gap-5 min-w-[760px] lg:min-w-full w-full p-4 md:p-6">
              {sortedRowIndices.map((rowIndex) => {
                const rowTables = tablesByRow[rowIndex].slice().sort((a, b) => a.grid_col - b.grid_col)
                const colCount = rowTables.length
                const isCondensed = colCount > 5

                return (
                  <div
                    key={rowIndex}
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
                      gap: isCondensed ? '8px' : '16px'
                    }}
                  >
                    {rowTables.map((table) => {
                      const tableSeats = seats.filter((seat) => seat.table_id === table.id)
                      const seatIds = new Set(tableSeats.map((seat) => seat.id))
                      const occupied = bookings.filter((booking) => seatIds.has(booking.seat_id)).length
                      const available = Math.max(0, tableSeats.length - occupied)

                      const seatStates = tableSeats
                        .slice()
                        .sort((a, b) => a.seat_number - b.seat_number)
                        .map((seat): 'available' | 'occupied' | 'yours' => {
                          if (selectedSeat?.seat_id === seat.id) return 'yours'
                          const booking = bookings.find(
                            (b) => b.seat_id === seat.id && ['held', 'occupied'].includes(b.status)
                          )
                          if (!booking) return 'available'
                          if (booking.user_id === user?.id) return 'yours'
                          return 'occupied'
                        })

                      return (
                        <TableCard
                          key={table.id}
                          tableNumber={table.table_number}
                          seatCount={table.seats_count}
                          available={available}
                          occupied={occupied}
                          selected={selectedTableId === table.id}
                          condensed={isCondensed}
                          seatStates={seatStates}
                          onClick={() => {
                            setSelectedTableId(table.id)
                            setPickerOpen(true)
                          }}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <SeatPicker
          open={pickerOpen}
          tableNumber={selectedTable?.table_number || 0}
          seats={selectedTableSeats}
          bookings={bookings}
          currentUserId={user?.id || null}
          selectedSeat={selectedSeat}
          reservingSeatId={reservingSeatId}
          onClose={() => setPickerOpen(false)}
          onSelectSeat={handleHoldSeat}
        />

        <div className="rounded-card bg-cream-50 p-5 border border-cream-200 shadow-warmSm">
          <p className="text-[14px] text-[#6B6560] leading-relaxed">
            Select a table to view seats. <span className="font-semibold text-sage-600">Green outlines</span> are available, <span className="font-semibold text-cream-600">grey boxes</span> are occupied,
            and <span className="font-semibold text-terracotta-600">terracotta</span> marks your seat. Your seat hold remains active for 5 minutes
            while you complete order checkout.
          </p>
        </div>
      </section>
    </PageTransition>
  )
}
