import { Check, Circle } from 'lucide-react'

import type { OrderStatus } from '@/lib/types'

const STEPS: OrderStatus[] = ['confirmed', 'preparing', 'ready', 'picked_up']

interface OrderTimelineProps {
  status: OrderStatus
}

function getStepIndex(status: OrderStatus): number {
  if (status === 'cancelled') {
    return -1
  }

  return STEPS.indexOf(status)
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  const currentStepIndex = getStepIndex(status)

  if (status === 'cancelled') {
    return (
      <div className="rounded-button bg-danger-50 px-3 py-2 text-[13px] font-semibold text-danger-500">
        Order cancelled
      </div>
    )
  }

  return (
    <ol className="space-y-2">
      {STEPS.map((step, index) => {
        const completed = index < currentStepIndex
        const active = index === currentStepIndex

        return (
          <li key={step} className="flex items-center gap-2 text-[13px]">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                completed || active
                  ? active
                    ? 'bg-amber-50 text-amber-500'
                    : 'bg-sage-50 text-sage-600'
                  : 'bg-cream-200 text-[#9C9590]'
              }`}
            >
              {completed ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
            </span>
            <span className={active ? 'font-semibold text-[#1A1A1A]' : 'text-[#6B6560]'}>
              {step.replace('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
