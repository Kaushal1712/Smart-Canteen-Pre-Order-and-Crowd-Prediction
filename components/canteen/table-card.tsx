'use client'

import { motion } from 'framer-motion'

import { cn } from '@/lib/utils/cn'

interface TableCardProps {
  tableNumber: number
  seatCount: number
  available: number
  occupied: number
  selected?: boolean
  onClick: () => void
}

export function TableCard({ tableNumber, seatCount, available, occupied, selected, onClick }: TableCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      className={cn(
        'focus-ring flex min-h-[118px] w-full flex-col justify-between rounded-card border border-transparent bg-[#f7e8de] p-4 text-left transition-shadow hover:shadow-warmMd',
        selected ? 'border-info-500 bg-info-50' : ''
      )}
      onClick={onClick}
      aria-label={`Table ${tableNumber}, ${available} seats available, ${occupied} occupied`}
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-[20px] font-bold text-[#1A1A1A]">T{tableNumber}</p>
        <span className="rounded-chip bg-white px-2 py-1 text-[11px] font-semibold text-[#6B6560]">
          {seatCount} seats
        </span>
      </div>
      <div className="flex items-center gap-4 text-[13px] font-semibold">
        <span className="text-sage-600">{available} free</span>
        <span className="text-danger-500">{occupied} occupied</span>
      </div>
    </motion.button>
  )
}
