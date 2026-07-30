"use client";

import React, { useEffect } from "react";
import { Navbar } from "./Navbar";
import { FAQ } from "./FAQ";
import { PropertyDetailsModal } from "./PropertyDetailsModal";
import { useApp } from "../context/AppContext";

export function FAQPageClient() {
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

      <PropertyDetailsModal />

      {/* Footer */}
      <footer className="border-t border-sky-200/60 dark:border-slate-800 bg-sky-950 text-white py-10 px-4 mt-auto">
        <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-sky-300/80 gap-4">
          <a href="mailto:domospropertygloballimited@gmail.com" className="hover:text-amber-300 transition-colors font-bold flex items-center gap-1">
            ✉️ domospropertygloballimited@gmail.com
          </a>
          <p>© {new Date().getFullYear()} DOMOS PROPERTY GLOBAL LIMITED. All rights reserved.</p>
          <div className="flex gap-4 text-[10px] text-sky-300/60">
            <span className="hover:underline cursor-pointer">Terms & Conditions</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
