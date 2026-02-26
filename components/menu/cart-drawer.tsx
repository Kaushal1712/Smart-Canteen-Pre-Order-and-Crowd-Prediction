'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { useCartStore } from '@/lib/stores/use-cart-store'
import { formatCurrency, getCartLineTotal } from '@/lib/utils/format'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  onProceed: () => void
  occupancyPercent: number
}

export function CartDrawer({ open, onClose, onProceed, occupancyPercent }: CartDrawerProps) {
  const { items, removeItem, updateItemQuantity, getItemCount, getTotal, getEstimatedPrepTime } = useCartStore()

  const itemCount = getItemCount()
  const total = getTotal()
  const estimatedPrep = getEstimatedPrepTime(occupancyPercent)

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[90vh] flex-col rounded-t-[24px] bg-white p-5 shadow-warmXl md:inset-y-0 md:right-0 md:left-auto md:max-h-screen md:w-[420px] md:rounded-none md:p-6"
            initial={{ x: 90, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 70, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Your Cart</p>
                <h3 className="font-display text-[24px] font-bold text-[#1A1A1A]">{itemCount} items</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-[#6B6560]"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            {items.length === 0 ? (
              <EmptyState title="Your cart is empty" description="Browse the menu and add items to continue." icon={Trash2} />
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-1 py-1">
                  {items.map((item) => (
                    <article key={item.id} className="rounded-button bg-white p-3 shadow-[0_2px_6px_rgba(0,0,0,0.08)] ring-1 ring-cream-200/60">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold text-[#1A1A1A]">{item.name}</p>
                          <p className="mt-1 text-[13px] text-[#6B6560]">{formatCurrency(getCartLineTotal(item))}</p>
                          {item.customizations.length ? (
                            <p className="mt-1 line-clamp-2 text-[12px] text-[#9C9590]">
                              {item.customizations.map((customization) => customization.name).join(', ')}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="focus-ring rounded-lg p-2 text-[#9C9590] hover:bg-danger-50 hover:text-danger-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => updateItemQuantity(item.id, Math.max(0, item.quantity - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-[14px] font-semibold text-[#1A1A1A]">{item.quantity}</span>
                        <Button variant="secondary" size="icon" onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-5 space-y-4 border-t border-cream-300 pt-4">
                  <div className="flex items-center justify-between text-[14px] text-[#6B6560]">
                    <span>Estimated prep time</span>
                    <span className="font-semibold text-[#1A1A1A]">~{estimatedPrep} min</span>
                  </div>
                  <div className="flex items-center justify-between text-[18px] font-bold text-[#1A1A1A]">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>

                  <div className="grid gap-2">
                    <Button onClick={onProceed}>Proceed to Payment</Button>
                    <Button variant="secondary" onClick={onClose}>
                      Continue Browsing
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
