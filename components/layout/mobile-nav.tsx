'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CircleUser, Home, Receipt, ShoppingCart, UtensilsCrossed } from 'lucide-react'

import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { cn } from '@/lib/utils/cn'

const MOBILE_LINKS = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home
  },
  {
    label: 'Canteen',
    href: '/canteen',
    icon: ShoppingCart
  },
  {
    label: 'Menu',
    href: '/menu',
    icon: UtensilsCrossed
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: Receipt
  }
]

export function MobileTopBar() {
  const router = useRouter()
  const { profile } = useCurrentUser()

  function goProfile() {
    router.push('/profile')
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-white px-4 shadow-warmSm lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta-50 text-terracotta-600">
          <UtensilsCrossed className="h-4 w-4" />
        </div>
        <span className="font-display text-[18px] font-bold text-[#1A1A1A]">Smart Canteen</span>
      </Link>
      <button
        type="button"
        onClick={goProfile}
        className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-[#6B6560]"
      >
        {profile?.name?.[0]?.toUpperCase() || <CircleUser className="h-5 w-5" />}
      </button>
    </header>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-cream-300 bg-white px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 shadow-warmLg lg:hidden">
      <ul className="grid grid-cols-4 gap-1">
        {MOBILE_LINKS.map((link) => {
          const Icon = link.icon
          const active = pathname.startsWith(link.href)

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'focus-ring flex h-12 flex-col items-center justify-center rounded-xl text-[11px] font-semibold',
                  active ? 'text-terracotta-600' : 'text-[#9C9590]'
                )}
              >
                <Icon className="mb-1 h-[18px] w-[18px]" />
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
