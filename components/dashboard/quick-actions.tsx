import { Armchair, Coffee, PlusCircle, UtensilsCrossed } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

interface QuickActionsProps {
  onNewOrder: () => void
  onViewCanteen?: () => void
  onFullMenu: () => void
  onViewOrders?: () => void
  hasActiveOrders?: boolean
}

export function QuickActions({ onNewOrder, onFullMenu, onViewOrders, hasActiveOrders }: QuickActionsProps) {
  return (
    <section className="grid grid-cols-3 gap-2 lg:gap-3">
      {[
        {
          title: hasActiveOrders ? 'Order More' : 'New Order',
          description: hasActiveOrders ? 'Add to existing order.' : 'Reserve seat and order.',
          icon: hasActiveOrders ? Coffee : PlusCircle,
          onClick: onNewOrder
        },
        {
          title: 'Full Menu',
          description: 'Browse all items.',
          icon: UtensilsCrossed,
          onClick: onFullMenu
        },
        {
          title: 'My Orders',
          description: 'View order history.',
          icon: Armchair,
          onClick: onViewOrders || onNewOrder
        }
      ].map((action) => (
        <button key={action.title} type="button" onClick={action.onClick} className="focus-ring text-left">
          <Card className="h-full border border-cream-200 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-warmMd">
            <CardContent className="p-3 lg:p-5">
              <action.icon className="h-5 w-5 lg:h-6 lg:w-6 text-terracotta-600" />
              <h3 className="mt-1.5 lg:mt-3 font-display text-[14px] lg:text-[22px] font-bold text-[#1A1A1A]">{action.title}</h3>
              <p className="mt-0.5 lg:mt-1 text-[11px] lg:text-[14px] text-[#6B6560] hidden lg:block">{action.description}</p>
            </CardContent>
          </Card>
        </button>
      ))}
    </section>
  )
}
