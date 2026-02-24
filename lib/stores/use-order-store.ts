'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { CartItem, DiningMode, OrderStatus, OrderWithItems, SelectedSeat } from '@/lib/types'

interface CreateOrderPayload {
  items: CartItem[]
  userId: string
  diningMode: DiningMode
  paymentMethod: string
  totalAmount: number
  estimatedPrepMinutes: number
  seatInfo: SelectedSeat | null
  seatBookingId: string | null
}

interface OrderStore {
  orders: OrderWithItems[]
  createOrder: (payload: CreateOrderPayload) => OrderWithItems
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  clearOrders: () => void
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],

      createOrder: (payload) => {
        const now = new Date().toISOString()
        const orderId = `demo-order-${Date.now()}`

        const order: OrderWithItems = {
          id: orderId,
          user_id: payload.userId,
          seat_booking_id: payload.seatBookingId,
          order_type: payload.diningMode,
          status: 'confirmed',
          total_amount: payload.totalAmount,
          estimated_prep_minutes: payload.estimatedPrepMinutes,
          payment_method: payload.paymentMethod,
          created_at: now,
          seat_table_number: payload.seatInfo?.table_number || null,
          seat_seat_number: payload.seatInfo?.seat_number || null,
          order_items: payload.items.map((item, index) => ({
            id: `${orderId}-item-${index + 1}`,
            order_id: orderId,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            price_at_order: item.base_price,
            spice_level: item.spice_level,
            customizations: item.customizations,
            special_instructions: item.special_instructions,
            menu_items: {
              id: item.menu_item_id,
              name: item.name,
              description: '',
              price: item.base_price,
              category: item.category,
              image_url: item.image_url,
              is_veg: item.is_veg,
              spice_level: item.spice_level,
              prep_time_minutes: item.prep_time_minutes,
              is_available: true,
              created_at: now
            }
          }))
        }

        set((state) => ({ orders: [order, ...state.orders] }))

        return order
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) => (order.id === orderId ? { ...order, status } : order))
        }))
      },

      clearOrders: () => set({ orders: [] })
    }),
    {
      name: 'smart-canteen-demo-orders',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
