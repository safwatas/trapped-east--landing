-- Phase 1 Migration: Supabase Schema

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  min_players INTEGER NOT NULL DEFAULT 2,
  max_players INTEGER NOT NULL DEFAULT 7,
  duration INTEGER NOT NULL DEFAULT 60,
  difficulty TEXT,
  is_horror BOOLEAN DEFAULT false,
  horror_toggleable BOOLEAN DEFAULT false,
  non_horror_available BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Room Images
CREATE TABLE IF NOT EXISTS room_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, image_url)
);

-- 3. Pricing Tiers
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_count INTEGER NOT NULL,
  price_per_person INTEGER NOT NULL,
  UNIQUE(room_id, player_count)
);

-- 4. Time Slots
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_time TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- 5. Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id),
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  player_count INTEGER NOT NULL,
  horror_mode BOOLEAN DEFAULT false,
  total_price INTEGER NOT NULL,
  price_per_person INTEGER NOT NULL,
  applied_promo TEXT,
  applied_offer_id UUID,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  status TEXT DEFAULT 'pending',
  internal_notes TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_adset TEXT,
  utm_ad TEXT,
  fbclid TEXT,
  event_id UUID UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, booking_date, time_slot)
);

-- 6. Booking Notes (for multiple notes per booking)
CREATE TABLE IF NOT EXISTS booking_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value INTEGER NOT NULL,
  min_players INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Offers
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value INTEGER NOT NULL,
  room_ids UUID[],
  day_of_week INTEGER,
  start_date DATE,
  end_date DATE,
  active BOOLEAN DEFAULT true
);

-- 9. Settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (to allow re-running this script)
DROP POLICY IF EXISTS "Public read active rooms" ON rooms;
DROP POLICY IF EXISTS "Public read images" ON room_images;
DROP POLICY IF EXISTS "Public read pricing" ON pricing_tiers;
DROP POLICY IF EXISTS "Public read slots" ON time_slots;
DROP POLICY IF EXISTS "Anyone can submit bookings" ON bookings;
DROP POLICY IF EXISTS "Public can view own booking" ON bookings;
DROP POLICY IF EXISTS "Admin full access rooms" ON rooms;
DROP POLICY IF EXISTS "Admin full access images" ON room_images;
DROP POLICY IF EXISTS "Admin full access pricing" ON pricing_tiers;
DROP POLICY IF EXISTS "Admin full access slots" ON time_slots;
DROP POLICY IF EXISTS "Admin full access bookings" ON bookings;
DROP POLICY IF EXISTS "Admin full access notes" ON booking_notes;
DROP POLICY IF EXISTS "Admin full access promos" ON promo_codes;
DROP POLICY IF EXISTS "Admin full access offers" ON offers;
DROP POLICY IF EXISTS "Admin full access settings" ON settings;
DROP POLICY IF EXISTS "Admin can read own record" ON admin_users;

-- ========================================
-- PUBLIC POLICIES (for anon users)
-- ========================================

-- Rooms: Public can read active rooms
CREATE POLICY "Public read active rooms" ON rooms 
  FOR SELECT 
  TO public 
  USING (active = true);

-- Room Images: Public can read all images
CREATE POLICY "Public read images" ON room_images 
  FOR SELECT 
  TO public 
  USING (true);

-- Pricing: Public can read all pricing
CREATE POLICY "Public read pricing" ON pricing_tiers 
  FOR SELECT 
  TO public 
  USING (true);

-- Time Slots: Public can read active slots
CREATE POLICY "Public read slots" ON time_slots 
  FOR SELECT 
  TO public 
  USING (is_active = true);

-- Bookings: Anyone can INSERT a booking (lead submission)
CREATE POLICY "Anyone can submit bookings" ON bookings 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- Bookings: Public can view bookings (for confirmation page)
CREATE POLICY "Public can view own booking" ON bookings 
  FOR SELECT 
  TO public 
  USING (true);

-- ========================================
-- ADMIN POLICIES (for authenticated users in admin_users table)
-- ========================================

-- Admin Users: Allow admins to read their own record (needed for other policy checks)
CREATE POLICY "Admin can read own record" ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Rooms: Admin full access
CREATE POLICY "Admin full access rooms" ON rooms 
  FOR ALL 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Room Images: Admin full access
CREATE POLICY "Admin full access images" ON room_images 
  FOR ALL 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Pricing: Admin full access
CREATE POLICY "Admin full access pricing" ON pricing_tiers 
  FOR ALL 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Time Slots: Admin full access
CREATE POLICY "Admin full access slots" ON time_slots 
  FOR ALL 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Bookings: Admin full access
CREATE POLICY "Admin full access bookings" ON bookings 
  FOR ALL 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Booking Notes: Admin full access
CREATE POLICY "Admin full access notes" ON booking_notes 
  FOR ALL 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Promo Codes: Admin full access
CREATE POLICY "Admin full access promos" ON promo_codes 
  FOR ALL 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Offers: Admin full access
CREATE POLICY "Admin full access offers" ON offers 
  FOR ALL 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Settings: Admin full access
CREATE POLICY "Admin full access settings" ON settings 
  FOR ALL 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- ========================================
-- HELPER FUNCTION: Check if user is admin
-- ========================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
