"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";

interface NeighborhoodGroup {
  zone: string;
  icon: string;
  neighborhoods: string[];
}

const EKPOMA_NEIGHBORHOODS: NeighborhoodGroup[] = [
  {
    zone: "AAU Campus Proximity",
    icon: "🎓",
    neighborhoods: ["AAU Main Gate", "University Road", "Ihniduma"],
  },
  {
    zone: "Town Core & Expressways",
    icon: "📍",
    neighborhoods: ["Benin-Auchi Expressway", "Royal Market", "Emaudo Quarters"],
  },
];

export const SearchBar: React.FC = () => {
  const {
    properties,
    searchQuery,
    setSearchQuery,
    selectedNeighborhood,
    setSelectedNeighborhood,
    priceRange,
    setPriceRange,
    guestCount,
    setGuestCount,
    resetFilters,
  } = useApp();

  const [locationInput, setLocationInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync location input when selectedNeighborhood changes externally or via reset
  useEffect(() => {
    if (selectedNeighborhood === "All") {
      setLocationInput("");
    } else {
      setLocationInput(selectedNeighborhood);
    }
  }, [selectedNeighborhood]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Collect any custom locations from active properties
  const customLocations = Array.from(
    new Set(properties.map((p) => p.neighborhood || p.location).filter(Boolean))
  );

  const query = locationInput.trim().toLowerCase();

  const filteredGroups = EKPOMA_NEIGHBORHOODS.map((group) => {
    const matching = group.neighborhoods.filter((n) =>
      n.toLowerCase().includes(query) || group.zone.toLowerCase().includes(query)
    );
    return { ...group, neighborhoods: matching };
  }).filter((group) => group.neighborhoods.length > 0);

  const matchingCustom = customLocations.filter(
    (loc) =>
      loc.toLowerCase().includes(query) &&
      !EKPOMA_NEIGHBORHOODS.some((g) => g.neighborhoods.some((n) => n.toLowerCase() === loc.toLowerCase()))
  );

  const handleSelectNeighborhood = (neighborhood: string) => {
    setSelectedNeighborhood(neighborhood);
    setLocationInput(neighborhood === "All" ? "" : neighborhood);
    setShowSuggestions(false);
  };

  const handleClearLocation = () => {
    setSelectedNeighborhood("All");
    setLocationInput("");
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-8 px-4">
      <div className="glass rounded-3xl p-6 shadow-md border border-sky-200/70 dark:border-slate-800">
        <h2 className="text-[10px] font-black tracking-widest text-sky-600 dark:text-sky-400 uppercase mb-4 flex items-center gap-1.5">
          <span>🔍</span> Filter Ekpoma Hostels & Property Listings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Keyword Search */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Hostel Name / Keyword
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Ehis, Treasure, Solar Water, Balcony..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-sky-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 focus:outline-hidden focus:ring-2 focus:ring-sky-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Location Autocomplete Input */}
          <div className="md:col-span-3 relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Area / Location in Ekpoma
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. AAU Main Gate, Ihniduma..."
                value={locationInput}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setSelectedNeighborhood(e.target.value || "All");
                  setShowSuggestions(true);
                }}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-sky-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 focus:outline-hidden focus:ring-2 focus:ring-sky-500 transition-colors"
              />
              {locationInput ? (
                <button
                  onClick={handleClearLocation}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Clear location filter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <span className="absolute right-3 top-2.5 text-slate-400 pointer-events-none text-xs">
                  📍
                </span>
              )}
            </div>

            {/* Autocomplete Suggestions Popup */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto p-2 animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={() => handleSelectNeighborhood("All")}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    selectedNeighborhood === "All"
                      ? "gold-bg-gradient text-white"
                      : "hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  🌐 All Ekpoma Locations
                </button>

                {filteredGroups.map((group) => (
                  <div key={group.zone} className="mt-2">
                    <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 border-b border-sky-100 dark:border-slate-800 flex items-center gap-1.5">
                      <span>{group.icon}</span>
                      <span>{group.zone}</span>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {group.neighborhoods.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleSelectNeighborhood(n)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex justify-between items-center cursor-pointer ${
                            selectedNeighborhood.toLowerCase() === n.toLowerCase()
                              ? "gold-bg-gradient text-white font-bold"
                              : "hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          <span>{n}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {matchingCustom.length > 0 && (
                  <div className="mt-2">
                    <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-sky-100">
                      📍 Other Listed Areas
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {matchingCustom.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => handleSelectNeighborhood(loc)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            selectedNeighborhood.toLowerCase() === loc.toLowerCase()
                              ? "gold-bg-gradient text-white font-bold"
                              : "hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Room Capacity */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Occupants
            </label>
            <div className="flex items-center justify-between border border-sky-200 dark:border-slate-800 rounded-xl px-3 py-2 bg-white/90 dark:bg-slate-900/90">
              <button
                type="button"
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="w-7 h-7 rounded-lg bg-sky-100 hover:bg-sky-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-sm font-bold text-sky-800 dark:text-sky-300 transition-colors disabled:opacity-50 cursor-pointer"
                disabled={guestCount <= 1}
              >
                -
              </button>
              <span className="text-xs font-bold">{guestCount} {guestCount === 1 ? "student" : "students"}</span>
              <button
                type="button"
                onClick={() => setGuestCount(guestCount + 1)}
                className="w-7 h-7 rounded-lg bg-sky-100 hover:bg-sky-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-sm font-bold text-sky-800 dark:text-sky-300 transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Max Annual Rent
              </label>
              <span className="text-xs font-black text-sky-600 dark:text-sky-400">
                ₦{priceRange[1].toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="100000"
                max="800000"
                step="25000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-1.5 bg-sky-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-hidden"
              />
              <button
                onClick={() => {
                  resetFilters();
                  setLocationInput("");
                }}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

