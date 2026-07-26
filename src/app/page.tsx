"use client";

import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { SearchBar } from "./components/SearchBar";
import { PropertyCard } from "./components/PropertyCard";
import { PropertyDetailsModal } from "./components/PropertyDetailsModal";
import { UserDashboard } from "./components/UserDashboard";
import { HostDashboard } from "./components/HostDashboard";
import { NeighborhoodMap } from "./components/NeighborhoodMap";
import { AboutUs } from "./components/AboutUs";
import { FAQ } from "./components/FAQ";
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
    // Neighborhood & Location filter
    if (selectedNeighborhood !== "All") {
      const sel = selectedNeighborhood.toLowerCase();
      const matchNeigh = property.neighborhood.toLowerCase().includes(sel);
      const matchLoc = property.location.toLowerCase().includes(sel);
      if (!matchNeigh && !matchLoc) {
        return false;
      }
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
      {/* Top Banner (Company Announcement) */}
      <div className="w-full bg-sky-950 text-sky-200 dark:bg-slate-900 dark:text-sky-300 py-2 px-4 text-center text-[10px] sm:text-xs font-black tracking-widest uppercase border-b border-sky-800 flex justify-center items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
        <span>DOMOS PROPERTY GLOBAL LIMITED • Premium Hostels & Rental Accommodations in Ekpoma</span>
      </div>

      <Navbar />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {activeView === "explore" && (
          <>
            {/* Hero Section */}
            <div className="relative pt-10 pb-8 text-center max-w-4xl mx-auto px-4">
              <span className="text-[10px] sm:text-xs bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-slate-700 rounded-full px-4 py-1.5 font-extrabold uppercase tracking-widest inline-block mb-4 shadow-xs">
                🇳🇬 EKPOMA HOSTEL & PROPERTY MANAGEMENT
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 leading-[1.15] text-slate-900 dark:text-slate-100">
                DOMOS PROPERTY GLOBAL LIMITED <br />
                <span className="gold-gradient-text">Student Hostels & Rentals in Ekpoma</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
                Verified student accommodation near Ambrose Alli University (AAU) campus. Browse Ehis Hostel, Treasure Hostel, Elite Residence, and book your room with guaranteed security and instant WhatsApp verification.
              </p>
            </div>

            {/* Advanced Search Panel */}
            <SearchBar />

            {/* View Switcher Bar (Grid vs Interactive Ekpoma Map) */}
            <div className="w-full max-w-6xl mx-auto px-4 mt-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Featured Ekpoma Hostels ({filteredProperties.length})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="px-4 py-2 rounded-xl bg-sky-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-sky-800 dark:text-sky-300 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border border-sky-300 dark:border-slate-700"
              >
                <span>{showMap ? "📋 Show Hostel List" : "🗺️ View AAU Campus Map"}</span>
              </button>
            </div>

            {/* Properties Grid Area or Map View */}
            <div className="w-full max-w-6xl mx-auto px-4 mt-4">
              {showMap ? (
                <div className="h-[550px] w-full">
                  <NeighborhoodMap properties={filteredProperties} />
                </div>
              ) : (
                <div>
                  {filteredProperties.length === 0 ? (
                    <div className="text-center py-24 bg-sky-50/50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-sky-200 dark:border-slate-800">
                      <span className="text-4xl">🏢</span>
                      <h3 className="text-base font-bold mt-4 text-slate-800 dark:text-slate-200">
                        No matching hostels found in Ekpoma
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Try broadening your budget range, zone, or clearing search filters.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {filteredProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Guide Section */}
            <div className="w-full max-w-6xl mx-auto px-4 mt-16 sm:mt-20">
              <div className="glass rounded-3xl p-6 sm:p-8 border border-sky-200 dark:border-slate-800 relative overflow-hidden bg-sky-50/60 dark:bg-slate-900/60">
                <div className="max-w-xl relative z-10">
                  <span className="text-xs text-sky-600 dark:text-sky-400 uppercase tracking-wider font-black block mb-2">
                    DOMOS PROPERTY GUARANTEE
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-3">
                    Trusted Student Housing & Property Management in Ekpoma
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    DOMOS PROPERTY GLOBAL LIMITED manages premium student hostels (Ehis Hostel, Treasure Hostel, and more) across Ekpoma. We guarantee 24/7 security, steady power supply, clean water, verified room availability, and direct landlord/agent support.
                  </p>
                  <a
                    href="https://wa.me/2347073537007?text=Hello%20DOMOS%20PROPERTY%20GLOBAL%20LIMITED,%20I%20would%20like%20to%20inquire%20about%20hostel%20rooms%20in%20Ekpoma."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-all shadow-md"
                  >
                    <span>💬 Contact Housing Manager on WhatsApp (07073537007)</span>
                  </a>
                </div>
                {/* Visual Accent */}
                <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-sky-400/20 to-transparent pointer-events-none hidden md:block" />
              </div>
            </div>
          </>
        )}

        {activeView === "bookings" && <UserDashboard />}

        {activeView === "host" && <HostDashboard />}

        {activeView === "about" && <AboutUs />}

        {activeView === "faq" && <FAQ />}
      </main>

      {/* Floating Sticky WhatsApp Button (Targeting 07073537007) */}
      <a
        href="https://wa.me/2347073537007?text=Hello%20DOMOS%20PROPERTY%20GLOBAL%20LIMITED,%20I%20need%20assistance%20booking%20a%20hostel%20room%20in%20Ekpoma."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center gap-2.5 font-black text-xs border-2 border-white dark:border-slate-900 group"
        aria-label="Chat on WhatsApp"
      >
        <span className="text-xl">💬</span>
        <span className="hidden sm:inline">WhatsApp: 07073537007</span>
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
      </a>

      {/* Global Property Details Modal */}
      <PropertyDetailsModal />

      {/* Global Footer */}
      <footer className="border-t border-sky-200/60 dark:border-slate-800 bg-sky-950 text-white py-10 px-4 mt-auto">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg gold-bg-gradient flex items-center justify-center text-white font-black text-xs">
                DP
              </div>
              <span className="text-sm font-black tracking-tight text-white">
                DOMOS PROPERTY GLOBAL LIMITED
              </span>
            </div>
            <p className="text-sky-200/80 leading-relaxed">
              Premier Hostels & Property Management company in Ekpoma, Edo State, Nigeria. Specializing in Ehis Hostel, Treasure Hostel, and student accommodation.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-sky-400 mb-3 uppercase tracking-wider text-[10px]">Ekpoma Zones</h4>
            <ul className="space-y-2 text-sky-200/80">
              <li>AAU Main Gate Terminal</li>
              <li>Ihniduma Campus Area</li>
              <li>University Road / Expressway</li>
              <li>Emaudo Quarters</li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sky-400 mb-3 uppercase tracking-wider text-[10px]">Managed Hostels</h4>
            <ul className="space-y-2 text-sky-200/80">
              <li>Ehis Hostel (AAU Main Gate)</li>
              <li>Treasure Hostel (Expressway)</li>
              <li>Elite Residence (Ihniduma)</li>
              <li>Royal Villa (University Road)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sky-400 mb-3 uppercase tracking-wider text-[10px]">Contact & Support</h4>
            <p className="text-sky-200/80 mb-2">📍 Main Office: Ekpoma, Edo State, Nigeria</p>
            <p className="text-sky-200/80 font-bold mb-3">📞 WhatsApp: 07073537007</p>
            <a
              href="https://wa.me/2347073537007"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-[10px] hover:bg-emerald-600 transition-colors"
            >
              Direct WhatsApp Chat →
            </a>
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto pt-6 border-t border-sky-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-sky-300/60 gap-4">
          <p>© {new Date().getFullYear()} DOMOS PROPERTY GLOBAL LIMITED. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Hostel Terms & Conditions</span>
            <span className="hover:underline cursor-pointer">Tenant Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

