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
      const seatMeta = activeBooking.seats as {
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

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000))
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

  const maxColumns = Math.max(...tables.map((table) => table.grid_col + 1), 1)

  return (
    <PageTransition>
      <section className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Seat Selection</p>
            <h1 className="font-display text-[28px] font-bold text-[#1A1A1A]">Live Canteen Map</h1>
          </div>
          <CanteenStatusBadge occupied={occupiedSeats} total={totalSeats} />
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setDiningMode('dine-in')}
            className={`focus-ring rounded-card border px-5 py-5 text-left transition-all ${
              diningMode === 'dine-in' || !diningMode
                ? 'border-terracotta-500 bg-terracotta-50'
                : 'border-transparent bg-white'
            }`}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-terracotta-600 shadow-warmSm">
              <Armchair className="h-5 w-5" />
            </div>
            <p className="font-display text-[22px] font-bold text-[#1A1A1A]">Dine In</p>
            <p className="mt-1 text-[14px] text-[#6B6560]">Book your seat and order food in advance.</p>
          </button>

          <button
            type="button"
            onClick={handleTakeawayMode}
            className="focus-ring rounded-card border border-transparent bg-white px-5 py-5 text-left transition-all hover:shadow-warmMd"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cream-100 text-[#6B6560]">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <p className="font-display text-[22px] font-bold text-[#1A1A1A]">Takeaway</p>
            <p className="mt-1 text-[14px] text-[#6B6560]">Skip seat booking and place a pickup order directly.</p>
          </button>
        </div>

        {selectedSeat ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-[#1A1A1A] px-5 py-4 text-white">
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
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  void handleClearSeat()
                }}
              >
                Clear Seat
              </Button>
              <Button onClick={handleContinueToMenu}>
                Continue to Menu
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-card bg-white">
            <Loader2 className="h-5 w-5 animate-spin text-[#6B6560]" />
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
          <div className="map-grid-background overflow-hidden rounded-card bg-[#e9f6fa] p-4 md:p-6">
            <div
              className="grid gap-4 md:gap-5"
              style={{
                gridTemplateColumns: `repeat(${Math.max(2, Math.min(maxColumns, 5))}, minmax(0, 1fr))`
              }}
            >
              {tables.map((table) => {
                const tableSeats = seats.filter((seat) => seat.table_id === table.id)
                const seatIds = new Set(tableSeats.map((seat) => seat.id))
                const occupied = bookings.filter((booking) => seatIds.has(booking.seat_id)).length
                const available = Math.max(0, tableSeats.length - occupied)

                return (
                  <TableCard
                    key={table.id}
                    tableNumber={table.table_number}
                    seatCount={table.seats_count}
                    available={available}
                    occupied={occupied}
                    selected={selectedTableId === table.id}
                    onClick={() => {
                      setSelectedTableId(table.id)
                      setPickerOpen(true)
                    }}
                  />
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

        <div className="rounded-card bg-cream-50 p-5">
          <p className="text-[14px] text-[#6B6560]">
            Select a table to view seats. Green seats are available, red are occupied, blue is your selected seat.
            Your seat hold remains active for 5 minutes while you complete order checkout.
          </p>
        </div>

        <LoadingButton
          loading={false}
          className="w-full md:w-auto"
          onClick={handleContinueToMenu}
          disabled={!selectedSeat}
        >
          Continue to Menu
          <ChevronRight className="h-4 w-4" />
        </LoadingButton>
      </section>
    </PageTransition>
  )
}
