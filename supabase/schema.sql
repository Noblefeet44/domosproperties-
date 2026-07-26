-- DOMOS PROPERTY - SUPABASE POSTGRESQL SCHEMA
-- Execute this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL, -- Annual Rent in Naira (₦)
  caution_fee BIGINT DEFAULT 0,
  reservation_fee BIGINT DEFAULT 0,
  location TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  bedrooms INT DEFAULT 1,
  bathrooms INT DEFAULT 1,
  guests INT DEFAULT 2,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  rooms JSONB DEFAULT '[]'::jsonb,
  google_maps_url TEXT,
  agent_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES public.properties(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  property_image TEXT,
  property_location TEXT,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  guests_count INT DEFAULT 1,
  total_price BIGINT NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  booking_date TEXT NOT NULL,
  addons JSONB DEFAULT '[]'::jsonb,
  guest_name TEXT,
  guest_phone TEXT,
  guest_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES public.properties(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  avatar TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  date TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT,
  property_title TEXT,
  property_location TEXT,
  property_price BIGINT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  move_in_date TEXT NOT NULL,
  current_country TEXT NOT NULL,
  budget_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON public.properties(neighborhood);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON public.reviews(property_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- POLICIES (Public read access for listings, insert access for bookings/inquiries)
CREATE POLICY "Allow public read access to properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to properties" ON public.properties FOR ALL USING (true);

CREATE POLICY "Allow public read access to bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert to bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to bookings" ON public.bookings FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert to reviews" ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert to inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read inquiries" ON public.inquiries FOR SELECT USING (true);

-- INITIAL SEED DATA FOR EKPOMA HOSTELS
INSERT INTO public.properties (id, title, description, price, caution_fee, reservation_fee, location, neighborhood, bedrooms, bathrooms, guests, rating, reviews_count, images, amenities, featured, agent_phone, google_maps_url, rooms)
VALUES 
(
  '1',
  'Ehis Hostel (Executive Student Lodge)',
  'Ultra-modern, highly secured student residence located right next to AAU Main Gate in Ekpoma. Features 24/7 security guard, uninterrupted borehole water supply, pre-paid individual meters, tiled floors, pop ceilings, and spacious balconies for academic comfort.',
  350000,
  30000,
  20000,
  'AAU Main Gate, Ekpoma, Edo State',
  'AAU Main Gate',
  1,
  1,
  2,
  4.9,
  14,
  ARRAY['/images/ehis_hostel.png', '/images/treasure_hostel.png', '/images/elite_hostel.png', '/images/royal_villa.png'],
  ARRAY['24/7 Borehole Water', 'Gated Security Guard', 'Prepaid Electricity Meter', 'Private Balcony', 'Tiled Flooring', 'Reading Study Desk', 'Waste Management'],
  true,
  '07073537007',
  'https://maps.google.com/?q=Ambrose+Alli+University+Ekpoma',
  '[{"roomNumber": "Room 101 (Block A)", "status": "occupied", "type": "Self-Contained Single", "price": 350000}, {"roomNumber": "Room 102 (Block A)", "status": "available", "type": "Self-Contained Single", "price": 350000}, {"roomNumber": "Room 103 (Block A)", "status": "available", "type": "Self-Contained Double", "price": 420000}, {"roomNumber": "Room 104 (Block A)", "status": "reserved", "type": "Self-Contained Single", "price": 350000}]'::jsonb
),
(
  '2',
  'Treasure Hostel & Luxury Apartments',
  'Contemporary student apartments situated along the Benin-Auchi Expressway in Ekpoma. Designed for students seeking peaceful study conditions, ample parking space, fenced gate compound, and proximity to campus shuttle buses.',
  320000,
  25000,
  20000,
  'Benin-Auchi Expressway, Ekpoma, Edo State',
  'Benin-Auchi Expressway',
  1,
  1,
  2,
  4.85,
  9,
  ARRAY['/images/treasure_hostel.png', '/images/ehis_hostel.png'],
  ARRAY['Fenced Compound', '24/7 Water Supply', 'Ample Parking', 'Security Patrol', 'Prepaid Meter'],
  true,
  '07073537007',
  'https://maps.google.com/?q=Ekpoma+Edo+State',
  '[{"roomNumber": "Room 01", "status": "available", "type": "Self-Contained", "price": 320000}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- SEED INITIAL REVIEWS
INSERT INTO public.reviews (id, property_id, guest_name, avatar, rating, date, comment)
VALUES
('r1', '1', 'Emmanuel Osagie', 'EO', 5, 'July 12, 2026', 'Best hostel near AAU main gate! The water supply is always constant and security is 100% reliable.'),
('r2', '1', 'Blessing Ijewere', 'BI', 5, 'June 28, 2026', 'DOMOS PROPERTY team made my rent payment seamless. Very honest hostel management in Ekpoma.')
ON CONFLICT (id) DO NOTHING;
