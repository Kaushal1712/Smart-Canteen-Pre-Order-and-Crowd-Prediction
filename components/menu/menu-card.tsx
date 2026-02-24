import { Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MenuItemWithCustomizations } from '@/lib/types'
import { formatCurrency } from '@/lib/utils/format'

interface MenuCardProps {
  item: MenuItemWithCustomizations
  onAdd: (item: MenuItemWithCustomizations) => void
}

export function MenuCard({ item, onAdd }: MenuCardProps) {
  return (
    <article className="group overflow-hidden rounded-card bg-white shadow-warmSm transition-all hover:shadow-warmMd">
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} className="h-36 w-full object-cover" />
      ) : (
        <div className="flex h-36 w-full items-center justify-center bg-cream-200">
          <span className="text-[13px] font-semibold text-[#9C9590]">No image available</span>
        </div>
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[20px] font-bold text-[#1A1A1A]">{item.name}</h3>
          <span className="text-[16px] font-bold text-[#1A1A1A]">{formatCurrency(item.price)}</span>
        </div>

        <p className="line-clamp-2 text-[14px] text-[#6B6560]">{item.description || 'Freshly prepared for your order.'}</p>

        <div className="flex flex-wrap gap-2">
          <Badge variant={item.is_veg ? 'success' : 'danger'}>{item.is_veg ? 'Veg' : 'Non-Veg'}</Badge>
          <Badge variant="default">{item.prep_time_minutes} min</Badge>
          <Badge variant="primary">{item.category}</Badge>
        </div>

        <Button className="w-full" onClick={() => onAdd(item)}>
          <Plus className="h-4 w-4" />
          {item.menu_customizations?.length ? 'Customize & Add' : 'Add to Cart'}
        </Button>
      </div>
    </article>
  )
}
