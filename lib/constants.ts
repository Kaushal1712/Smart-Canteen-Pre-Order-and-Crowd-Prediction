import {
  Armchair,
  CircleUser,
  LayoutDashboard,
  LogOut,
  Receipt,
  UtensilsCrossed
} from 'lucide-react'

export const NAV_LINKS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Live Canteen',
    href: '/canteen',
    icon: Armchair
  },
  {
    title: 'Menu',
    href: '/menu',
    icon: UtensilsCrossed
  },
  {
    title: 'My Orders',
    href: '/orders',
    icon: Receipt
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: CircleUser
  }
]

export const LOGOUT_LINK = {
  title: 'Log Out',
  href: '/login',
  icon: LogOut
}

export const PUBLIC_ROUTES = ['/', '/login', '/signup']

export const PAYMENT_METHODS = [
  {
    value: 'upi',
    label: 'Pay with UPI',
    subtitle: 'Instant payment'
  },
  {
    value: 'card',
    label: 'Pay with Card',
    subtitle: 'Debit or credit card'
  },
  {
    value: 'cash',
    label: 'Cash on Pickup',
    subtitle: 'Pay at counter'
  }
]

export const ORDER_STATUS_ORDER = [
  'confirmed',
  'preparing',
  'ready',
  'picked_up',
  'cancelled'
] as const
