"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    bookings,
    darkMode,
    toggleDarkMode,
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeBookingsCount = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-sky-200/50 dark:border-slate-800/60 glass shadow-xs px-4 sm:px-8 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => setActiveView("explore")}
      >
        <div className="w-9 h-9 rounded-xl gold-bg-gradient flex items-center justify-center text-white font-black text-sm shadow-md transition-transform group-hover:scale-105">
          DP
        </div>
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-black tracking-tight leading-tight">
            DOMOS <span className="gold-gradient-text">PROPERTY</span>
          </span>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            GLOBAL LIMITED • EKPOMA
          </span>
        </div>
      </div>

      {/* Main Nav Links */}
      <div className="hidden md:flex items-center gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveView("explore")}
          className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
            activeView === "explore"
              ? "gold-bg-gradient text-white shadow-md font-bold"
              : "text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 hover:bg-sky-50/60 dark:hover:bg-slate-800/40"
          }`}
        >
          Explore Hostels
        </button>
        <button
          onClick={() => setActiveView("about")}
          className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
            activeView === "about"
              ? "gold-bg-gradient text-white shadow-md font-bold"
              : "text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 hover:bg-sky-50/60 dark:hover:bg-slate-800/40"
          }`}
        >
          About Us
        </button>
        <button
          onClick={() => setActiveView("faq")}
          className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
            activeView === "faq"
              ? "gold-bg-gradient text-white shadow-md font-bold"
              : "text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 hover:bg-sky-50/60 dark:hover:bg-slate-800/40"
          }`}
        >
          FAQs
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Direct WhatsApp Callout Button */}
        <a
          href="https://wa.me/2347073537007?text=Hello%20DOMOS%20PROPERTY%20GLOBAL%20LIMITED%2C%20I%20want%20to%20inquire%20about%20a%20hostel%20room%20in%20Ekpoma."
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-transform hover:scale-105 shadow-sm"
        >
          <span>💬</span>
          <span>WhatsApp 07073537007</span>
        </a>

        {/* Toggle Theme */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full border border-sky-200/80 dark:border-slate-800 hover:bg-sky-50 dark:hover:bg-slate-800 text-sky-600 dark:text-sky-400 transition-colors cursor-pointer"
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

        {/* User Account / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full border border-sky-200 dark:border-slate-800 hover:shadow-xs transition-shadow cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full gold-bg-gradient text-white flex items-center justify-center font-bold text-xs">
              DP
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-500 mr-1">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2.5 w-60 rounded-2xl glass border border-sky-200 dark:border-slate-800 shadow-xl p-2.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2.5 mb-1.5 border-b border-sky-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">DOMOS PROPERTY</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Ekpoma Hostel Portal</p>
                </div>

                <button
                  onClick={() => {
                    setActiveView("explore");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  🏫 Explore All Hostels
                </button>
                <button
                  onClick={() => {
                    setActiveView("about");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  ℹ️ About DOMOS PROPERTY
                </button>
                <button
                  onClick={() => {
                    setActiveView("faq");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  ❓ Frequently Asked Questions
                </button>

                <div className="border-t border-sky-100 dark:border-slate-800 mt-2 pt-2 space-y-1">
                  <a
                    href="https://wa.me/2347073537007?text=Hello%20DOMOS%20PROPERTY%20GLOBAL%20LIMITED%2C%20I%20want%20to%20speak%20with%20an%20agent."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-1.5"
                  >
                    💬 Contact Landlord / Agent
                  </a>
                  <Link
                    href="/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-extrabold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    🔒 Admin Portal & Applications
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

