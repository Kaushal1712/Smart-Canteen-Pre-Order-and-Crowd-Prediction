'use client'

import { cn } from '@/lib/utils/cn'

type SeatState = 'available' | 'occupied' | 'yours'

interface TableCardProps {
  tableNumber: number
  seatCount: number
  available: number
  occupied: number
  selected?: boolean
  condensed?: boolean
  seatStates: SeatState[]
  onClick: () => void
}

const seatColor: Record<SeatState, string> = {
  available: 'bg-sage-50 border border-sage-100',
  occupied: 'bg-cream-200 border border-cream-200',
  yours: 'bg-terracotta-400 border border-terracotta-500',
}

export function TableCard({
  tableNumber,
  seatCount,
  available,
  selected,
  condensed,
  seatStates,
  onClick,
}: TableCardProps) {
  const topSeats = seatStates.slice(0, 4)
  const bottomSeats = seatStates.slice(4, 8)

  const seatH = condensed ? 'h-[10px]' : 'h-[14px]'
  const tableH = condensed ? 'h-[28px]' : 'h-[44px]'
  const innerGap = condensed ? 'gap-[4px]' : 'gap-[6px]'
  const seatGap = condensed ? 'gap-[4px]' : 'gap-[6px]'

  return (
    <button
      type="button"
      className={cn(
        'focus-ring flex w-full flex-col rounded-card border text-left transition-all duration-300',
        condensed ? 'gap-2 p-3' : 'gap-3 p-4',
        selected 
          ? 'border-terracotta-400 bg-white shadow-warmMd ring-1 ring-terracotta-400 scale-[1.02]' 
          : 'border-cream-200 bg-white shadow-warmSm hover:shadow-warmMd hover:-translate-y-0.5 hover:border-cream-300'
      )}
      onClick={onClick}
      aria-label={`Table ${tableNumber}, ${available} of ${seatCount} seats available`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className={cn('font-display font-bold text-[#1A1A1A]', condensed ? 'text-[14px]' : 'text-[18px]')}>
          T{tableNumber}
        </p>
        <span className={cn('font-semibold text-[#6B6560]', condensed ? 'text-[10px]' : 'text-[12px]')}>
          {available}/{seatCount} free
        </span>
      </div>

      {/* Bird's-eye diagram — full width, fills remaining height */}
      <div className={cn('flex flex-1 flex-col justify-center', innerGap)}>
        {/* Top seats — flex-1 per seat so width matches header */}
        <div className={cn('flex w-full', seatGap)}>
          {topSeats.map((state, i) => (
            <span key={`t${i}`} className={cn('flex-1 rounded-card transition-colors duration-300', seatH, seatColor[state])} />
          ))}
        </div>
        {/* Table surface */}
        <div className={cn('w-full rounded-md bg-cream-50 border border-cream-200', tableH)} />
        {/* Bottom seats */}
        <div className={cn('flex w-full', seatGap)}>
          {bottomSeats.map((state, i) => (
            <span key={`b${i}`} className={cn('flex-1 rounded-card transition-colors duration-300', seatH, seatColor[state])} />
          ))}
        </div>
      </div>
    </button>
  )
}
