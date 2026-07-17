"use client";

import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { SearchBar } from "./components/SearchBar";
import { PropertyCard } from "./components/PropertyCard";
import { PropertyDetailsModal } from "./components/PropertyDetailsModal";
import { UserDashboard } from "./components/UserDashboard";
import { HostDashboard } from "./components/HostDashboard";
import { NeighborhoodMap } from "./components/NeighborhoodMap";
import { useApp } from "./context/AppContext";

export default function Home() {
  const {
    properties,
    activeView,
    searchQuery,
    selectedNeighborhood,
    priceRange,
    guestCount,
  } = useApp();

  const [showMap, setShowMap] = useState(false);

  // Filter Properties logic
  const filteredProperties = properties.filter((property) => {
    // Neighborhood filter
    if (selectedNeighborhood !== "All" && property.neighborhood !== selectedNeighborhood) {
      return false;
    }

    // Guests filter
    if (property.guests < guestCount) {
      return false;
    }

    // Price filter
    if (property.price > priceRange[1]) {
      return false;
    }

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = property.title.toLowerCase().includes(query);
      const matchDesc = property.description.toLowerCase().includes(query);
      const matchAmenities = property.amenities.some((a) => a.toLowerCase().includes(query));
      if (!matchTitle && !matchDesc && !matchAmenities) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Top Banner (Promo info) */}
      <div className="w-full bg-stone-900 text-stone-300 dark:bg-zinc-900 dark:text-zinc-400 py-1.5 px-4 text-center text-[10px] font-semibold tracking-wider uppercase border-b border-stone-800">
        ✨ Experience VIP Luxury Shortlets • 24/7 Security & Uninterrupted Power Guaranteed
      </div>

      <Navbar />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {activeView === "explore" && (
          <>
            {/* Hero Section */}
            <div className="relative pt-12 pb-8 text-center max-w-3xl mx-auto px-4">
              <span className="text-[10px] bg-gold/10 text-gold border border-gold/20 rounded-full px-3 py-1 font-bold uppercase tracking-widest inline-block mb-3.5">
                Luxury Stays
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
                Premium Shortlets in <br />
                <span className="gold-gradient-text">Abuja, Nigeria</span>
              </h1>
              <p className="text-xs md:text-sm text-stone-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
                Handpicked, high-end apartments with uninterrupted solar energy, premium security, and standard amenities in Abuja&apos;s finest residential zones.
              </p>
            </div>

            {/* Advanced Search Panel */}
            <SearchBar />

            {/* Properties Grid Area */}
            <div className="w-full max-w-6xl mx-auto px-4 mt-4">
              {/* Grid Header with Map Toggle */}
              <div className="flex justify-between items-center mb-6 border-b border-stone-200/40 dark:border-zinc-800/40 pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold tracking-tight text-stone-800 dark:text-zinc-200">
                    Available Collections
                  </h2>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 dark:border-zinc-800 hover:bg-stone-100/50 dark:hover:bg-zinc-800/40 text-[9px] font-extrabold uppercase tracking-wider text-stone-600 dark:text-zinc-400 transition-all shadow-xs cursor-pointer"
                  >
                    {showMap ? "📋 Hide Map" : "🗺️ Show Map"}
                  </button>
                </div>
                <p className="text-xs text-stone-550 dark:text-zinc-450">
                  Showing {filteredProperties.length} of {properties.length} shortlets
                </p>
              </div>

              {/* Mobile map display */}
              {showMap && (
                <div className="w-full h-80 md:hidden mb-6">
                  <NeighborhoodMap properties={filteredProperties} />
                </div>
              )}

              {/* Split Screen Logic */}
              <div className={showMap ? "grid grid-cols-1 md:grid-cols-12 gap-8 items-start" : ""}>
                {/* Left Side: Property Listings */}
                <div className={showMap ? "md:col-span-7" : ""}>
                  {filteredProperties.length === 0 ? (
                    <div className="text-center py-24 bg-stone-100/30 dark:bg-zinc-900/10 rounded-3xl border border-dashed border-stone-200 dark:border-zinc-800">
                      <span className="text-4xl">🔎</span>
                      <h3 className="text-base font-bold mt-4">No matching shortlets found</h3>
                      <p className="text-xs text-stone-500 mt-1">
                        Try broadening your budget, selecting another area, or decreasing guest count.
                      </p>
                    </div>
                  ) : (
                    <div className={`grid grid-cols-1 gap-8 ${showMap ? "sm:grid-cols-1 lg:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                      {filteredProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Sticky Neighborhood Map */}
                {showMap && (
                  <div className="hidden md:block md:col-span-5 md:sticky md:top-24 h-[calc(100vh-180px)]">
                    <NeighborhoodMap properties={filteredProperties} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Guide Section */}
            <div className="w-full max-w-6xl mx-auto px-4 mt-20">
              <div className="glass rounded-3xl p-8 border border-stone-200/50 dark:border-zinc-800/50 relative overflow-hidden">
                <div className="max-w-md relative z-10">
                  <span className="text-xs text-gold uppercase tracking-wider font-extrabold block mb-2">Abuja Travel Guide</span>
                  <h3 className="text-xl font-bold mb-3">Choosing Your Neighborhood</h3>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed mb-4">
                    Whether you prefer the diplomatic tranquility of Maitama and Asokoro, the restaurant & nightlife energy of Wuse II, or lake views in Jabi, Abuja Shortlet offers premium lodging options matched with elite concierge services.
                  </p>
                  <div className="flex gap-4">
                    <div>
                      <span className="font-extrabold text-stone-800 dark:text-zinc-200 text-xs block">Maitama / Asokoro</span>
                      <span className="text-[10px] text-stone-400">Quiet, High Security, Luxury Villas</span>
                    </div>
                    <div>
                      <span className="font-extrabold text-stone-800 dark:text-zinc-200 text-xs block">Wuse II / Jabi</span>
                      <span className="text-[10px] text-stone-400">Trendy Cafes, Lake Views, Nightlife</span>
                    </div>
                  </div>
                </div>
                {/* Visual Accent */}
                <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-gold/10 to-transparent pointer-events-none hidden md:block" />
              </div>
            </div>
          </>
        )}

        {(activeView === "bookings" || activeView === "wishlist") && <UserDashboard />}

        {activeView === "host" && <HostDashboard />}
      </main>

      {/* Global Property Details Modal */}
      <PropertyDetailsModal />

      {/* Global Footer */}
      <footer className="border-t border-stone-200/50 dark:border-zinc-800/50 bg-stone-100/50 dark:bg-zinc-950 py-10 px-4 mt-auto">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md gold-bg-gradient flex items-center justify-center text-white font-bold text-[10px]">
                A
              </div>
              <span className="text-sm font-bold tracking-tight">
                Abuja<span className="gold-gradient-text">Shortlet</span>
              </span>
            </div>
            <p className="text-stone-400 dark:text-zinc-500 leading-relaxed">
              Curating elite short-stay living experiences across Abuja. Unmatched amenities, guaranteed power, and top-tier customer support.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-stone-800 dark:text-zinc-200 mb-3 uppercase tracking-wider text-[10px]">Locations</h4>
            <ul className="space-y-2 text-stone-500 dark:text-zinc-400">
              <li>Maitama Stays</li>
              <li>Asokoro Luxury Suites</li>
              <li>Wuse II Business Lofts</li>
              <li>Jabi Lakefront Penthouses</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-stone-800 dark:text-zinc-200 mb-3 uppercase tracking-wider text-[10px]">Support & Safety</h4>
            <ul className="space-y-2 text-stone-500 dark:text-zinc-400">
              <li>24/7 Guest Assistance</li>
              <li>Security & Armed Escort</li>
              <li>Booking Policies & Refunds</li>
              <li>COVID Safety Protocols</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-stone-800 dark:text-zinc-200 mb-3 uppercase tracking-wider text-[10px]">Contact Us</h4>
            <p className="text-stone-500 dark:text-zinc-400 mb-1">📧 reservations@abujashortlet.com</p>
            <p className="text-stone-500 dark:text-zinc-400 mb-1">📞 +234 (0) 90 2345 6789</p>
            <p className="text-stone-400 dark:text-zinc-500 mt-2">📍 Maitama District, Abuja, Nigeria</p>
          </div>
        </div>
        <div className="w-full max-w-6xl mx-auto pt-6 border-t border-stone-200/30 dark:border-zinc-800/30 flex flex-col sm:flex-row justify-between items-center text-[10px] text-stone-400 dark:text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Abuja Shortlet Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Sitemap</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
