import { AuthCard } from '@/components/auth/auth-card'

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-100 px-4 py-8">
      <div className="grid w-full max-w-5xl items-center gap-8 rounded-[28px] bg-white p-6 shadow-warmSm md:grid-cols-2 md:p-10">
        <section className="rounded-card bg-[#1A1A1A] p-8 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A0A0A0]">Get Started</p>
          <h1 className="mt-4 font-display text-[36px] font-bold leading-tight">Create your Smart Canteen account.</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#A0A0A0]">
            Join once and use the app to pre-order meals, lock seats, and avoid long canteen queues.
          </p>
        </section>
        <AuthCard type="signup" />
      </div>
    </main>
  )
}
