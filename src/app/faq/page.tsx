"use client";

import React, { useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { FAQ } from "../components/FAQ";
import { PropertyDetailsModal } from "../components/PropertyDetailsModal";
import { useApp } from "../context/AppContext";

export default function FAQPage() {
  const { setActiveView } = useApp();

  useEffect(() => {
    setActiveView("faq");
  }, [setActiveView]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
      {/* Announcement Bar */}
      <div className="w-full bg-sky-950 text-sky-200 dark:bg-slate-900 dark:text-sky-300 py-2 px-4 text-center text-[10px] sm:text-xs font-black tracking-widest uppercase border-b border-sky-800 flex justify-center items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
        <span>DOMOS PROPERTY GLOBAL LIMITED • Premium Hostels & Rental Accommodations</span>
      </div>

      <Navbar />

      <main className="flex-1 pb-16">
        <FAQ />
      </main>

      {/* Floating Sticky WhatsApp Button */}
      <a
        href="https://wa.me/2347073537007?text=Hello%20DOMOS%20PROPERTY%20GLOBAL%20LIMITED,%20I%20have%20a%20question."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center gap-2.5 font-black text-xs border-2 border-white dark:border-slate-900 group"
        aria-label="Chat on WhatsApp"
      >
        <span className="text-xl">💬</span>
        <span className="hidden sm:inline">WhatsApp: 07073537007</span>
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
      </a>

      <PropertyDetailsModal />

      {/* Footer */}
      <footer className="border-t border-sky-200/60 dark:border-slate-800 bg-sky-950 text-white py-10 px-4 mt-auto">
        <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[10px] text-sky-300/60 gap-4">
          <p>© {new Date().getFullYear()} DOMOS PROPERTY GLOBAL LIMITED. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Terms & Conditions</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
