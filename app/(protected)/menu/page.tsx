'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Search, ShoppingBag, ShoppingCart, UtensilsCrossed } from 'lucide-react'
import { toast } from 'sonner'

import { CartDrawer } from '@/components/menu/cart-drawer'
import { CartFloatingBar } from '@/components/menu/cart-floating-bar'
import { CustomizationModal } from '@/components/menu/customization-modal'
import { MenuCard } from '@/components/menu/menu-card'
import { PageTransition } from '@/components/shared/page-transition'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AUTH_PLACEHOLDER_MODE } from '@/lib/config'
import { appCache } from '@/lib/cache'

const MENU_CACHE_KEY = 'menu:items'
import { DEMO_MENU_ITEMS, DEMO_OCCUPIED_BOOKINGS, DEMO_SEATS } from '@/lib/demo-data'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/stores/use-cart-store'
import type { MenuItemWithCustomizations } from '@/lib/types'
import { formatCurrency } from '@/lib/utils/format'

export default function MenuPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { user } = useCurrentUser()

  const {
    diningMode,
    selectedSeat,
    addItem,
    setDiningMode,
    getItemCount,
    getTotal,
    getEstimatedPrepTime,
    setSelectedSeat,
    setActiveBooking
  } = useCartStore()

  const [menuItems, setMenuItems] = useState<MenuItemWithCustomizations[]>(
    () => appCache.get<MenuItemWithCustomizations[]>(MENU_CACHE_KEY) ?? []
  )
  const [loading, setLoading] = useState(
    () => AUTH_PLACEHOLDER_MODE || !appCache.get(MENU_CACHE_KEY)
  )
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<MenuItemWithCustomizations | null>(null)
  const [occupancyPercent, setOccupancyPercent] = useState(0)

  async function fetchOccupancy() {
    const [{ count: seatCount }, { count: bookingCount }] = await Promise.all([
      supabase.from('seats').select('*', { count: 'exact', head: true }),
      supabase.from('seat_bookings').select('*', { count: 'exact', head: true }).in('status', ['held', 'occupied'])
    ])
    const total = seatCount || 0
    const occupied = bookingCount || 0
    setOccupancyPercent(total > 0 ? Math.round((occupied / total) * 100) : 0)
  }

  async function fetchMenu() {
    if (AUTH_PLACEHOLDER_MODE) {
      setLoading(true)
      setMenuItems(DEMO_MENU_ITEMS)
      const total = DEMO_SEATS.length
      const occupied = DEMO_OCCUPIED_BOOKINGS.length
      setOccupancyPercent(total > 0 ? Math.round((occupied / total) * 100) : 0)
      setLoading(false)
      return
    }

    const cached = appCache.get<MenuItemWithCustomizations[]>(MENU_CACHE_KEY)
    if (cached) {
      // Menu is already showing from cache — just refresh occupancy (2 cheap COUNT queries)
      void fetchOccupancy()
      return
    }

    setLoading(true)

    const [{ data: menuData, error: menuError }, { count: seatCount }, { count: bookingCount }] = await Promise.all([
      supabase
        .from('menu_items')
        .select('*, menu_customizations(*)')
        .eq('is_available', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true }),
      supabase.from('seats').select('*', { count: 'exact', head: true }),
      supabase.from('seat_bookings').select('*', { count: 'exact', head: true }).in('status', ['held', 'occupied'])
    ])

    if (menuError) {
      toast.error('Unable to load menu right now.')
      setLoading(false)
      return
    }

    const items = (menuData || []) as MenuItemWithCustomizations[]
    appCache.set(MENU_CACHE_KEY, items)
    setMenuItems(items)

    const total = seatCount || 0
    const occupied = bookingCount || 0
    setOccupancyPercent(total > 0 ? Math.round((occupied / total) * 100) : 0)

    setLoading(false)
  }

  useEffect(() => {
    document.title = 'Menu | Smart Canteen'
  }, [])

  useEffect(() => {
    void fetchMenu()
  }, [supabase])

  const categories = useMemo(() => {
    const values = Array.from(new Set(menuItems.map((item) => item.category))).sort()
    return ['All', ...values]
  }, [menuItems])

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const categoryMatch = category === 'All' || item.category === category
      const searchMatch = item.name.toLowerCase().includes(search.toLowerCase())
      const dietMatch =
        dietFilter === 'all' || (dietFilter === 'veg' ? item.is_veg : !item.is_veg)

      return categoryMatch && searchMatch && dietMatch
    })
  }, [category, dietFilter, menuItems, search])

  function handleQuickAdd(item: MenuItemWithCustomizations) {
    if (!diningMode && !selectedSeat) {
      toast.error('Select dine-in or takeaway before adding items.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (item.menu_customizations?.length) {
      setActiveItem(item)
      setModalOpen(true)
      return
    }

    addItem({
      menu_item_id: item.id,
      name: item.name,
      base_price: item.price,
      quantity: 1,
      spice_level: item.spice_level,
      customizations: [],
      special_instructions: '',
      prep_time_minutes: item.prep_time_minutes,
      image_url: item.image_url,
      category: item.category,
      is_veg: item.is_veg
    })

    toast.success(`${item.name} added to cart`)
  }

  function handleAddWithCustomization(payload: {
    item: MenuItemWithCustomizations
    quantity: number
    spiceLevel: 'mild' | 'medium' | 'spicy'
    customizations: { id: string; name: string; price_addon: number; group_name?: string | null; type?: 'checkbox' | 'radio' }[]
    instructions: string
  }) {
    addItem({
      menu_item_id: payload.item.id,
      name: payload.item.name,
      base_price: payload.item.price,
      quantity: payload.quantity,
      spice_level: payload.spiceLevel,
      customizations: payload.customizations,
      special_instructions: payload.instructions,
      prep_time_minutes: payload.item.prep_time_minutes,
      image_url: payload.item.image_url,
      category: payload.item.category,
      is_veg: payload.item.is_veg
    })

    toast.success(`${payload.item.name} added to cart`)
    setModalOpen(false)
    setActiveItem(null)
  }

  function proceedToCheckout() {
    if (!diningMode && !selectedSeat) {
      toast.error('Choose dine-in or takeaway before checkout.')
      return
    }

    if (diningMode === 'dine-in' && !selectedSeat) {
      toast.error('Select your seat first.')
      router.push('/canteen')
      return
    }

    if (!diningMode && selectedSeat) {
      setDiningMode('dine-in')
    }

    router.push('/checkout')
  }

  return (
    <PageTransition>
      <div id="menu-page-top" className="flex flex-col gap-6 lg:gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Menu & Ordering</p>
            <h1 className="font-display text-[28px] font-bold text-[#1A1A1A]">Choose Your Meal</h1>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="hidden lg:flex items-center gap-3 rounded-[20px] bg-[#1A1A1A] pl-3 pr-4 py-3 text-left text-white shadow-warmMd active:bg-[#2A2A2A]"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
              <ShoppingCart className="h-5 w-5" />
              {getItemCount() > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta-500 text-[10px] font-bold">
                  {getItemCount()}
                </span>
              ) : null}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-[#A0A0A0]">Your Cart</p>
              <p className="mt-0.5 text-[15px] font-semibold tracking-tight">
                {formatCurrency(getTotal())}
              </p>
            </div>
          </button>
        </header>

        {!diningMode && !selectedSeat ? (
          <div className="mb-4 flex flex-col justify-between gap-4 rounded-[16px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-cream-200/80 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-50 text-terracotta-600">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-[16px] font-bold text-[#1A1A1A]">Dining Preference</h2>
                <p className="text-[13px] text-[#6B6560]">Select how you'd like your order.</p>
              </div>
            </div>
            
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 border-cream-200 bg-cream-50 hover:bg-cream-100 sm:flex-none"
                onClick={() => router.push('/canteen')}
              >
                <MapPin className="mr-2 h-4 w-4 text-terracotta-600" />
                Dine In
              </Button>
              <Button
                className="flex-1 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] sm:flex-none"
                onClick={async () => {
                  if (!AUTH_PLACEHOLDER_MODE && selectedSeat && user) {
                    await supabase.rpc('release_seat', { p_user_id: user.id })
                  }
                  setDiningMode('takeaway')
                  setSelectedSeat(null)
                  setActiveBooking(null)
                  toast.success('Takeaway mode selected')
                }}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Takeaway
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={`focus-ring rounded-chip px-4 py-2 text-[13px] font-semibold ${
                category === value
                  ? 'bg-terracotta-50 text-terracotta-600'
                  : 'bg-cream-200 text-[#6B6560] hover:bg-cream-300'
              }`}
            >
              {value}
            </button>
          ))}

          <div className="h-6 w-[1px] bg-cream-300 mx-1 hidden sm:block" />

          {[
            { value: 'all', label: 'All' },
            { value: 'veg', label: 'Veg' },
            { value: 'non-veg', label: 'Non-Veg' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDietFilter(option.value as 'all' | 'veg' | 'non-veg')}
              className={`focus-ring rounded-chip px-4 py-2 text-[13px] font-semibold ${
                dietFilter === option.value
                  ? 'bg-terracotta-50 text-terracotta-600'
                  : 'bg-cream-200 text-[#6B6560] hover:bg-cream-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9C9590]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search menu items"
            className="rounded-chip pl-10"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 divide-y divide-cream-200 sm:divide-y-0 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                {/* Mobile skeleton */}
                <div className="flex gap-4 py-5 sm:hidden">
                  <div className="flex min-w-0 flex-1 flex-col justify-start">
                    <Skeleton className="mb-1.5 h-[16px] w-[16px] rounded-[3px]" />
                    <Skeleton className="h-[20px] w-3/4" />
                    <Skeleton className="mt-2 h-[18px] w-16" />
                    <div className="mt-2.5 flex gap-1.5">
                       <Skeleton className="h-[18px] w-[50px] rounded-[4px]" />
                       <Skeleton className="h-[18px] w-[60px] rounded-[4px]" />
                    </div>
                    <Skeleton className="mt-3 h-[14px] w-full" />
                    <Skeleton className="mt-1 h-[14px] w-3/4" />
                  </div>
                  <div className="relative flex shrink-0 flex-col items-center">
                     <Skeleton className="h-[120px] w-[120px] rounded-[16px]" />
                     <Skeleton className="absolute -bottom-3 h-[38px] w-[100px] rounded-xl" />
                  </div>
                </div>
                {/* Desktop skeleton */}
                <div className="hidden h-full flex-col overflow-hidden rounded-card bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)] sm:flex">
                  <Skeleton className="aspect-[5/4] w-full rounded-none" />
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                    <div className="mt-2 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                    <div className="mt-4 flex flex-col gap-3">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No menu items found"
            description="Try changing category, search text, or dietary filter."
          />
        ) : (
          <div className="grid grid-cols-1 divide-y divide-cream-200 sm:divide-y-0 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={handleQuickAdd} />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 rounded-card bg-cream-50 p-4">
          <Badge variant="info">Estimated prep: ~{getEstimatedPrepTime(occupancyPercent)} min</Badge>
          <Badge variant="default">Occupancy impact: {occupancyPercent}%</Badge>
          
          <div className={`flex items-center gap-2 rounded-full bg-white pl-1 py-1 ring-1 ring-cream-200 ${diningMode ? 'pr-3' : 'pr-1'}`}>
            <Badge variant="primary" className="m-0">Mode: {diningMode || 'not selected'}</Badge>
            {diningMode ? (
              <button
                type="button"
                onClick={async () => {
                  if (!AUTH_PLACEHOLDER_MODE && selectedSeat && user) {
                    await supabase.rpc('release_seat', { p_user_id: user.id })
                  }
                  setDiningMode(null)
                  setSelectedSeat(null)
                  setActiveBooking(null)
                  setTimeout(() => {
                    // The actual scrollable container is the `main` element in the layout
                    const scrollContainer = document.querySelector('main')
                    if (scrollContainer) {
                      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }, 50)
                }}
                className="mt-[1px] text-[12px] font-bold tracking-wide text-terracotta-600 transition-colors hover:text-terracotta-700"
              >
                Change
              </button>
            ) : null}
          </div>

          {selectedSeat ? (
            <Badge variant="success">Table {selectedSeat.table_number}, Seat {selectedSeat.seat_number}</Badge>
          ) : null}
        </div>
      </div>

      <CartFloatingBar onOpen={() => setDrawerOpen(true)} />

      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onProceed={proceedToCheckout}
        occupancyPercent={occupancyPercent}
      />

      <CustomizationModal
        item={activeItem}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setActiveItem(null)
        }}
        onAdd={handleAddWithCustomization}
      />
    </PageTransition>
  )
}
