'use client'

import { Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/stores/use-cart-store'
import type { MenuItemWithCustomizations } from '@/lib/types'
import { formatCurrency } from '@/lib/utils/format'

interface MenuCardProps {
  item: MenuItemWithCustomizations
  onAdd: (item: MenuItemWithCustomizations) => void
}

export function MenuCard({ item, onAdd }: MenuCardProps) {
  const vegColor = item.is_veg ? '#138808' : '#8B0000'

  // Primitives only — returning a new array/object every render causes an infinite loop
  const cartCount = useCartStore((s) =>
    s.items.filter((i) => i.menu_item_id === item.id).reduce((sum, i) => sum + i.quantity, 0)
  )
  const firstEntryId = useCartStore((s) => s.items.find((i) => i.menu_item_id === item.id)?.id ?? null)
  const firstEntryQty = useCartStore((s) => s.items.find((i) => i.menu_item_id === item.id)?.quantity ?? 0)
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity)

  function handleDecrement() {
    if (!firstEntryId) return
    updateItemQuantity(firstEntryId, firstEntryQty - 1)
  }

  return (
    <article className="group">
      {/* ── Mobile: Zomato-style horizontal layout ── */}
      <div className="flex items-start gap-4 py-5 sm:hidden">
        {/* Left: text content */}
        <div className="flex min-w-0 flex-1 flex-col justify-start">
          {/* FSSAI veg/non-veg indicator */}
          <div
            className="mb-1.5 flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[3px]"
            style={{ border: `1.5px solid ${vegColor}` }}
          >
            <div className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: vegColor }} />
          </div>

          <h3 className="line-clamp-2 text-[17px] font-bold leading-[1.3] tracking-tight text-[#1C1C1C]">
            {item.name}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[15px] font-bold text-[#1C1C1C]">{formatCurrency(item.price)}</span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <div className="rounded-[4px] bg-[#F4F4F5] px-1.5 py-[3px] text-[11px] font-bold tracking-wide text-[#5F5F63]">
              {item.prep_time_minutes} MINS
            </div>
            <div className="rounded-[4px] bg-[#F4F4F5] px-1.5 py-[3px] text-[11px] font-bold tracking-wide text-[#5F5F63]">
              {item.category.toUpperCase()}
            </div>
          </div>

          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-[#5F5F63] min-h-[38px]">
            {item.description || 'Freshly prepared. A delicious and wholesome choice for your meal.'}
          </p>
        </div>

        {/* Right: image with ADD/counter button */}
        <div className="relative flex shrink-0 flex-col items-center">
          <div className="relative h-[120px] w-[120px] overflow-hidden rounded-[16px] bg-[#F4F4F5]">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-cream-100">
                <span className="px-2 text-center text-[12px] font-medium text-[#9C9590]">No image</span>
              </div>
            )}
            {/* Subtle inner overlay on the bottom part of the image to ensure the button pops nicely */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent"></div>
          </div>

          <div className="absolute -bottom-3 w-[100px] z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
            {cartCount > 0 ? (
              <div className="flex h-[38px] w-full items-center justify-between rounded-xl bg-terracotta-500 font-bold">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="flex h-full w-[30px] items-center justify-center pl-2 text-[20px] text-white transition-transform active:scale-90"
                >
                  −
                </button>
                <span className="text-[15px] text-white">{cartCount}</span>
                <button
                  type="button"
                  onClick={() => onAdd(item)}
                  className="flex h-full w-[30px] items-center justify-center pr-2 text-[20px] text-white transition-transform active:scale-90"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onAdd(item)}
                className="relative flex h-[38px] w-full items-center justify-center rounded-xl bg-white text-[16px] font-black text-terracotta-600 ring-1 ring-[#e2e2e2] transition-transform active:scale-95"
              >
                ADD
                <sup className="absolute right-[8px] top-[6px] text-[12px] font-extrabold">+</sup>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop: original vertical card layout (unchanged) ── */}
      <div className="hidden h-full flex-col overflow-hidden rounded-card bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] sm:flex">
        <div className="relative aspect-[5/4] w-full overflow-hidden bg-cream-200">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-[13px] font-semibold text-[#9C9590]">No image available</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-display text-[20px] font-bold leading-tight text-[#1A1A1A]">{item.name}</h3>
            <span className="shrink-0 text-[16px] font-bold text-[#1A1A1A]">{formatCurrency(item.price)}</span>
          </div>

          <p className="mt-2 line-clamp-2 flex-1 text-[14px] text-[#6B6560]">{item.description || 'Freshly prepared for your order.'}</p>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={item.is_veg ? 'success' : 'danger'}>{item.is_veg ? 'Veg' : 'Non-Veg'}</Badge>
              <Badge variant="default">{item.prep_time_minutes} min</Badge>
              <Badge variant="primary">{item.category}</Badge>
            </div>

            <Button className="w-full shrink-0" onClick={() => onAdd(item)}>
              <Plus className="h-4 w-4" />
              {item.menu_customizations?.length ? 'Customize & Add' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
