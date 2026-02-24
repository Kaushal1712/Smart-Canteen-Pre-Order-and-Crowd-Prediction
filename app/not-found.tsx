import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-100 px-4">
      <section className="max-w-md rounded-card bg-white p-8 text-center shadow-warmSm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-[30px] font-bold text-[#1A1A1A]">Page not found</h1>
        <p className="mt-2 text-[15px] text-[#6B6560]">The page you are looking for does not exist.</p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button>Go to Dashboard</Button>
        </Link>
      </section>
    </main>
  )
}
