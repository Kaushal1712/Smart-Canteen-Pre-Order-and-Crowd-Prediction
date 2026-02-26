'use client'

import { Armchair } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface LiveCanteenPreviewProps {
  occupied: number
  total: number
  occupancyPercent: number
  onViewCanteen: () => void
}

export function LiveCanteenPreview({
  occupied,
  total,
  occupancyPercent,
  onViewCanteen
}: LiveCanteenPreviewProps) {
  const getStatusColor = (percent: number) => {
    if (percent > 80) return 'text-danger-500'
    if (percent >= 50) return 'text-amber-500'
    return 'text-sage-500'
  }

  const getStatusLabel = (percent: number) => {
    if (percent > 80) return 'Very Busy'
    if (percent >= 50) return 'Moderate'
    return 'Quiet'
  }

  const getBackgroundColor = (percent: number) => {
    if (percent > 80) return 'bg-danger-50'
    if (percent >= 50) return 'bg-amber-50'
    return 'bg-sage-50'
  }

  return (
    <Card className="h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590] mb-1">
            Live Canteen
          </p>
          <h3 className="font-display text-[20px] font-bold text-[#1A1A1A]">Occupancy</h3>
        </div>

        <div className={`rounded-card ${getBackgroundColor(occupancyPercent)} p-4 mb-4 flex-1 flex flex-col justify-center`}>
          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              <span className={`font-display text-[32px] font-bold ${getStatusColor(occupancyPercent)}`}>
                {occupancyPercent}%
              </span>
              <span className={`text-[12px] font-semibold ${getStatusColor(occupancyPercent)}`}>
                {getStatusLabel(occupancyPercent)}
              </span>
            </div>
          </div>

          <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                occupancyPercent > 80
                  ? 'bg-danger-500'
                  : occupancyPercent >= 50
                    ? 'bg-amber-500'
                    : 'bg-sage-500'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>

          <p className="text-[13px] font-semibold text-[#1A1A1A] mt-3">
            {occupied} of {total} seats
          </p>
        </div>

        <Button
          onClick={onViewCanteen}
          variant="outline"
          className="w-full flex items-center gap-2 justify-center"
        >
          <Armchair className="h-4 w-4" />
          <span>View Layout</span>
        </Button>
      </CardContent>
    </Card>
  )
}
