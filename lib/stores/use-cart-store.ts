'use client'

import { create } from 'zustand'

import type { CartItem, DiningMode, SelectedSeat, SpiceLevel } from '@/lib/types'
import { getCartItemCount, getCartTotal, getEstimatedPrepMinutes } from '@/lib/utils/format'

interface AddCartItemPayload {
  menu_item_id: string
  name: string
  base_price: number
  quantity: number
  spice_level: SpiceLevel
  customizations: CartItem['customizations']
  special_instructions: string
  prep_time_minutes: number
  image_url: string
  category: string
  is_veg: boolean
}

interface CartStore {
  items: CartItem[]
  diningMode: DiningMode | null
  selectedSeat: SelectedSeat | null
  activeBookingId: string | null
  holdExpiresAt: string | null
  paymentMethod: string
  setDiningMode: (mode: DiningMode) => void
  setSelectedSeat: (seat: SelectedSeat | null) => void
  setActiveBooking: (bookingId: string | null, expiresAt?: string | null) => void
  setPaymentMethod: (method: string) => void
  clearSeatState: () => void
  addItem: (payload: AddCartItemPayload) => void
  removeItem: (itemId: string) => void
  updateItemQuantity: (itemId: string, quantity: number) => void
  updateSpecialInstructions: (itemId: string, instructions: string) => void
  clearCart: () => void
  getItemCount: () => number
  getTotal: () => number
  getEstimatedPrepTime: (occupancyPercent?: number) => number
}

function buildCartItemId(payload: AddCartItemPayload): string {
  const customizationKey = payload.customizations
    .map((customization) => customization.id)
    .sort()
    .join('-')

  return `${payload.menu_item_id}-${payload.spice_level}-${customizationKey}-${payload.special_instructions.trim()}`
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  diningMode: null,
  selectedSeat: null,
  activeBookingId: null,
  holdExpiresAt: null,
  paymentMethod: 'upi',

  setDiningMode: (mode) => set({ diningMode: mode }),

  setSelectedSeat: (seat) => set({ selectedSeat: seat }),

  setActiveBooking: (bookingId, expiresAt = null) =>
    set({ activeBookingId: bookingId, holdExpiresAt: expiresAt || null }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  clearSeatState: () =>
    set({
      selectedSeat: null,
      activeBookingId: null,
      holdExpiresAt: null,
      diningMode: null
    }),

  addItem: (payload) => {
    const itemId = buildCartItemId(payload)

    set((state) => {
      const existing = state.items.find((item) => item.id === itemId)

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + payload.quantity } : item
          )
        }
      }

      const newItem: CartItem = {
        id: itemId,
        menu_item_id: payload.menu_item_id,
        name: payload.name,
        base_price: payload.base_price,
        quantity: payload.quantity,
        spice_level: payload.spice_level,
        customizations: payload.customizations,
        special_instructions: payload.special_instructions,
        prep_time_minutes: payload.prep_time_minutes,
        image_url: payload.image_url,
        category: payload.category,
        is_veg: payload.is_veg
      }

      return {
        items: [...state.items, newItem]
      }
    })
  },

  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId)
    })),

  updateItemQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      set((state) => ({
        items: state.items.filter((item) => item.id !== itemId)
      }))
      return
    }

    set((state) => ({
      items: state.items.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    }))
  },

  updateSpecialInstructions: (itemId, instructions) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, special_instructions: instructions } : item
      )
    })),

  clearCart: () => set({ items: [] }),

  getItemCount: () => getCartItemCount(get().items),

  getTotal: () => getCartTotal(get().items),

  getEstimatedPrepTime: (occupancyPercent = 0) => getEstimatedPrepMinutes(get().items, occupancyPercent)
}))
