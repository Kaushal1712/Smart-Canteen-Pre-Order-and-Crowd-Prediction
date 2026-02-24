-- SMART CANTEEN SCHEMA
-- Run this in Supabase SQL Editor

-- 1) TABLES
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  default_dining_mode TEXT DEFAULT 'dine-in' CHECK (default_dining_mode IN ('dine-in', 'takeaway')),
  dietary_preferences JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS canteen_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INT NOT NULL UNIQUE,
  seats_count INT NOT NULL DEFAULT 8,
  grid_row INT NOT NULL,
  grid_col INT NOT NULL
);

CREATE TABLE IF NOT EXISTS seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES canteen_tables(id) ON DELETE CASCADE,
  seat_number INT NOT NULL,
  UNIQUE(table_id, seat_number)
);

CREATE TABLE IF NOT EXISTS seat_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'occupied', 'released', 'expired')),
  held_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  extended BOOLEAN DEFAULT FALSE,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seat_bookings_active ON seat_bookings(seat_id) WHERE status IN ('held', 'occupied');
CREATE INDEX IF NOT EXISTS idx_seat_bookings_user ON seat_bookings(user_id) WHERE status IN ('held', 'occupied');

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  is_veg BOOLEAN NOT NULL DEFAULT TRUE,
  spice_level TEXT DEFAULT 'medium' CHECK (spice_level IN ('mild', 'medium', 'spicy')),
  prep_time_minutes INT NOT NULL DEFAULT 10,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_addon DECIMAL(10,2) DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'checkbox' CHECK (type IN ('checkbox', 'radio')),
  group_name TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seat_booking_id UUID REFERENCES seat_bookings(id) ON DELETE SET NULL,
  order_type TEXT NOT NULL DEFAULT 'dine-in' CHECK (order_type IN ('dine-in', 'takeaway')),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'preparing', 'ready', 'picked_up', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  estimated_prep_minutes INT NOT NULL DEFAULT 10,
  payment_method TEXT DEFAULT 'upi',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_active ON orders(user_id) WHERE status IN ('confirmed', 'preparing', 'ready');

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INT NOT NULL DEFAULT 1,
  price_at_order DECIMAL(10,2) NOT NULL,
  spice_level TEXT DEFAULT 'medium',
  customizations JSONB DEFAULT '[]',
  special_instructions TEXT DEFAULT ''
);

-- 2) RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS tables_select ON canteen_tables;
DROP POLICY IF EXISTS seats_select ON seats;
DROP POLICY IF EXISTS bookings_select ON seat_bookings;
DROP POLICY IF EXISTS bookings_insert ON seat_bookings;
DROP POLICY IF EXISTS bookings_update_own ON seat_bookings;
DROP POLICY IF EXISTS menu_select ON menu_items;
DROP POLICY IF EXISTS customizations_select ON menu_customizations;
DROP POLICY IF EXISTS orders_select_own ON orders;
DROP POLICY IF EXISTS orders_insert_own ON orders;
DROP POLICY IF EXISTS orders_update_own ON orders;
DROP POLICY IF EXISTS order_items_select_own ON order_items;
DROP POLICY IF EXISTS order_items_insert_own ON order_items;

CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY tables_select ON canteen_tables FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY seats_select ON seats FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY bookings_select ON seat_bookings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY bookings_insert ON seat_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY bookings_update_own ON seat_bookings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY menu_select ON menu_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY customizations_select ON menu_customizations FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY orders_select_own ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY orders_insert_own ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY orders_update_own ON orders FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY order_items_select_own ON order_items
FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

CREATE POLICY order_items_insert_own ON order_items
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- 3) FUNCTIONS
CREATE OR REPLACE FUNCTION hold_seat(p_seat_id UUID, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_existing UUID;
BEGIN
  SELECT id INTO v_existing
  FROM seat_bookings
  WHERE user_id = p_user_id AND status IN ('held', 'occupied')
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'You already have an active seat');
  END IF;

  SELECT id INTO v_existing
  FROM seat_bookings
  WHERE seat_id = p_seat_id AND status IN ('held', 'occupied')
  FOR UPDATE;

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Seat already taken');
  END IF;

  INSERT INTO seat_bookings (seat_id, user_id, status, held_at, expires_at)
  VALUES (p_seat_id, p_user_id, 'held', NOW(), NOW() + INTERVAL '5 minutes');

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION release_seat(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
  UPDATE seat_bookings
  SET status = 'released', released_at = NOW()
  WHERE user_id = p_user_id AND status IN ('held', 'occupied');

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION confirm_order_and_occupy_seat(p_booking_id UUID)
RETURNS JSONB AS $$
BEGIN
  UPDATE seat_bookings
  SET status = 'occupied', expires_at = NOW() + INTERVAL '30 minutes'
  WHERE id = p_booking_id AND status = 'held';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Booking not found or already expired');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION extend_seat(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_already_extended BOOLEAN;
BEGIN
  SELECT extended INTO v_already_extended
  FROM seat_bookings
  WHERE user_id = p_user_id AND status = 'occupied'
  LIMIT 1;

  IF v_already_extended THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already extended once');
  END IF;

  UPDATE seat_bookings
  SET extended = TRUE, expires_at = expires_at + INTERVAL '15 minutes'
  WHERE user_id = p_user_id AND status = 'occupied';

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION expire_stale_bookings()
RETURNS void AS $$
BEGIN
  UPDATE seat_bookings
  SET status = 'expired'
  WHERE status = 'held' AND expires_at < NOW();

  UPDATE seat_bookings
  SET status = 'expired'
  WHERE status = 'occupied' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4) AUTH TRIGGER
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5) REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE seat_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 6) OPTIONAL CRON
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('expire-bookings', '* * * * *', 'SELECT expire_stale_bookings()');
