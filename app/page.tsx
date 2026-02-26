import Link from 'next/link'
import { Armchair, Clock3, UtensilsCrossed, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="flex h-[100dvh] flex-col bg-cream-50 px-6 py-4 md:px-10 md:py-5 lg:px-16 lg:py-6 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cream-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-terracotta-50/50 blur-3xl pointer-events-none" />

      <header className="relative z-10 flex flex-none items-center justify-between mb-6 md:mb-8 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-terracotta-50 text-terracotta-600 shadow-sm">
            <UtensilsCrossed className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <span className="font-display text-[20px] md:text-[24px] font-bold tracking-tight text-[#1A1A1A]">Smart Canteen</span>
        </div>
        <Link href="/login">
          <Button variant="secondary" className="rounded-full px-5 md:px-6 h-10 font-medium bg-cream-100 hover:bg-cream-200 text-[#1A1A1A]">
            Log in
          </Button>
        </Link>
      </header>

      <section className="relative z-10 flex-1 grid grid-rows-[1fr_auto] lg:grid-cols-[1.3fr_1fr] lg:grid-rows-1 gap-8 md:gap-10 lg:gap-12 items-center min-h-0 max-w-6xl w-full mx-auto">
        <div className="flex flex-col justify-center max-lg:order-1 overflow-y-auto pr-2 pb-4 lg:pb-0">
          <div className="inline-flex max-w-fit items-center gap-2 rounded-full border border-cream-200 bg-white px-3 py-1 mb-4 md:mb-6 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-terracotta-500 animate-pulse" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6B6560]">
              Live on campus
            </p>
          </div>
          
          <h1 className="font-display text-[38px] sm:text-[46px] md:text-[54px] lg:text-[60px] font-black leading-[1.05] tracking-tight text-[#1A1A1A]">
            Skip the queue.
            <br />
            <span className="text-[#6B6560]">Book your seat.</span>
            <br />
            Order ahead.
          </h1>
          
          <p className="mt-4 md:mt-6 max-w-xl text-[16px] md:text-[18px] leading-[1.5] text-[#6B6560]">
            The smartest way to experience your college canteen. Reserve a table, pre-order your favorite meals, and track preparation.
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-8 h-12 md:h-14 text-[15px] font-medium shadow-warmSm hover:shadow-md transition-shadow">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 md:h-14 text-[15px] font-medium border-cream-200 hover:bg-cream-50">
                Explore Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] bg-[#1A1A1A] p-6 max-md:hidden md:p-8 shadow-warmLg h-full max-h-[460px] flex flex-col justify-center max-lg:order-2 overflow-y-auto">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#A0A0A0] mb-6">
            Why students use it
          </h3>
          <div className="space-y-6 md:space-y-7">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Armchair className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-white mb-1">Live seat availability</h4>
                <p className="text-[13px] leading-relaxed text-[#A0A0A0]">Find available tables instantly with the interactive campus map.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-white mb-1">Pre-order your meal</h4>
                <p className="text-[13px] leading-relaxed text-[#A0A0A0]">Customize dishes and pay in-app before you reach the counter.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-white mb-1">Track order progress</h4>
                <p className="text-[13px] leading-relaxed text-[#A0A0A0]">Watch your order move perfectly in real time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

