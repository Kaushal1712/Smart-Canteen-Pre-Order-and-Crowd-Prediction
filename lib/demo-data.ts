import type { CanteenTable, MenuItemWithCustomizations, Seat, SeatBooking } from '@/lib/types'

export const DEMO_CANTEEN_TABLES: CanteenTable[] = [
  { id: 'table-1', table_number: 1, seats_count: 8, grid_row: 0, grid_col: 0 },
  { id: 'table-2', table_number: 2, seats_count: 8, grid_row: 0, grid_col: 1 },
  { id: 'table-3', table_number: 3, seats_count: 8, grid_row: 0, grid_col: 2 },
  { id: 'table-4', table_number: 4, seats_count: 8, grid_row: 0, grid_col: 3 },
  { id: 'table-5', table_number: 5, seats_count: 8, grid_row: 0, grid_col: 4 },
  { id: 'table-6', table_number: 6, seats_count: 8, grid_row: 1, grid_col: 0 },
  { id: 'table-7', table_number: 7, seats_count: 8, grid_row: 1, grid_col: 1 },
  { id: 'table-8', table_number: 8, seats_count: 8, grid_row: 1, grid_col: 2 },
  { id: 'table-9', table_number: 9, seats_count: 8, grid_row: 1, grid_col: 3 },
  { id: 'table-10', table_number: 10, seats_count: 8, grid_row: 1, grid_col: 4 },
  { id: 'table-11', table_number: 11, seats_count: 8, grid_row: 2, grid_col: 0 },
  { id: 'table-12', table_number: 12, seats_count: 8, grid_row: 2, grid_col: 1 },
  { id: 'table-13', table_number: 13, seats_count: 8, grid_row: 2, grid_col: 2 },
  { id: 'table-14', table_number: 14, seats_count: 8, grid_row: 2, grid_col: 3 },
  { id: 'table-15', table_number: 15, seats_count: 8, grid_row: 2, grid_col: 4 },
  { id: 'table-16', table_number: 16, seats_count: 8, grid_row: 2, grid_col: 5 }
]

export const DEMO_SEATS: Seat[] = DEMO_CANTEEN_TABLES.flatMap((table) =>
  Array.from({ length: table.seats_count }, (_, index) => ({
    id: `seat-${table.table_number}-${index + 1}`,
    table_id: table.id,
    seat_number: index + 1
  }))
)

export const DEMO_OCCUPIED_BOOKINGS: SeatBooking[] = DEMO_SEATS.slice(0, 18).map((seat, index) => ({
  id: `booking-demo-${index + 1}`,
  seat_id: seat.id,
  user_id: `other-user-${index + 1}`,
  status: 'occupied',
  held_at: new Date(Date.now() - 20 * 60_000).toISOString(),
  expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
  extended: false,
  released_at: null,
  created_at: new Date(Date.now() - 20 * 60_000).toISOString()
}))

export const DEMO_MENU_ITEMS: MenuItemWithCustomizations[] = [
  {
    id: 'menu-1',
    name: 'Paneer Butter Masala',
    description: 'Creamy tomato-based paneer curry',
    price: 120,
    category: 'North Indian',
    image_url: '',
    is_veg: true,
    spice_level: 'medium',
    prep_time_minutes: 15,
    is_available: true,
    created_at: new Date().toISOString(),
    menu_customizations: [
      { id: 'c-1', menu_item_id: 'menu-1', name: 'Extra cheese', price_addon: 20, type: 'checkbox', group_name: null },
      { id: 'c-2', menu_item_id: 'menu-1', name: 'No onion', price_addon: 0, type: 'checkbox', group_name: null }
    ]
  },
  {
    id: 'menu-2',
    name: 'Masala Dosa',
    description: 'Crispy dosa with spiced potato filling',
    price: 60,
    category: 'South Indian',
    image_url: '',
    is_veg: true,
    spice_level: 'medium',
    prep_time_minutes: 10,
    is_available: true,
    created_at: new Date().toISOString(),
    menu_customizations: [
      { id: 'c-3', menu_item_id: 'menu-2', name: 'Extra chutney', price_addon: 0, type: 'checkbox', group_name: null }
    ]
  },
  {
    id: 'menu-3',
    name: 'Butter Chicken',
    description: 'Tender chicken in rich gravy',
    price: 140,
    category: 'North Indian',
    image_url: '',
    is_veg: false,
    spice_level: 'medium',
    prep_time_minutes: 18,
    is_available: true,
    created_at: new Date().toISOString(),
    menu_customizations: []
  },
  {
    id: 'menu-4',
    name: 'Veg Sandwich',
    description: 'Toasted sandwich with fresh vegetables',
    price: 40,
    category: 'Snacks',
    image_url: '',
    is_veg: true,
    spice_level: 'mild',
    prep_time_minutes: 8,
    is_available: true,
    created_at: new Date().toISOString(),
    menu_customizations: []
  },
  {
    id: 'menu-5',
    name: 'Chicken Roll',
    description: 'Spiced chicken wrapped in paratha',
    price: 80,
    category: 'Snacks',
    image_url: '',
    is_veg: false,
    spice_level: 'spicy',
    prep_time_minutes: 12,
    is_available: true,
    created_at: new Date().toISOString(),
    menu_customizations: []
  },
  {
    id: 'menu-6',
    name: 'Maggi',
    description: 'Classic noodles with seasoning',
    price: 30,
    category: 'Snacks',
    image_url: '',
    is_veg: true,
    spice_level: 'medium',
    prep_time_minutes: 8,
    is_available: true,
    created_at: new Date().toISOString(),
    menu_customizations: [
      { id: 'c-4', menu_item_id: 'menu-6', name: 'Add veggies', price_addon: 10, type: 'checkbox', group_name: null },
      { id: 'c-5', menu_item_id: 'menu-6', name: 'Extra cheese', price_addon: 15, type: 'checkbox', group_name: null }
    ]
  },
  {
    id: 'menu-7',
    name: 'Cold Coffee',
    description: 'Iced coffee with milk',
    price: 45,
    category: 'Beverages',
    image_url: '',
    is_veg: true,
    spice_level: 'mild',
    prep_time_minutes: 5,
    is_available: true,
    created_at: new Date().toISOString(),
    menu_customizations: []
  },
  {
    id: 'menu-8',
    name: 'Masala Chai',
    description: 'Spiced tea',
    price: 15,
    category: 'Beverages',
    image_url: '',
    is_veg: true,
    spice_level: 'mild',
    prep_time_minutes: 3,
    is_available: true,
    created_at: new Date().toISOString(),
    menu_customizations: []
  }
]
