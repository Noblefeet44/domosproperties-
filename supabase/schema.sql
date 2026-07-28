-- DOMOS PROPERTY - COMPREHENSIVE MULTI-AGENT SUPABASE POSTGRESQL SCHEMA
-- Multi-Directory Platform: Apartments/Properties, Hotels, Cars, Land Properties, Agent Profiles & Governance
-- Execute this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- ==========================================
-- 0. AGENT PROFILES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.agent_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  office_address TEXT NOT NULL,
  cac_number TEXT NOT NULL, -- e.g. RC: 1234567
  profile_image TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'banned')),
  role TEXT DEFAULT 'agent' CHECK (role IN ('agent', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 1. PROPERTIES (APARTMENTS & FLATS) TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES public.agent_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL, -- Annual Rent / Session Price in Naira (₦)
  caution_fee BIGINT DEFAULT 0,
  reservation_fee BIGINT DEFAULT 0,
  agency_fee BIGINT DEFAULT 0,
  inspection_fee BIGINT DEFAULT 0,
  legal_fee BIGINT DEFAULT 0,
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
  agent_phone TEXT DEFAULT '07073537007',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. HOTELS & SHORT STAYS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.hotels (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES public.agent_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_per_night BIGINT NOT NULL, -- Nightly Rate in Naira (₦)
  location TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  star_rating NUMERIC(2, 1) DEFAULT 4.5,
  reviews_count INT DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  rooms JSONB DEFAULT '[]'::jsonb, -- Room Types e.g. [{"name": "Standard Deluxe", "price": 25000, "image": "...", "status": "available"}]
  check_in_time TEXT DEFAULT '2:00 PM',
  check_out_time TEXT DEFAULT '12:00 PM',
  cancellation_policy TEXT DEFAULT 'Free cancellation up to 24 hours before check-in',
  agent_phone TEXT DEFAULT '07073537007',
  google_maps_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. CAR SALE & RENT DIRECTORY TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.cars (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES public.agent_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('rent', 'sale')),
  price BIGINT NOT NULL, -- Daily Rate if rent, Total Price if sale in Naira (₦)
  make TEXT NOT NULL, -- e.g. Toyota, Mercedes-Benz, Lexus
  model TEXT NOT NULL, -- e.g. Camry, GLE 450, RX 350
  year INT NOT NULL,
  transmission TEXT NOT NULL CHECK (transmission IN ('automatic', 'manual')),
  fuel_type TEXT DEFAULT 'Petrol', -- Petrol, Diesel, Hybrid, Electric
  seats INT DEFAULT 5,
  mileage TEXT DEFAULT 'Low Mileage',
  condition TEXT NOT NULL CHECK (condition IN ('brand_new', 'foreign_used', 'local_used')),
  location TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  agent_phone TEXT DEFAULT '07073537007',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. LAND PROPERTIES DIRECTORY TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.lands (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES public.agent_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL, -- Total Price in Naira (₦)
  size TEXT NOT NULL, -- e.g. 1 Plot (600 sqm), 2 Acres, 100ft x 100ft
  title_document TEXT NOT NULL, -- C of O, Deed of Assignment, Gazette, Survey Plan, Excision, Governor Consent
  zoning TEXT DEFAULT 'Residential' CHECK (zoning IN ('Residential', 'Commercial', 'Industrial', 'Agricultural')),
  status TEXT DEFAULT 'dry_land' CHECK (status IN ('dry_land', 'fenced', 'corner_piece', 'under_development')),
  location TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  google_maps_url TEXT,
  agent_phone TEXT DEFAULT '07073537007',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. UNIFIED BOOKINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES public.agent_profiles(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'property' CHECK (category IN ('property', 'hotel', 'car', 'land')),
  item_id TEXT NOT NULL,
  item_title TEXT NOT NULL,
  item_image TEXT,
  item_location TEXT,
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

-- ==========================================
-- 6. UNIFIED INQUIRIES & INSPECTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT REFERENCES public.agent_profiles(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'property', 'hotel', 'car', 'land')),
  item_id TEXT,
  item_title TEXT,
  item_location TEXT,
  item_price BIGINT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  preferred_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. REVIEWS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  property_id TEXT,
  hotel_id TEXT,
  guest_name TEXT NOT NULL,
  avatar TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  date TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_agent_profiles_email ON public.agent_profiles(email);
CREATE INDEX IF NOT EXISTS idx_agent_profiles_status ON public.agent_profiles(status);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON public.properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_hotels_agent_id ON public.hotels(agent_id);
CREATE INDEX IF NOT EXISTS idx_cars_agent_id ON public.cars(agent_id);
CREATE INDEX IF NOT EXISTS idx_lands_agent_id ON public.lands(agent_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- POLICIES (Public read access & public insert for agents/bookings/inquiries)
CREATE POLICY "Allow public read access to agent_profiles" ON public.agent_profiles FOR SELECT USING (true);
CREATE POLICY "Allow agent sign up" ON public.agent_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow agent update self" ON public.agent_profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to properties" ON public.properties FOR ALL USING (true);

CREATE POLICY "Allow public read access to hotels" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to hotels" ON public.hotels FOR ALL USING (true);

CREATE POLICY "Allow public read access to cars" ON public.cars FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to cars" ON public.cars FOR ALL USING (true);

CREATE POLICY "Allow public read access to lands" ON public.lands FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to lands" ON public.lands FOR ALL USING (true);

CREATE POLICY "Allow public read access to bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert to bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to bookings" ON public.bookings FOR UPDATE USING (true);

CREATE POLICY "Allow public insert to inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read inquiries" ON public.inquiries FOR SELECT USING (true);

CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert to reviews" ON public.reviews FOR INSERT WITH CHECK (true);

-- SEED INITIAL AGENT PROFILES & DATA
-- ==========================================

-- 0. AGENT SEED
  1,
  1,
  2,
  4.9,
  14,
  ARRAY['/images/ehis_hostel.png', '/images/treasure_hostel.png', '/images/elite_hostel.png', '/images/royal_villa.png'],
  ARRAY['24/7 Industrial Borehole Water', 'Prepaid Electricity Meter (PHCN)', '24/7 Gated Security Guard', 'Tiled Flooring & POP Ceilings', 'Reading Study Desk & Chair', 'En-Suite Bathroom & Water Heater'],
  true,
  '07073537007',
  'https://maps.google.com/?q=Ambrose+Alli+University+Ekpoma',
  '[{"roomNumber": "Room 101 (Block A)", "status": "occupied", "type": "Self-Contained Single", "price": 350000}, {"roomNumber": "Room 102 (Block A)", "status": "available", "type": "Self-Contained Single", "price": 350000}]'::jsonb
),
(
  '2',
  'agent-ehis',
  'Treasure Luxury Apartments',
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
  ARRAY['Fenced Compound & Security Gate', 'Solar Power & Inverter Backup', '24/7 Industrial Borehole Water', 'Ample Car & Bike Parking'],
  true,
  '08012345678',
  'https://maps.google.com/?q=Ekpoma+Edo+State',
  '[{"roomNumber": "Room 01", "status": "available", "type": "Self-Contained", "price": 320000}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
