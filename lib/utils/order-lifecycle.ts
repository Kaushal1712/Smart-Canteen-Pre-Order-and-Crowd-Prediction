import type { OrderStatus } from '@/lib/types'

export function getAutoStatus(estimatedPrepMinutes: number, createdAt: string): OrderStatus {
  const created = new Date(createdAt).getTime()
  const elapsedMs = Date.now() - created
  const oneMinuteMs = 60_000
  const prepMs = estimatedPrepMinutes * oneMinuteMs
  const readyAt = oneMinuteMs + prepMs
  const pickedUpAt = readyAt + 5 * oneMinuteMs

  if (elapsedMs < oneMinuteMs) {
    return 'confirmed'
  }

  if (elapsedMs < readyAt) {
    return 'preparing'
  }

  if (elapsedMs < pickedUpAt) {
    return 'ready'
  }

  return 'picked_up'
}

export function getRemainingPrepMinutes(estimatedPrepMinutes: number, createdAt: string): number {
  const created = new Date(createdAt).getTime()
  const elapsedMs = Date.now() - created
  const totalMs = estimatedPrepMinutes * 60_000

  return Math.max(0, Math.ceil((totalMs - elapsedMs) / 60_000))
}
