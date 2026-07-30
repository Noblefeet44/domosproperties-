"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { SearchBar } from "./SearchBar";
import { PropertyCard } from "./PropertyCard";
import { PropertyDetailsModal } from "./PropertyDetailsModal";
import { HotelCard } from "./HotelCard";
import { HotelDetailsModal } from "./HotelDetailsModal";
import { CarCard } from "./CarCard";
import { CarDetailsModal } from "./CarDetailsModal";
import { LandCard } from "./LandCard";
import { LandDetailsModal } from "./LandDetailsModal";
import { UserDashboard } from "./UserDashboard";
import { HostDashboard } from "./HostDashboard";
import { NeighborhoodMap } from "./NeighborhoodMap";
import { AboutUs } from "./AboutUs";
import { FAQ } from "./FAQ";
import { useApp } from "../context/AppContext";

export function HomePageClient() {
  const {
    properties,
    hotels,
    cars,
    lands,
    activeView,
    searchQuery,
    selectedNeighborhood,
    priceRange,
    guestCount,
  } = useApp();

  const [showMap, setShowMap] = useState(false);

  // 1. Filter Properties (Apartments & Residential)
  const filteredProperties = properties.filter((property) => {
    if (selectedNeighborhood !== "All") {
      const sel = selectedNeighborhood.toLowerCase();
      const matchNeigh = property.neighborhood.toLowerCase().includes(sel);
      const matchLoc = property.location.toLowerCase().includes(sel);
      if (!matchNeigh && !matchLoc) return false;
    }
    if (property.guests < guestCount) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = property.title.toLowerCase().includes(query);
      const matchDesc = property.description.toLowerCase().includes(query);
      const matchAmenities = property.amenities.some((a) => a.toLowerCase().includes(query));
      if (!matchTitle && !matchDesc && !matchAmenities) return false;
    }
    return true;
  });

  // 2. Filter Hotels
  const filteredHotels = hotels.filter((hotel) => {
    if (selectedNeighborhood !== "All") {
      const sel = selectedNeighborhood.toLowerCase();
      const matchNeigh = hotel.neighborhood?.toLowerCase().includes(sel);
      const matchLoc = hotel.location?.toLowerCase().includes(sel);
      if (!matchNeigh && !matchLoc) return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = hotel.title.toLowerCase().includes(query);
      const matchDesc = hotel.description.toLowerCase().includes(query);
      const matchAmenities = hotel.amenities?.some((a) => a.toLowerCase().includes(query));
      if (!matchTitle && !matchDesc && !matchAmenities) return false;
    }
    return true;
  });

  // 3. Filter Cars
  const filteredCars = cars.filter((car) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = car.title.toLowerCase().includes(query);
      const matchMake = car.make.toLowerCase().includes(query);
      const matchModel = car.model.toLowerCase().includes(query);
      const matchDesc = car.description.toLowerCase().includes(query);
      if (!matchTitle && !matchMake && !matchModel && !matchDesc) return false;
    }
    return true;
  });

  // 4. Filter Lands
  const filteredLands = lands.filter((land) => {
    if (selectedNeighborhood !== "All") {
      const sel = selectedNeighborhood.toLowerCase();
      const matchNeigh = land.neighborhood?.toLowerCase().includes(sel);
      const matchLoc = land.location?.toLowerCase().includes(sel);
      if (!matchNeigh && !matchLoc) return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = land.title.toLowerCase().includes(query);
      const matchDesc = land.description.toLowerCase().includes(query);
      const matchDoc = land.titleDocument.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchDoc) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
      {/* Top Announcement Banner */}
      <div className="w-full bg-slate-900 text-sky-200 py-2 px-4 text-center text-[10px] sm:text-xs font-black tracking-widest uppercase border-b border-slate-800 flex justify-center items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        <span>DOMOS PROPERTY GLOBAL LIMITED • Multi-Directory Platform: Apartments, Hotels, Cars & Land</span>
      </div>

      <Navbar />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {/* COMMON HERO SEARCH SECTION */}
        {(activeView === "explore" || activeView === "hotels" || activeView === "cars" || activeView === "land") && (
          <>
            <div className="relative pt-10 pb-6 text-center max-w-4xl mx-auto px-4 space-y-3">
              <span className="text-[10px] sm:text-xs bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-slate-700 rounded-full px-4 py-1.5 font-extrabold uppercase tracking-widest inline-block shadow-xs">
                🇳🇬 EKPOMA • EDO STATE • NIGERIA
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-slate-100">
                DOMOS <span className="gold-gradient-text">PROPERTY DIRECTORY</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
                {activeView === "explore" && "Verified apartments and residential properties near Ambrose Alli University (AAU) campus in Ekpoma."}
                {activeView === "hotels" && "Executive short-stay hotel suites, guest houses, and luxury lodges in Ekpoma and Edo State."}
                {activeView === "cars" && "Verified vehicle sales and daily car hire rentals with chauffeur driver options."}
                {activeView === "land" && "Prime residential and commercial land plots for sale with verified Certificate of Occupancy (C of O) & Deed."}
              </p>
            </div>

            <SearchBar />
          </>
        )}

        {/* VIEW 1: APARTMENTS & PROPERTIES DIRECTORY */}
        {activeView === "explore" && (
          <div className="w-full max-w-6xl mx-auto px-4 mt-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                🏢 Apartments & Residential Properties ({filteredProperties.length})
              </span>
              <button
                onClick={() => setShowMap(!showMap)}
                className="px-3.5 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{showMap ? "📋 Hide Map" : "🗺️ Interactive Ekpoma Map"}</span>
              </button>
            </div>

            {showMap && <NeighborhoodMap properties={filteredProperties} />}

            {filteredProperties.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">No apartments matched your filters.</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting filters to view all apartments.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: HOTELS DIRECTORY */}
        {activeView === "hotels" && (
          <div className="w-full max-w-6xl mx-auto px-4 mt-8 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                🏨 Hotels & Short Stays ({filteredHotels.length})
              </span>
            </div>

            {filteredHotels.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">No hotels matched your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: CARS DIRECTORY */}
        {activeView === "cars" && (
          <div className="w-full max-w-6xl mx-auto px-4 mt-8 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                🚗 Car Sale & Rental Directory ({filteredCars.length})
              </span>
            </div>

            {filteredCars.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">No vehicles matched your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: LAND DIRECTORY */}
        {activeView === "land" && (
          <div className="w-full max-w-6xl mx-auto px-4 mt-8 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                📐 Land Properties & Plots ({filteredLands.length})
              </span>
            </div>

            {filteredLands.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">No land plots matched your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLands.map((land) => (
                  <LandCard key={land.id} land={land} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* OTHER VIEWS */}
        {activeView === "bookings" && <UserDashboard />}
        {activeView === "about" && <AboutUs />}
        {activeView === "faq" && <FAQ />}
      </main>

      {/* ALL DIRECTORY MODALS */}
      <PropertyDetailsModal />
      <HotelDetailsModal />
      <CarDetailsModal />
      <LandDetailsModal />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gold-bg-gradient text-white flex items-center justify-center font-bold text-[10px]">
              DP
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              DOMOS PROPERTY GLOBAL LIMITED
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <a href="mailto:domospropertygloballimited@gmail.com" className="hover:text-amber-500 transition-colors flex items-center gap-1">
              ✉️ domospropertygloballimited@gmail.com
            </a>
            <span>•</span>
            <p>© {new Date().getFullYear()} DOMOS PROPERTY GLOBAL LIMITED. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
