import Link from 'next/link'
import { UtensilsCrossed, CheckCircle2 } from 'lucide-react'
import { AuthCard } from '@/components/auth/auth-card'

export default function LoginPage() {
  return (
    <main className="flex h-[100dvh] flex-col bg-cream-50 px-6 py-4 md:px-10 md:py-5 lg:px-16 lg:py-6 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cream-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-terracotta-50/50 blur-3xl pointer-events-none" />

      <header className="relative z-10 flex flex-none items-center mb-6 md:mb-8 max-w-6xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-terracotta-50 text-terracotta-600 shadow-sm">
            <UtensilsCrossed className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <span className="font-display text-[20px] md:text-[24px] font-bold tracking-tight text-[#1A1A1A]">Smart Canteen</span>
        </Link>
      </header>

      <section className="relative z-10 flex-1 grid grid-rows-[1fr_auto] lg:grid-cols-[1.3fr_1fr] lg:grid-rows-1 gap-8 md:gap-10 lg:gap-12 items-center min-h-0 max-w-6xl w-full mx-auto">
        <div className="flex flex-col justify-center items-center h-full max-lg:order-1 overflow-y-auto w-full">
          <div className="w-full max-w-[480px]">
            <AuthCard type="login" />
          </div>
        </div>

        <div className="rounded-[28px] bg-[#1A1A1A] p-6 max-md:hidden md:p-8 shadow-warmLg h-full max-h-[460px] flex flex-col justify-center max-lg:order-2 overflow-y-auto">
          <div className="mb-6">
            <h1 className="font-display text-[32px] font-bold leading-tight text-white">Your canteen seat, automatically ready.</h1>
            <p className="mt-4 text-[15px] leading-relaxed text-[#A0A0A0]">
               Login to view your dashboard, check active orders, and reorder your favorites.
            </p>
          </div>
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <CheckCircle2 className="h-5 w-5 text-terracotta-500" />
               <span className="text-[14px] font-medium text-white">Fast checkout</span>
             </div>
             <div className="flex items-center gap-3">
               <CheckCircle2 className="h-5 w-5 text-terracotta-500" />
               <span className="text-[14px] font-medium text-white">Reserve entire tables</span>
             </div>
             <div className="flex items-center gap-3">
               <CheckCircle2 className="h-5 w-5 text-terracotta-500" />
               <span className="text-[14px] font-medium text-white">Save your seat instantly</span>
             </div>
          </div>
        </div>
      </section>
    </main>
  )
}
