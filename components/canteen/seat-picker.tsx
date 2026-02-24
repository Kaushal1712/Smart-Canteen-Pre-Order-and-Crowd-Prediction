'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, X } from 'lucide-react'

import type { Seat, SeatBooking, SelectedSeat } from '@/lib/types'
import { cn } from '@/lib/utils/cn'

interface SeatPickerProps {
  open: boolean
  tableNumber: number
  seats: Seat[]
  bookings: SeatBooking[]
  currentUserId: string | null
  selectedSeat: SelectedSeat | null
  reservingSeatId: string | null
  onClose: () => void
  onSelectSeat: (seat: Seat) => void
}

export function SeatPicker({
  open,
  tableNumber,
  seats,
  bookings,
  currentUserId,
  selectedSeat,
  reservingSeatId,
  onClose,
  onSelectSeat
}: SeatPickerProps) {
  function getBooking(seatId: string) {
    return bookings.find((booking) => booking.seat_id === seatId && ['held', 'occupied'].includes(booking.status))
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[24px] bg-white p-5 shadow-warmXl md:inset-x-auto md:left-1/2 md:top-1/2 md:w-[520px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-card md:p-7"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Select Seat</p>
                <h3 className="font-display text-[24px] font-bold text-[#1A1A1A]">Table {tableNumber}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-[#6B6560]"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {seats.map((seat) => {
                const booking = getBooking(seat.id)
                const occupiedByOther = Boolean(booking && booking.user_id !== currentUserId)
                const reservedByCurrent = Boolean(booking && booking.user_id === currentUserId)
                const isSelected = selectedSeat?.seat_id === seat.id
                const isLoading = reservingSeatId === seat.id

                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={occupiedByOther || isLoading}
                    onClick={() => onSelectSeat(seat)}
                    className={cn(
                      'focus-ring relative flex h-14 w-full items-center justify-center rounded-chip text-[13px] font-semibold transition-all',
                      occupiedByOther
                        ? 'cursor-not-allowed bg-danger-50 text-danger-500'
                        : isSelected || reservedByCurrent
                          ? 'bg-info-500 text-white'
                          : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                    )}
                    aria-label={`Seat ${seat.seat_number}, ${occupiedByOther ? 'occupied' : 'available'}`}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `S${seat.seat_number}`}
                    {(isSelected || reservedByCurrent) && !isLoading ? (
                      <motion.span
                        className="absolute inset-0 rounded-chip border-2 border-info-500"
                        animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    ) : null}
                  </button>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-[12px] font-semibold">
              <span className="rounded-chip bg-sage-50 px-3 py-1 text-sage-600">Available</span>
              <span className="rounded-chip bg-info-50 px-3 py-1 text-info-500">Your seat</span>
              <span className="rounded-chip bg-danger-50 px-3 py-1 text-danger-500">Occupied</span>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
