"use client";

import React from "react";
import { useApp } from "../context/AppContext";

export const SearchBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedNeighborhood,
    setSelectedNeighborhood,
    activeView,
    setActiveView,
    resetFilters,
  } = useApp();

  const neighborhoods = [
    "All",
    "AAU Main Gate",
    "Benin-Auchi Expressway",
    "Ihniduma",
    "University Road",
    "Abuja / Benin City"
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Directory Tab Switcher in Hero */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-full bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 max-w-2xl mx-auto">
        <button
          onClick={() => setActiveView("explore")}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            activeView === "explore"
              ? "gold-bg-gradient text-white shadow-lg scale-105"
              : "text-slate-300 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          🏢 Apartments
        </button>
        <button
          onClick={() => setActiveView("hotels")}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            activeView === "hotels"
              ? "gold-bg-gradient text-white shadow-lg scale-105"
              : "text-slate-300 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          🏨 Hotels
        </button>
        <button
          onClick={() => setActiveView("cars")}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            activeView === "cars"
              ? "gold-bg-gradient text-white shadow-lg scale-105"
              : "text-slate-300 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          🚗 Cars
        </button>
        <button
          onClick={() => setActiveView("land")}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            activeView === "land"
              ? "gold-bg-gradient text-white shadow-lg scale-105"
              : "text-slate-300 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          📐 Land Plots
        </button>
      </div>

      {/* Main Search Input & Filters */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-sky-200/80 dark:border-slate-800 shadow-2xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Keyword Search Input */}
          <div className="md:col-span-7 relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeView === "explore"
                  ? "Search apartments by name, amenities, or location..."
                  : activeView === "hotels"
                  ? "Search hotels by name, pool, breakfast, or area..."
                  : activeView === "cars"
                  ? "Search cars by make, model, Lexus, Toyota..."
                  : "Search land plots by C of O, size, location..."
              }
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Location / Area Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {neighborhoods.map((n, idx) => (
                <option key={idx} value={n}>
                  📍 {n === "All" ? "All Locations" : n}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={resetFilters}
              className="w-full py-3 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer text-center"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
