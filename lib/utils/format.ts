import type { CartItem, OrderStatus } from '@/lib/types'

export function formatCurrency(value: number): string {
  return `₹${Math.round(value)}`
}

export function formatOrderStatus(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    picked_up: 'Picked Up',
    cancelled: 'Cancelled'
  }

  return labels[status]
}

export function getElapsedMinutes(createdAt: string): number {
  const now = Date.now()
  const created = new Date(createdAt).getTime()
  const deltaMs = now - created

  return Math.max(0, Math.floor(deltaMs / (1000 * 60)))
}

export function getOrderProgress(estimatedMinutes: number, createdAt: string, status: OrderStatus): number {
  if (status === 'ready' || status === 'picked_up') {
    return 100
  }

  if (status === 'cancelled') {
    return 0
  }

  const elapsed = getElapsedMinutes(createdAt)
  const total = Math.max(1, estimatedMinutes)

  return Math.min(100, Math.round((elapsed / total) * 100))
}

export function getCustomizationTotal(customizations: CartItem['customizations']): number {
  return customizations.reduce((sum, customization) => sum + (customization.price_addon || 0), 0)
}

export function getCartLineTotal(item: CartItem): number {
  return (item.base_price + getCustomizationTotal(item.customizations)) * item.quantity
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getCartLineTotal(item), 0)
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function getEstimatedPrepMinutes(items: CartItem[], occupancyPercent = 0): number {
  if (items.length === 0) {
    return 0
  }

  const maxPrep = Math.max(...items.map((item) => item.prep_time_minutes || 0))
  const itemBuffer = new Set(items.map((item) => item.menu_item_id)).size * 2
  const occupancyBuffer = occupancyPercent > 60 ? Math.ceil((maxPrep + itemBuffer) * 0.2) : 0

  return maxPrep + itemBuffer + occupancyBuffer
}
