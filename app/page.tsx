import Link from 'next/link'
import { Armchair, Clock3, UtensilsCrossed } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-cream-100 px-4 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl rounded-[28px] bg-white p-6 shadow-warmSm md:p-12">
        <header className="mb-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta-50 text-terracotta-600">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <span className="font-display text-[26px] font-bold">Smart Canteen</span>
          </div>
          <Link href="/login">
            <Button variant="secondary">Login</Button>
          </Link>
        </header>

        <section className="mb-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">
              College Canteen Flow
            </p>
            <h1 className="font-display text-[42px] font-black leading-[1.06] text-[#1A1A1A] md:text-[52px]">
              Skip the queue.
              <br />
              Book your seat.
              <br />
              Order ahead.
            </h1>
            <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-[#6B6560]">
              Smart Canteen helps you reserve a table, pre-order food, and track preparation in real time so you
              never wait in rush-hour lines.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Explore Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-card bg-[#1A1A1A] p-7 text-white shadow-warmLg">
            <p className="text-[13px] text-[#A0A0A0]">Why students use Smart Canteen</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-500/20 text-terracotta-100">
                  <Armchair className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold">Live seat availability</p>
                  <p className="text-[13px] text-[#A0A0A0]">Find available tables instantly with the live canteen map.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-500/20 text-terracotta-100">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold">Pre-order your meal</p>
                  <p className="text-[13px] text-[#A0A0A0]">Customize dishes and pay in-app before reaching the counter.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-500/20 text-terracotta-100">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold">Track order progress</p>
                  <p className="text-[13px] text-[#A0A0A0]">Watch your order move from confirmed to ready in real time.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Live Seat Map',
              description: 'See occupied and available seats table-by-table with instant updates.'
            },
            {
              title: 'Pre-Order Food',
              description: 'Browse menu categories, customize items, and place orders before arrival.'
            },
            {
              title: 'Skip the Wait',
              description: 'Cut queue time by reserving seats and scheduling pickup with status tracking.'
            }
          ].map((feature) => (
            <article key={feature.title} className="rounded-card bg-cream-50 p-6">
              <h2 className="font-display text-[22px] font-bold">{feature.title}</h2>
              <p className="mt-3 text-[15px] text-[#6B6560]">{feature.description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
