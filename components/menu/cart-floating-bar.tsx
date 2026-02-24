'use client'

import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/stores/use-cart-store'
import { formatCurrency } from '@/lib/utils/format'

interface CartFloatingBarProps {
  onOpen: () => void
}

export function CartFloatingBar({ onOpen }: CartFloatingBarProps) {
  const { getItemCount, getTotal } = useCartStore()
  const itemCount = getItemCount()
  const total = getTotal()

  if (itemCount === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-[78px] left-4 right-4 z-40 rounded-card bg-[#1A1A1A] px-4 py-3 text-white shadow-warmLg md:bottom-6 md:left-auto md:right-6 md:w-[420px]"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] uppercase tracking-[0.08em] text-[#A0A0A0]">Cart</p>
          <p className="text-[15px] font-semibold">
            {itemCount} items · {formatCurrency(total)}
          </p>
        </div>
        <Button onClick={onOpen} className="h-10 px-4">
          <ShoppingCart className="h-4 w-4" />
          View Cart
        </Button>
      </div>
    </motion.div>
  )
}
