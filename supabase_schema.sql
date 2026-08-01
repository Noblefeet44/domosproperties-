-- ============================================================================
-- DOMOS PROPERTY GLOBAL LIMITED - PRODUCTION SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Run this complete script in the Supabase SQL Editor (https://app.supabase.com)
-- Go to: SQL Editor -> New Query -> Paste & Run
-- ============================================================================

-- 1. DROP EXISTING TABLES (Clean Slate Setup)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS lands CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS agent_profiles CASCADE;

-- 2. AGENT PROFILES TABLE
CREATE TABLE agent_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    office_address TEXT NOT NULL,
    cac_number TEXT,
    profile_image TEXT,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'banned')),
    role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'super_admin')),
    telegram_chat_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. APARTMENTS & PROPERTIES TABLE
CREATE TABLE properties (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    caution_fee NUMERIC DEFAULT 0,
    reservation_fee NUMERIC DEFAULT 0,
    agency_fee NUMERIC DEFAULT 0,
    inspection_fee NUMERIC DEFAULT 0,
    legal_fee NUMERIC DEFAULT 0,
    location TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    bedrooms INT DEFAULT 1,
    bathrooms INT DEFAULT 1,
    guests INT DEFAULT 2,
    rating NUMERIC(3,2) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    amenities JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT false,
    agent_id TEXT REFERENCES agent_profiles(id) ON DELETE SET NULL,
    agent_phone TEXT,
    google_maps_url TEXT,
    rooms JSONB DEFAULT '[]'::jsonb,
    youtube_video_id TEXT,
    youtube_url TEXT,
    youtube_thumbnail TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. HOTELS & SUITES TABLE
CREATE TABLE hotels (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price_per_night NUMERIC NOT NULL DEFAULT 0,
    location TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    star_rating NUMERIC(3,2) DEFAULT 4.5,
    reviews_count INT DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    amenities JSONB DEFAULT '[]'::jsonb,
    rooms JSONB DEFAULT '[]'::jsonb,
    check_in_time TEXT DEFAULT '2:00 PM',
    check_out_time TEXT DEFAULT '12:00 PM',
    cancellation_policy TEXT,
    featured BOOLEAN DEFAULT false,
    agent_id TEXT REFERENCES agent_profiles(id) ON DELETE SET NULL,
    agent_phone TEXT,
    google_maps_url TEXT,
    youtube_video_id TEXT,
    youtube_url TEXT,
    youtube_thumbnail TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CARS & VEHICLE RENTALS TABLE
CREATE TABLE cars (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    listing_type TEXT DEFAULT 'rent' CHECK (listing_type IN ('rent', 'sale', 'buy')),
    price NUMERIC NOT NULL DEFAULT 0,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT DEFAULT 2024,
    transmission TEXT DEFAULT 'Automatic',
    fuel_type TEXT DEFAULT 'Petrol',
    seats INT DEFAULT 5,
    mileage TEXT DEFAULT 'Low Mileage',
    condition TEXT DEFAULT 'Excellent',
    location TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT false,
    agent_id TEXT REFERENCES agent_profiles(id) ON DELETE SET NULL,
    agent_phone TEXT,
    youtube_video_id TEXT,
    youtube_url TEXT,
    youtube_thumbnail TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. LAND PLOTS TABLE
CREATE TABLE lands (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    size TEXT NOT NULL,
    title_document TEXT DEFAULT 'C of O',
    zoning TEXT DEFAULT 'Residential',
    status TEXT DEFAULT 'dry_land',
    location TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    google_maps_url TEXT,
    featured BOOLEAN DEFAULT false,
    agent_id TEXT REFERENCES agent_profiles(id) ON DELETE SET NULL,
    agent_phone TEXT,
    youtube_video_id TEXT,
    youtube_url TEXT,
    youtube_thumbnail TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. BOOKINGS & RESERVATIONS TABLE
CREATE TABLE bookings (
    id TEXT PRIMARY KEY,
    category TEXT DEFAULT 'property',
    property_id TEXT NOT NULL,
    property_name TEXT NOT NULL,
    property_image TEXT,
    property_location TEXT,
    check_in TEXT,
    check_out TEXT,
    guests_count INT DEFAULT 1,
    total_price NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'confirmed',
    booking_date TEXT,
    addons JSONB DEFAULT '[]'::jsonb,
    guest_name TEXT,
    guest_phone TEXT,
    agent_id TEXT REFERENCES agent_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TENANT INQUIRIES TABLE
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT,
    property_title TEXT,
    property_location TEXT,
    property_price NUMERIC,
    name TEXT NOT NULL,
    email TEXT,
    whatsapp TEXT NOT NULL,
    move_in_date TEXT,
    current_country TEXT,
    budget_range TEXT,
    occupation TEXT,
    agent_id TEXT REFERENCES agent_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. REVIEWS TABLE
CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    avatar TEXT,
    rating NUMERIC(3,2) DEFAULT 5.0,
    comment TEXT,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. INDEXES FOR PERFORMANCE & AGENT FILTERING
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_hotels_agent_id ON hotels(agent_id);
CREATE INDEX idx_cars_agent_id ON cars(agent_id);
CREATE INDEX idx_lands_agent_id ON lands(agent_id);
CREATE INDEX idx_bookings_agent_id ON bookings(agent_id);
CREATE INDEX idx_inquiries_agent_id ON inquiries(agent_id);
CREATE INDEX idx_reviews_property_id ON reviews(property_id);

-- 11. ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow Public Read & Full Write Access (for REST API service layer)
CREATE POLICY "Public Read Agents" ON agent_profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Agents" ON agent_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Agents" ON agent_profiles FOR UPDATE USING (true);

CREATE POLICY "Public Read Properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Public Insert Properties" ON properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Properties" ON properties FOR UPDATE USING (true);
CREATE POLICY "Public Delete Properties" ON properties FOR DELETE USING (true);

CREATE POLICY "Public Read Hotels" ON hotels FOR SELECT USING (true);
CREATE POLICY "Public Insert Hotels" ON hotels FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Hotels" ON hotels FOR UPDATE USING (true);
CREATE POLICY "Public Delete Hotels" ON hotels FOR DELETE USING (true);

CREATE POLICY "Public Read Cars" ON cars FOR SELECT USING (true);
CREATE POLICY "Public Insert Cars" ON cars FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Cars" ON cars FOR UPDATE USING (true);
CREATE POLICY "Public Delete Cars" ON cars FOR DELETE USING (true);

CREATE POLICY "Public Read Lands" ON lands FOR SELECT USING (true);
CREATE POLICY "Public Insert Lands" ON lands FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Lands" ON lands FOR UPDATE USING (true);
CREATE POLICY "Public Delete Lands" ON lands FOR DELETE USING (true);

CREATE POLICY "Public Read Bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public Insert Bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Bookings" ON bookings FOR UPDATE USING (true);

CREATE POLICY "Public Read Inquiries" ON inquiries FOR SELECT USING (true);
CREATE POLICY "Public Insert Inquiries" ON inquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert Reviews" ON reviews FOR INSERT WITH CHECK (true);

-- 12. INITIAL SUPER-ADMIN AGENT
INSERT INTO agent_profiles (id, name, email, password_hash, whatsapp, office_address, cac_number, profile_image, status, role) VALUES
('agent-main', 'DOMOS PROPERTY GLOBAL LIMITED (Headquarters)', 'domospropertygloballimited@gmail.com', 'Admin@password', '07073537007', 'Suit 4, DOMOS Plaza, University Road, Ekpoma, Edo State', 'RC: 7482910', '', 'approved', 'super_admin')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 13. SAFE MIGRATION COMMANDS (FOR EXISTING LIVE DATABASES)
-- Run ONLY the queries below if you already have live data in your database!
-- ============================================================================
ALTER TABLE properties ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS youtube_thumbnail TEXT;

ALTER TABLE hotels ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS youtube_thumbnail TEXT;

ALTER TABLE cars ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS youtube_thumbnail TEXT;

ALTER TABLE lands ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;
ALTER TABLE lands ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE lands ADD COLUMN IF NOT EXISTS youtube_thumbnail TEXT;

ALTER TABLE agent_profiles ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

