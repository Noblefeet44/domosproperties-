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
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CARS & VEHICLE RENTALS TABLE
CREATE TABLE cars (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    listing_type TEXT DEFAULT 'rent' CHECK (listing_type IN ('rent', 'buy')),
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

-- 12. INITIAL SEED DATA
-- Seed Agents
INSERT INTO agent_profiles (id, name, email, password_hash, whatsapp, office_address, cac_number, profile_image, status, role) VALUES
('agent-main', 'DOMOS PROPERTY GLOBAL LIMITED (Headquarters)', 'info@domosproperties.com', 'Admin@password', '07073537007', 'Suit 4, DOMOS Plaza, University Road, Ekpoma, Edo State', 'RC: 7482910', '/images/ehis_hostel.png', 'approved', 'super_admin'),
('agent-ehis', 'Ehis Real Estate & Management Consult', 'ehis.consult@gmail.com', 'Ehis@123', '08034567890', 'No. 12 AAU Main Gate Expressway, Ekpoma, Edo State', 'RC: 3948120', '/images/treasure_hostel.png', 'approved', 'agent')
ON CONFLICT (id) DO NOTHING;

-- Seed Properties
INSERT INTO properties (id, title, description, price, caution_fee, reservation_fee, agency_fee, inspection_fee, legal_fee, location, neighborhood, bedrooms, bathrooms, guests, rating, reviews_count, images, amenities, featured, agent_id, agent_phone, google_maps_url) VALUES
('1', 'Self-Contained Executive Single Room Lodge', 'Newly built self-contained lodge with 24/7 running water, private balcony, security wire, and prepaid meter. Walking distance to AAU Main Gate.', 350000, 30000, 20000, 20000, 5000, 20000, 'AAU Main Gate Area, Ekpoma, Edo State', 'AAU Main Gate', 1, 1, 2, 4.9, 18, '["/images/ehis_hostel.png", "/images/treasure_hostel.png"]'::jsonb, '["24/7 Running Water", "Prepaid Meter", "Security Guard", "Balcony"]'::jsonb, true, 'agent-main', '07073537007', 'https://maps.google.com'),
('2', 'Luxury 2-Bedroom Student Shared Flat', 'Spacious two bedroom flat with ensuite bathrooms, modern POP ceiling, tiled floors, and ample parking space.', 550000, 50000, 30000, 30000, 5000, 25000, 'Benin-Auchi Expressway, Ekpoma, Edo State', 'Benin-Auchi Expressway', 2, 2, 4, 4.8, 12, '["/images/treasure_hostel.png", "/images/elite_residence.png"]'::jsonb, '["Ensuite Bathrooms", "Tiled Floors", "POP Ceiling", "Car Park"]'::jsonb, true, 'agent-ehis', '08034567890', 'https://maps.google.com')
ON CONFLICT (id) DO NOTHING;

-- Seed Hotels
INSERT INTO hotels (id, title, description, price_per_night, location, neighborhood, star_rating, reviews_count, images, amenities, featured, agent_id, agent_phone) VALUES
('hotel-1', 'DOMOS Luxury Suites & Hotel', 'Premium hospitality suite featuring air conditioning, high speed Wi-Fi, 24/7 power generator, restaurant, and bar.', 25000, 'University Road, Ekpoma, Edo State', 'University Road', 4.8, 34, '["/images/elite_residence.png"]'::jsonb, '["Air Conditioning", "Free High-Speed Wi-Fi", "24/7 Power Generator", "Swimming Pool"]'::jsonb, true, 'agent-main', '07073537007')
ON CONFLICT (id) DO NOTHING;

-- Seed Cars
INSERT INTO cars (id, title, description, listing_type, price, make, model, year, transmission, fuel_type, seats, mileage, condition, location, images, features, featured, agent_id, agent_phone) VALUES
('car-1', '2020 Toyota Camry XLE (Full Option)', 'Clean executive sedan available for daily rental or chauffeur services in Ekpoma and Benin City.', 'rent', 35000, 'Toyota', 'Camry XLE', 2020, 'Automatic', 'Petrol', 5, '34,000 km', 'Excellent', 'Ekpoma, Edo State', '["/images/royal_villa.png"]'::jsonb, '["Leather Interior", "Reverse Camera", "Bluetooth", "Chauffeur Available"]'::jsonb, true, 'agent-ehis', '08034567890')
ON CONFLICT (id) DO NOTHING;

-- Seed Lands
INSERT INTO lands (id, title, description, price, size, title_document, zoning, status, location, neighborhood, images, features, featured, agent_id, agent_phone) VALUES
('land-1', '100ft x 100ft Prime Commercial Plot', 'Prime commercial land plot along Benin-Auchi Expressway, perfect for hotel, hostel, or fuel station development.', 12000000, '100ft x 100ft', 'Deed of Conveyance & Survey Plan', 'Commercial', 'dry_land', 'Benin-Auchi Expressway, Ekpoma, Edo State', 'Expressway Zone', '["/images/treasure_hostel.png"]'::jsonb, '["Dry Land", "Direct Expressway Facing", "Surveyed"]'::jsonb, true, 'agent-main', '07073537007')
ON CONFLICT (id) DO NOTHING;
