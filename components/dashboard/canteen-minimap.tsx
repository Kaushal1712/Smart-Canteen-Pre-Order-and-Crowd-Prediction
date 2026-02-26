'use client'

import { Armchair, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CanteenTable, Seat, SeatBooking } from '@/lib/types'
import { cn } from '@/lib/utils/cn'

interface CanteenMinimapProps {
  tables: CanteenTable[]
  seats: Seat[]
  bookings: SeatBooking[]
  loading?: boolean
  occupied: number
  total: number
  onViewFull: () => void
}

export function CanteenMinimap({
  tables,
  seats,
  bookings,
  loading = false,
  occupied,
  total,
  onViewFull
}: CanteenMinimapProps) {
  const tablesByRow = tables.reduce<Record<number, CanteenTable[]>>((acc, table) => {
    if (!acc[table.grid_row]) acc[table.grid_row] = []
    acc[table.grid_row].push(table)
    return acc
  }, {})

  const sortedRowIndices = Object.keys(tablesByRow).map(Number).sort((a, b) => a - b)

  const getTableStatus = (tableId: string) => {
    const tableSeats = seats.filter((seat) => seat.table_id === tableId)
    const seatIds = new Set(tableSeats.map((seat) => seat.id))
    const occupied = bookings.filter((booking) => seatIds.has(booking.seat_id)).length
    return {
      occupied,
      available: Math.max(0, tableSeats.length - occupied),
      total: tableSeats.length
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[#6B6560]" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
        <div className="mb-3 flex-shrink-0 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9C9590] mb-0.5">
              Live Canteen
            </p>
            <h3 className="font-display text-[18px] font-bold text-[#1A1A1A]">Map Preview</h3>
          </div>
          <span className="text-[11px] font-semibold text-sage-600 bg-sage-50 rounded-full px-2.5 py-1 whitespace-nowrap">
            {total - occupied}/{total} available
          </span>
        </div>

        {/* Minimap Grid */}
        <div className="flex-1 map-grid-background bg-white rounded-lg p-1 lg:p-2 overflow-hidden flex flex-col justify-center mb-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)] border border-cream-200">
          <div className="flex flex-col gap-1 lg:gap-2">
            {sortedRowIndices.map((rowIndex) => {
              const rowTables = tablesByRow[rowIndex].slice().sort((a, b) => a.grid_col - b.grid_col)
              const colCount = Math.min(rowTables.length, 6)

              return (
                <div
                  key={rowIndex}
                  className="grid gap-0.5 lg:gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`
                  }}
                >
                  {rowTables.map((table) => {
                    const status = getTableStatus(table.id)
                    const isFull = status.occupied >= status.total
                    const isEmpty = status.occupied === 0

                    return (
                      <div
                        key={table.id}
                        className={cn(
                          'rounded-sm p-1.5 text-center transition-colors text-[9px] font-semibold border',
                          isFull
                            ? 'bg-danger-50 text-danger-500 border-danger-500/30'
                            : isEmpty
                              ? 'bg-sage-50 text-sage-500 border-sage-500/20'
                              : 'bg-amber-50 text-amber-500 border-amber-500/30'
                        )}
                        title={`T${table.table_number}: ${status.available} free, ${status.occupied} occupied`}
                      >
                        <div className="font-bold text-[10px]">T{table.table_number}</div>
                        <div className="text-[8px] leading-tight">
                          {status.available}/{status.total}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-1.5 flex-wrap text-[9px] mb-2 flex-shrink-0">
          <div className="flex items-center gap-0.5">
            <div className="h-1.5 w-1.5 rounded-sm bg-sage-50 border border-sage-500/20" />
            <span className="text-[#6B6560]">Avail</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="h-1.5 w-1.5 rounded-sm bg-amber-50 border border-amber-500/30" />
            <span className="text-[#6B6560]">Part</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="h-1.5 w-1.5 rounded-sm bg-danger-50 border border-danger-500/30" />
            <span className="text-[#6B6560]">Full</span>
          </div>
        </div>

        <Button
          onClick={onViewFull}
          variant="outline"
          className="w-full flex items-center gap-1.5 justify-center text-xs h-7 flex-shrink-0 bg-white hover:bg-white hover:text-black hover:shadow-warmMd transition-shadow"
        >
          <Armchair className="h-3 w-3" />
          <span>Full Map</span>
        </Button>
    </div>
  )
}
