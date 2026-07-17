"use client";

import React from "react";
import { useApp } from "../context/AppContext";

export const SearchBar: React.FC = () => {
  const {
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

  const neighborhoods = ["All", "Maitama", "Asokoro", "Wuse II", "Jabi", "Garki"];

  return (
    <div className="w-full max-w-6xl mx-auto mb-10 px-4">
      <div className="glass rounded-3xl p-6 shadow-md border border-stone-200/50 dark:border-zinc-800/50">
        <h2 className="text-xs font-semibold tracking-widest text-stone-400 dark:text-zinc-500 uppercase mb-4">
          Filter Abuja&apos;s Finest Shortlets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Keyword Search */}
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1.5">
              Search by Keyword
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Pool, Chef, Penthouse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 focus:outline-hidden focus:ring-1 focus:ring-gold/60 focus:border-gold/60 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Neighborhood Select */}
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1.5">
              Location / Area
            </label>
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 focus:outline-hidden focus:ring-1 focus:ring-gold/60 focus:border-gold/60 transition-colors cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px'
              }}
            >
              {neighborhoods.map((nh) => (
                <option key={nh} value={nh} className="dark:bg-zinc-900">
                  {nh === "All" ? "All Abuja Areas" : nh}
                </option>
              ))}
            </select>
          </div>

          {/* Guests Count */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1.5">
              Guests
            </label>
            <div className="flex items-center justify-between border border-stone-200 dark:border-zinc-800 rounded-xl px-3 py-2 bg-stone-50/50 dark:bg-zinc-900/50">
              <button
                type="button"
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="w-7 h-7 rounded-lg bg-stone-200/50 hover:bg-stone-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 flex items-center justify-center text-sm font-semibold transition-colors disabled:opacity-50"
                disabled={guestCount <= 1}
              >
                -
              </button>
              <span className="text-sm font-semibold">{guestCount}</span>
              <button
                type="button"
                onClick={() => setGuestCount(guestCount + 1)}
                className="w-7 h-7 rounded-lg bg-stone-200/50 hover:bg-stone-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 flex items-center justify-center text-sm font-semibold transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400">
                Max Price
              </label>
              <span className="text-xs font-bold text-gold">
                ₦{priceRange[1].toLocaleString()} / night
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50000"
                max="600000"
                step="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold focus:outline-hidden"
              />
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-stone-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:underline transition-colors shrink-0"
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
