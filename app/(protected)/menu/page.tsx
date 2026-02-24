'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, UtensilsCrossed } from 'lucide-react'
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

  const [menuItems, setMenuItems] = useState<MenuItemWithCustomizations[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<MenuItemWithCustomizations | null>(null)
  const [occupancyPercent, setOccupancyPercent] = useState(0)

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

    setMenuItems((menuData || []) as MenuItemWithCustomizations[])

    const total = seatCount || 0
    const occupied = bookingCount || 0
    setOccupancyPercent(total > 0 ? Math.round((occupied / total) * 100) : 0)

    setLoading(false)
  }

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
      <section className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Menu & Ordering</p>
            <h1 className="font-display text-[28px] font-bold text-[#1A1A1A]">Choose Your Meal</h1>
          </div>

          <div className="rounded-card bg-[#1A1A1A] px-5 py-3 text-white">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[#A0A0A0]">Cart Summary</p>
            <p className="mt-1 text-[15px] font-semibold">
              {getItemCount()} items · {formatCurrency(getTotal())}
            </p>
          </div>
        </header>

        {!diningMode && !selectedSeat ? (
          <div className="rounded-card border border-amber-500/20 bg-amber-50 p-4">
            <p className="text-[14px] text-[#1A1A1A]">Select your dining preference to place an order.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => router.push('/canteen')}>
                Dine In (select seat first)
              </Button>
              <Button
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
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9C9590]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search menu items"
              className="rounded-chip pl-10"
            />
          </div>

          <div className="flex gap-2">
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
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-card bg-white p-3">
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="mt-3 h-6 w-2/3" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-4 h-10 w-full rounded-button" />
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={handleQuickAdd} />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 rounded-card bg-cream-50 p-4">
          <Badge variant="info">Estimated prep: ~{getEstimatedPrepTime(occupancyPercent)} min</Badge>
          <Badge variant="default">Occupancy impact: {occupancyPercent}%</Badge>
          <Badge variant="primary">Mode: {diningMode || 'not selected'}</Badge>
          {selectedSeat ? (
            <Badge variant="success">Table {selectedSeat.table_number}, Seat {selectedSeat.seat_number}</Badge>
          ) : null}
        </div>
      </section>

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
