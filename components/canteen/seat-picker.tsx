'use client'

import { createPortal } from 'react-dom'
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

  const modal = (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="pointer-events-auto relative w-full max-w-[520px] rounded-[24px] bg-white p-5 shadow-warmXl md:p-7"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
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
                      'focus-ring relative flex h-12 w-full items-center justify-center rounded-button text-[13px] font-semibold transition-all',
                      occupiedByOther
                        ? 'cursor-not-allowed bg-cream-200 text-[#9C9590]'
                        : isSelected || reservedByCurrent
                          ? 'bg-terracotta-500 text-white shadow-warmSm'
                          : 'border border-sage-100 bg-sage-50 text-sage-600 hover:bg-sage-100 hover:shadow-warmSm'
                    )}
                    aria-label={`Seat ${seat.seat_number}, ${occupiedByOther ? 'occupied' : 'available'}`}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `S${seat.seat_number}`}
                  </button>
                )
              })}
            </div>

            {/* Legend with square swatches */}
            <div className="mt-5 flex flex-wrap gap-4 text-[12px] font-semibold text-[#6B6560]">
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded-[4px] border border-sage-100 bg-sage-50" />
                Available
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded-[4px] bg-terracotta-400 border border-terracotta-500" />
                Your seat
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded-[4px] bg-cream-200" />
                Occupied
              </span>
            </div>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )

  return typeof window !== 'undefined' ? createPortal(modal, document.body) : null
}
