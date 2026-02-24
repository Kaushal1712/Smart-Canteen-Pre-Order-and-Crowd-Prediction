import { Armchair, PlusCircle, UtensilsCrossed } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

interface QuickActionsProps {
  onNewOrder: () => void
  onViewCanteen: () => void
  onFullMenu: () => void
}

export function QuickActions({ onNewOrder, onViewCanteen, onFullMenu }: QuickActionsProps) {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {[
        {
          title: 'New Order',
          description: 'Reserve seat and start a fresh order.',
          icon: PlusCircle,
          onClick: onNewOrder
        },
        {
          title: 'View Canteen',
          description: 'Check live table and seat occupancy.',
          icon: Armchair,
          onClick: onViewCanteen
        },
        {
          title: 'Full Menu',
          description: 'Browse all available items.',
          icon: UtensilsCrossed,
          onClick: onFullMenu
        }
      ].map((action) => (
        <button key={action.title} type="button" onClick={action.onClick} className="focus-ring text-left">
          <Card className="h-full transition-shadow hover:shadow-warmMd">
            <CardContent className="p-5">
              <action.icon className="h-6 w-6 text-terracotta-600" />
              <h3 className="mt-3 font-display text-[22px] font-bold text-[#1A1A1A]">{action.title}</h3>
              <p className="mt-1 text-[14px] text-[#6B6560]">{action.description}</p>
            </CardContent>
          </Card>
        </button>
      ))}
    </section>
  )
}
