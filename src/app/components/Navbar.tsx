"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    wishlist,
    bookings,
    darkMode,
    toggleDarkMode,
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeBookingsCount = bookings.filter((b) => b.status === "confirmed").length;
  const wishlistCount = wishlist.length;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-stone-200/50 dark:border-zinc-800/50 glass shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => setActiveView("explore")}
      >
        <div className="w-8 h-8 rounded-lg gold-bg-gradient flex items-center justify-center text-white font-bold shadow-md transition-transform group-hover:scale-105">
          A
        </div>
        <span className="text-xl font-bold tracking-tight font-sans">
          Abuja<span className="gold-gradient-text">Shortlet</span>
        </span>
      </div>

      {/* Main Nav Links */}
      <div className="hidden md:flex items-center gap-1.5 text-sm font-medium">
        <button
          onClick={() => setActiveView("explore")}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            activeView === "explore"
              ? "bg-stone-900 text-stone-50 dark:bg-zinc-50 dark:text-zinc-950 shadow-xs"
              : "text-stone-600 hover:text-stone-950 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-stone-100/50 dark:hover:bg-zinc-800/30"
          }`}
        >
          Explore
        </button>
        <button
          onClick={() => setActiveView("wishlist")}
          className={`px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
            activeView === "wishlist"
              ? "bg-stone-900 text-stone-50 dark:bg-zinc-50 dark:text-zinc-950 shadow-xs"
              : "text-stone-600 hover:text-stone-950 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-stone-100/50 dark:hover:bg-zinc-800/30"
          }`}
        >
          Wishlist
          {wishlistCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full gold-bg-gradient text-[10px] font-bold text-white">
              {wishlistCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveView("bookings")}
          className={`px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
            activeView === "bookings"
              ? "bg-stone-900 text-stone-50 dark:bg-zinc-50 dark:text-zinc-950 shadow-xs"
              : "text-stone-600 hover:text-stone-950 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-stone-100/50 dark:hover:bg-zinc-800/30"
          }`}
        >
          My Bookings
          {activeBookingsCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
              {activeBookingsCount}
            </span>
          )}
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Toggle Theme */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-full border border-stone-200/60 dark:border-zinc-800/60 hover:bg-stone-100/50 dark:hover:bg-zinc-800/40 text-stone-600 dark:text-zinc-300 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          )}
        </button>

        {/* Portal Switch Button */}
        <a
          href="/admin"
          className="hidden sm:flex text-xs font-semibold px-4.5 py-2.5 rounded-full border border-gold/40 hover:border-gold hover:bg-gold/10 text-gold transition-all duration-300 items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5-1.5-3-1m-5.01 4.75h-.01M10.5 8.25h-.01M10.5 12h-.01M10.5 15.75h-.01M1.5 21h1.5m18 0h-1.5" />
          </svg>
          Admin Portal
        </a>

        {/* User Account / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full border border-stone-200 dark:border-zinc-800 hover:shadow-xs transition-shadow"
          >
            <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-stone-700 dark:text-zinc-300 text-xs">
              AI
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-stone-500 mr-1.5">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2.5 w-52 rounded-2xl glass border border-stone-200/60 dark:border-zinc-800/60 shadow-lg p-2.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2.5 mb-1.5 border-b border-stone-200/50 dark:border-zinc-800/50">
                  <p className="text-xs text-stone-400 dark:text-zinc-500">Logged in as</p>
                  <p className="text-sm font-semibold text-stone-800 dark:text-zinc-200 truncate">Alhaji Ibrahim</p>
                </div>
                <button
                  onClick={() => {
                    setActiveView("explore");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-stone-100/60 dark:hover:bg-zinc-800/40 text-stone-700 dark:text-zinc-300 transition-colors"
                >
                  Explore Apartments
                </button>
                <button
                  onClick={() => {
                    setActiveView("wishlist");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-stone-100/60 dark:hover:bg-zinc-800/40 text-stone-700 dark:text-zinc-300 transition-colors flex justify-between items-center"
                >
                  My Wishlist
                  {wishlistCount > 0 && (
                    <span className="h-4.5 min-w-4.5 px-1.5 rounded-full bg-gold/20 text-gold text-[10px] font-bold flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveView("bookings");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-stone-100/60 dark:hover:bg-zinc-800/40 text-stone-700 dark:text-zinc-300 transition-colors flex justify-between items-center"
                >
                  My Bookings
                  {activeBookingsCount > 0 && (
                    <span className="h-4.5 min-w-4.5 px-1.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-bold flex items-center justify-center">
                      {activeBookingsCount}
                    </span>
                  )}
                </button>
                <a
                  href="/admin"
                  className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-stone-100/60 dark:hover:bg-zinc-800/40 text-gold transition-colors md:hidden block"
                >
                  Admin Portal
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
