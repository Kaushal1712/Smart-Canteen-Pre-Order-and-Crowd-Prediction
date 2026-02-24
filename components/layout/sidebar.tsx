'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, UtensilsCrossed } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AUTH_PLACEHOLDER_MODE } from '@/lib/config'
import { NAV_LINKS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { cn } from '@/lib/utils/cn'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile } = useCurrentUser()

  async function handleLogout() {
    if (AUTH_PLACEHOLDER_MODE) {
      router.push('/login')
      router.refresh()
      return
    }

    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden min-h-screen w-[260px] flex-col bg-cream-50 px-5 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-3 px-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta-50 text-terracotta-600">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-[20px] font-bold text-[#1A1A1A]">Smart Canteen</p>
        </div>
      </div>

      <div className="mb-7 flex items-center gap-3 rounded-button bg-white px-3 py-3 shadow-warmSm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-200 text-[14px] font-semibold text-[#6B6560]">
          {profile?.name?.[0]?.toUpperCase() || 'S'}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-[#1A1A1A]">{profile?.name || 'Student'}</p>
          <p className="truncate text-[13px] text-[#6B6560]">Student</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 border-t border-cream-300 pt-5">
        {NAV_LINKS.map((link) => {
          const Icon = link.icon
          const active = pathname.startsWith(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'focus-ring relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors',
                active ? 'text-terracotta-600' : 'text-[#6B6560] hover:bg-cream-200 hover:text-[#1A1A1A]'
              )}
            >
              {active ? (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-terracotta-50"
                  transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                />
              ) : null}
              <span className="relative z-[1] flex items-center gap-3">
                <Icon className="h-[18px] w-[18px]" />
                {link.title}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-cream-300 pt-5">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start rounded-xl px-4 py-2.5 text-[13px] font-semibold"
          onClick={handleLogout}
        >
          <LogOut className="h-[18px] w-[18px]" />
          Log Out
        </Button>
      </div>
    </aside>
  )
}
