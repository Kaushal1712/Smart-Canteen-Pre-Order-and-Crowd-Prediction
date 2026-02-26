'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, UtensilsCrossed, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { AUTH_PLACEHOLDER_MODE } from '@/lib/config'
import { NAV_LINKS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { cn } from '@/lib/utils/cn'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile } = useCurrentUser()
  const [collapsed, setCollapsed] = useState(false)
  const [expandHint, setExpandHint] = useState(false)

  const isProfilePage = pathname.startsWith('/profile')
  const navLinks = NAV_LINKS.filter((link) => link.href !== '/profile')

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
    <aside
      className={cn(
        'hidden h-screen flex-shrink-0 flex-col bg-cream-50 py-6 transition-all duration-300 ease-in-out lg:flex',
        collapsed ? 'w-[64px] px-3' : 'w-[280px] px-5'
      )}
    >
      {/* Logo area */}
      <Link href="/dashboard" className="mb-8 flex items-center group">
        {/* Logo icon */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-terracotta-50 text-terracotta-600 transition-colors group-hover:bg-terracotta-100">
          <UtensilsCrossed className="h-5 w-5" />
        </div>

        {/* "Smart Canteen" label */}
        <span
          className={cn(
            'flex flex-1 items-center overflow-hidden whitespace-nowrap',
            collapsed ? 'max-w-0 opacity-0 ml-0 transition-all duration-200' : 'max-w-[220px] opacity-100 ml-3 transition-all duration-150 delay-[200ms]'
          )}
        >
          <span className="font-display text-[20px] font-bold text-[#1A1A1A] flex-1 group-hover:text-terracotta-600 transition-colors">
            Smart Canteen
          </span>
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col border-t border-cream-300 pt-5">
        <div className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                title={collapsed ? link.title : undefined}
                className={cn(
                  'focus-ring relative flex items-center gap-3 rounded-xl py-2.5 pr-4 text-[13px] font-semibold transition-all duration-300 ease-in-out',
                  collapsed ? 'pl-[11px]' : 'pl-4',
                  active ? 'text-terracotta-600' : 'text-[#6B6560] hover:bg-cream-200 hover:text-[#1A1A1A]'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-terracotta-50"
                    transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                  />
                )}
                <Icon className="relative z-[1] h-[18px] w-[18px] flex-shrink-0" />
                <span
                  className={cn(
                    'relative z-[1] overflow-hidden whitespace-nowrap',
                    collapsed ? 'max-w-0 opacity-0 transition-all duration-200' : 'max-w-[200px] opacity-100 transition-all duration-150 delay-[200ms]'
                  )}
                >
                  {link.title}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Invisible full-height area: expand when collapsed, collapse when expanded */}
        <button
          type="button"
          onClick={() => { setCollapsed(!collapsed); setExpandHint(false); }}
          onMouseEnter={() => collapsed && setExpandHint(true)}
          onMouseLeave={() => collapsed && setExpandHint(false)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn('flex flex-1', collapsed ? 'cursor-ew-resize' : 'cursor-w-resize')}
        />
      </nav>

      {/* Bottom: profile/logout + toggle */}
      <div className="border-t border-cream-300 pt-4 space-y-2">
        {/* Profile / Logout row */}
        <div
          className={cn(
            'flex items-center transition-all duration-300 ease-in-out',
            collapsed ? 'gap-0' : 'gap-3'
          )}
        >
          {isProfilePage ? (
            <button
              type="button"
              onClick={handleLogout}
              className={cn('flex items-center min-w-0', collapsed ? 'gap-0' : 'gap-3')}
            >
              <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-cream-200 text-[#6B6560] transition-transform duration-300", collapsed && 'translate-x-[2px]')}>
                <LogOut className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  'overflow-hidden whitespace-nowrap text-[14px] font-semibold text-[#1A1A1A]',
                  collapsed ? 'max-w-0 opacity-0 transition-all duration-200' : 'max-w-[140px] opacity-100 transition-all duration-150 delay-[200ms]'
                )}
              >
                Log Out
              </span>
            </button>
          ) : (
            <Link href="/profile" className={cn('flex items-center min-w-0', collapsed ? 'gap-0' : 'gap-3')}>
              <div className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-cream-200 text-[13px] font-semibold text-[#6B6560] transition-transform duration-300", collapsed && 'translate-x-[2px]')}>
                {profile?.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <div
                className={cn(
                  'min-w-0 overflow-hidden',
                  collapsed ? 'max-w-0 opacity-0 transition-all duration-200' : 'max-w-[140px] opacity-100 transition-all duration-150 delay-[200ms]'
                )}
              >
                <p className="truncate text-[14px] font-semibold text-[#1A1A1A]">
                  {profile?.name || 'Student'}
                </p>
                <p className="truncate text-[12px] text-[#6B6560]">Student</p>
              </div>
            </Link>
          )}

          {/* Collapse button — in-row, right-aligned (expanded only) */}
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className={cn(
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-warmSm text-[#9C9590] transition-all duration-300 ease-in-out hover:bg-cream-100 hover:text-[#1A1A1A]',
              collapsed ? 'hidden' : 'ml-auto opacity-100'
            )}
          >
            <ChevronsLeft className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Expand button — below avatar, centered (collapsed only) */}
        <div
          className={cn(
            'flex justify-center overflow-hidden transition-all duration-300 ease-in-out',
            collapsed ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <button
            type="button"
            onClick={() => { setCollapsed(false); setExpandHint(false); }}
            onMouseEnter={() => setExpandHint(true)}
            onMouseLeave={() => setExpandHint(false)}
            aria-label="Expand sidebar"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-warmSm transition-colors duration-300',
              expandHint ? 'bg-cream-200 text-[#1A1A1A]' : 'text-[#9C9590] hover:bg-cream-100 hover:text-[#1A1A1A]'
            )}
          >
            <ChevronsRight className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  )
}
