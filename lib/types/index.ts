export type DiningMode = 'dine-in' | 'takeaway'
export type SeatBookingStatus = 'held' | 'occupied' | 'released' | 'expired'
export type OrderStatus = 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'cancelled'
export type SpiceLevel = 'mild' | 'medium' | 'spicy'

export interface UserProfile {
  id: string
  email: string
  name: string
  phone: string
  avatar_url: string
  default_dining_mode: DiningMode
  dietary_preferences: string[]
  created_at: string
}

export interface CanteenTable {
  id: string
  table_number: number
  seats_count: number
  grid_row: number
  grid_col: number
}

export interface Seat {
  id: string
  table_id: string
  seat_number: number
}

export interface SeatBooking {
  id: string
  seat_id: string
  user_id: string
  status: SeatBookingStatus
  held_at: string
  expires_at: string | null
  extended: boolean
  released_at: string | null
  created_at: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  is_veg: boolean
  spice_level: SpiceLevel
  prep_time_minutes: number
  is_available: boolean
  created_at: string
}

export interface MenuCustomization {
  id: string
  menu_item_id: string
  name: string
  price_addon: number
  type: 'checkbox' | 'radio'
  group_name: string | null
}

export interface MenuItemWithCustomizations extends MenuItem {
  menu_customizations?: MenuCustomization[]
}

export interface Order {
  id: string
  user_id: string
  seat_booking_id: string | null
  order_type: DiningMode
  status: OrderStatus
  total_amount: number
  estimated_prep_minutes: number
  payment_method: string
  created_at: string
  updated_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  price_at_order: number
  spice_level: SpiceLevel
  customizations: CartItemCustomization[]
  special_instructions: string
  menu_items?: MenuItem
}

export interface CartItemCustomization {
  id: string
  name: string
  price_addon: number
  group_name?: string | null
  type?: 'checkbox' | 'radio'
}

export interface CartItem {
  id: string
  menu_item_id: string
  name: string
  base_price: number
  quantity: number
  spice_level: SpiceLevel
  customizations: CartItemCustomization[]
  special_instructions: string
  prep_time_minutes: number
  image_url: string
  category: string
  is_veg: boolean
}

export interface SelectedSeat {
  seat_id: string
  seat_number: number
  table_id: string
  table_number: number
}

export interface SeatWithMeta extends Seat {
  canteen_tables?: CanteenTable | CanteenTable[]
}

export interface SeatBookingWithMeta extends SeatBooking {
  seats?: SeatWithMeta
}

export interface OrderWithItems extends Order {
  order_items?: OrderItem[]
  seat_table_number?: number | null
  seat_seat_number?: number | null
}

export interface HoldSeatResponse {
  success: boolean
  error?: string
}

export interface DashboardStats {
  totalSeats: number
  occupiedSeats: number
}
