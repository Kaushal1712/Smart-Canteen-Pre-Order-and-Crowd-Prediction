'use client'

import { type ComponentType, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Circle, CreditCard, Landmark, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { PageTransition } from '@/components/shared/page-transition'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'
import { AUTH_PLACEHOLDER_MODE } from '@/lib/config'
import { PAYMENT_METHODS } from '@/lib/constants'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/stores/use-cart-store'
import { useOrderStore } from '@/lib/stores/use-order-store'
import { formatCurrency, getCartLineTotal } from '@/lib/utils/format'

const paymentIcons: Record<string, ComponentType<{ className?: string }>> = {
  upi: Landmark,
  card: CreditCard,
  cash: Circle
}

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { user } = useCurrentUser()

  const {
    items,
    diningMode,
    selectedSeat,
    activeBookingId,
    paymentMethod,
    setPaymentMethod,
    clearCart,
    getTotal,
    getEstimatedPrepTime,
    setActiveBooking
  } = useCartStore()
  const { createOrder } = useOrderStore()

  const [processing, setProcessing] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)

  const total = getTotal()
  const estimatedPrep = getEstimatedPrepTime()

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/menu')
      return
    }

    if (diningMode === 'dine-in' && !selectedSeat) {
      router.replace('/canteen')
    }
  }, [diningMode, items.length, router, selectedSeat])

  async function handleConfirmPay() {
    if (!user) {
      toast.error('Please login again to continue.')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty.')
      router.push('/menu')
      return
    }

    if (diningMode === 'dine-in' && (!selectedSeat || !activeBookingId)) {
      toast.error('Your seat hold expired. Please select a seat again.')
      router.push('/canteen')
      return
    }

    setProcessing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (AUTH_PLACEHOLDER_MODE) {
        const localOrder = createOrder({
          items,
          userId: user.id,
          diningMode: diningMode === 'dine-in' ? 'dine-in' : 'takeaway',
          paymentMethod,
          totalAmount: total,
          estimatedPrepMinutes: estimatedPrep,
          seatInfo: selectedSeat || null,
          seatBookingId: activeBookingId
        })

        if (diningMode === 'dine-in' && activeBookingId) {
          setActiveBooking(activeBookingId, new Date(Date.now() + 30 * 60_000).toISOString())
        } else {
          setActiveBooking(null)
        }

        setSuccessOrderId(localOrder.id)
        clearCart()

        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)

        return
      }

      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          seat_booking_id: diningMode === 'dine-in' ? activeBookingId : null,
          order_type: diningMode === 'dine-in' ? 'dine-in' : 'takeaway',
          status: 'confirmed',
          total_amount: total,
          estimated_prep_minutes: estimatedPrep,
          payment_method: paymentMethod
        })
        .select('*')
        .single()

      if (orderError || !orderRow) {
        throw orderError || new Error('Order creation failed')
      }

      const orderItemsPayload = items.map((item) => ({
        order_id: orderRow.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price_at_order: item.base_price,
        spice_level: item.spice_level,
        customizations: item.customizations,
        special_instructions: item.special_instructions
      }))

      const { error: orderItemsError } = await supabase.from('order_items').insert(orderItemsPayload)

      if (orderItemsError) {
        throw orderItemsError
      }

      if (diningMode === 'dine-in' && activeBookingId) {
        const { data: bookingResponse, error: bookingError } = await supabase.rpc(
          'confirm_order_and_occupy_seat',
          {
            p_booking_id: activeBookingId
          }
        )

        if (bookingError) {
          throw bookingError
        }

        const bookingStatus = bookingResponse as { success: boolean; error?: string }

        if (!bookingStatus?.success) {
          if (bookingStatus?.error?.toLowerCase().includes('expired')) {
            toast.error('Your seat hold expired. Please select a new seat.')
            router.push('/canteen')
            return
          }

          throw new Error(bookingStatus?.error || 'Seat confirmation failed')
        }
      }

      setSuccessOrderId(orderRow.id)
      clearCart()
      setActiveBooking(null)

      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed. Please try again.'
      toast.error(message)
    } finally {
      setProcessing(false)
    }
  }

  if (successOrderId) {
    return (
      <PageTransition>
        <section className="flex min-h-[70vh] items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-card bg-white p-8 text-center shadow-warmLg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage-50 text-sage-600"
            >
              <CheckCircle2 className="h-10 w-10" />
            </motion.div>
            <h1 className="font-display text-[32px] font-bold text-[#1A1A1A]">Order Confirmed!</h1>
            <p className="mt-2 text-[15px] text-[#6B6560]">Order ID: {successOrderId.slice(0, 8).toUpperCase()}</p>
            <p className="mt-1 text-[14px] text-[#9C9590]">Redirecting to dashboard...</p>
          </motion.div>
        </section>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <section className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Checkout</p>
          <h1 className="font-display text-[28px] font-bold text-[#1A1A1A]">Review & Pay</h1>
        </header>

        <article className="rounded-card bg-white p-5">
          <h2 className="font-display text-[22px] font-bold text-[#1A1A1A]">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-button bg-cream-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold text-[#1A1A1A]">{item.name}</p>
                    <p className="text-[13px] text-[#6B6560]">
                      Qty {item.quantity} · Spice {item.spice_level}
                    </p>
                    {item.customizations.length ? (
                      <p className="mt-1 text-[12px] text-[#9C9590]">
                        {item.customizations.map((customization) => customization.name).join(', ')}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-[15px] font-bold text-[#1A1A1A]">{formatCurrency(getCartLineTotal(item))}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-card bg-white p-5">
          <h2 className="font-display text-[22px] font-bold text-[#1A1A1A]">Dining Details</h2>
          <div className="mt-3 rounded-button bg-cream-50 p-3 text-[14px] text-[#6B6560]">
            {diningMode === 'dine-in' && selectedSeat
              ? `Dine-In — Table ${selectedSeat.table_number}, Seat ${selectedSeat.seat_number}`
              : 'Takeaway — Pick up at counter when ready'}
          </div>
          <div className="mt-2 text-[13px] text-[#6B6560]">Estimated prep time: ~{estimatedPrep} minutes</div>
        </article>

        <article className="rounded-card bg-white p-5">
          <h2 className="font-display text-[22px] font-bold text-[#1A1A1A]">Payment Method</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {PAYMENT_METHODS.map((method) => {
              const Icon = paymentIcons[method.value]
              const active = paymentMethod === method.value

              return (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value)}
                  className={`focus-ring rounded-card border p-4 text-left transition-all ${
                    active ? 'border-terracotta-500 bg-terracotta-50' : 'border-transparent bg-cream-50'
                  }`}
                >
                  <Icon className="h-5 w-5 text-[#6B6560]" />
                  <p className="mt-3 text-[14px] font-semibold text-[#1A1A1A]">{method.label}</p>
                  <p className="text-[12px] text-[#6B6560]">{method.subtitle}</p>
                </button>
              )
            })}
          </div>
        </article>

        <article className="rounded-card bg-[#1A1A1A] p-5 text-white">
          <div className="flex items-center justify-between">
            <p className="text-[14px] text-[#A0A0A0]">Total Payable</p>
            <p className="font-display text-[32px] font-bold">{formatCurrency(total)}</p>
          </div>
          <LoadingButton
            loading={processing}
            loadingText="Processing payment..."
            className="mt-4 w-full"
            onClick={handleConfirmPay}
          >
            Confirm & Pay
          </LoadingButton>
        </article>

        <AnimatePresence>
          {processing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/25"
            >
              <div className="rounded-card bg-white px-6 py-5 shadow-warmXl">
                <div className="flex items-center gap-3 text-[15px] font-semibold text-[#1A1A1A]">
                  <Loader2 className="h-5 w-5 animate-spin text-terracotta-600" />
                  Processing your payment...
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </PageTransition>
  )
}
