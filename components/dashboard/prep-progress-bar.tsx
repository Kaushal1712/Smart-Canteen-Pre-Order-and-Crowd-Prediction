'use client'

import { motion } from 'framer-motion'

import type { OrderStatus } from '@/lib/types'
import { getOrderProgress } from '@/lib/utils/format'
import { getRemainingPrepMinutes } from '@/lib/utils/order-lifecycle'

interface PrepProgressBarProps {
  estimatedMinutes: number
  createdAt: string
  status: OrderStatus
}

export function PrepProgressBar({ estimatedMinutes, createdAt, status }: PrepProgressBarProps) {
  const progress = getOrderProgress(estimatedMinutes, createdAt, status)
  const remainingMinutes = getRemainingPrepMinutes(estimatedMinutes, createdAt)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[13px]">
        <span className="text-[#6B6560]">Prep progress</span>
        <span className="font-semibold text-[#1A1A1A]">
          {status === 'ready' || status === 'picked_up' ? 'Ready for pickup!' : `~${remainingMinutes} min remaining`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-chip bg-cream-200">
        <motion.div
          className={status === 'ready' || status === 'picked_up' ? 'h-full bg-sage-500' : 'h-full bg-info-500'}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
