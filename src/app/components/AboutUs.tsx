"use client";

import React from "react";
import { useApp } from "../context/AppContext";

export const AboutUs: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 animate-in fade-in duration-300">
      {/* Hero Badge & Header */}
      <div className="text-center max-w-4xl mx-auto mb-14">
        <span className="text-[10px] sm:text-xs bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-slate-700 rounded-full px-4 py-1.5 font-extrabold uppercase tracking-widest inline-block mb-4 shadow-xs">
          🇳🇬 ABOUT DOMOS PROPERTY GLOBAL LIMITED
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-5">
          Empowering Students & Young Professionals to Find <br className="hidden sm:inline" />
          <span className="gold-gradient-text">Affordable Homes, Hostels & Short-Stay Accommodations</span>
        </h1>
        <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-3xl mx-auto">
          DOMOS PROPERTY GLOBAL LIMITED is the premier real estate and property management platform dedicated to solving housing challenges for university students, young professionals, and visitors in Ekpoma and beyond. Whether you need a long-term student lodge, an executive residential apartment, or a flexible shortlet hotel room, we deliver verified, secure, and budget-friendly living spaces.
        </p>
      </div>

      {/* Stat Callouts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
        <div className="glass rounded-2xl p-5 text-center border border-sky-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-xs">
          <div className="text-2xl sm:text-3xl font-black gold-gradient-text mb-1">100%</div>
          <p className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Physically Verified</p>
          <p className="text-[10px] text-slate-500 mt-1">Zero fraud guarantee</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center border border-sky-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-xs">
          <div className="text-2xl sm:text-3xl font-black gold-gradient-text mb-1">150+</div>
          <p className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Managed Rooms</p>
          <p className="text-[10px] text-slate-500 mt-1">Student & executive suites</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center border border-sky-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-xs">
          <div className="text-2xl sm:text-3xl font-black gold-gradient-text mb-1">500+</div>
          <p className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Happy Tenants</p>
          <p className="text-[10px] text-slate-500 mt-1">Students & professionals</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center border border-sky-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-xs">
          <div className="text-2xl sm:text-3xl font-black gold-gradient-text mb-1">24/7</div>
          <p className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Water & Security</p>
          <p className="text-[10px] text-slate-500 mt-1">Borehole & gated posts</p>
        </div>
      </div>

      {/* Tailored Solutions: Who We Serve */}
      <div className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400 block mb-1">
            TAILORED FOR YOUR NEED
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            Who We Serve & How We Help
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Students */}
          <div className="glass rounded-3xl p-8 border border-sky-200/80 dark:border-slate-800 bg-sky-50/40 dark:bg-slate-900/40 flex flex-col justify-between relative overflow-hidden group hover:border-sky-400 transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl gold-bg-gradient flex items-center justify-center text-white text-2xl mb-6 shadow-md">
                🎓
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 block mb-2">
                FOR UNIVERSITY STUDENTS
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-3">
                Affordable & Secure Student Lodges
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
                We understand how stressful finding accommodation can be for students at Ambrose Alli University (AAU) and surrounding campuses. Our student lodges are located within walking distance or direct shuttle access to campus main gates.
              </p>
              
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200 font-semibold mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-black">✓</span>
                  <span>Academic session & annual flexible payment plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-black">✓</span>
                  <span>Quiet, study-friendly environment with study desks</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-black">✓</span>
                  <span>24/7 Gated security & industrial borehole water supply</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-black">✓</span>
                  <span>Zero extortionate agent markup or surprise levies</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setActiveView("explore")}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Browse Student Hostels</span>
              <span>→</span>
            </button>
          </div>

          {/* Card 2: Young Professionals */}
          <div className="glass rounded-3xl p-8 border border-sky-200/80 dark:border-slate-800 bg-sky-50/40 dark:bg-slate-900/40 flex flex-col justify-between relative overflow-hidden group hover:border-sky-400 transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl gold-bg-gradient flex items-center justify-center text-white text-2xl mb-6 shadow-md">
                💼
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 block mb-2">
                FOR YOUNG PROFESSIONALS & VISITORS
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-3">
                Shortlet Apartments & Executive Rentals
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
                Are you a young professional starting a job, attending a conference, writing exams, or seeking short-term hotel accommodations? We offer fully furnished shortlets, executive studio apartments, and monthly rentals equipped for modern living.
              </p>
              
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200 font-semibold mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-black">✓</span>
                  <span>Flexible daily, weekly, monthly, or long-term lease terms</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-black">✓</span>
                  <span>Furnished options with backup power & solar systems</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-black">✓</span>
                  <span>Ideal for work-from-home, relocation, or short business stays</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-black">✓</span>
                  <span>Instant digital receipts & hassle-free check-in process</span>
                </li>
              </ul>
            </div>

            <a
              href="https://wa.me/2347073537007?text=Hello%20DOMOS%20PROPERTY%2C%20I%20am%20a%20young%20professional%20inquiring%20about%20shortlet%2Frental%20apartments."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>Inquire About Shortlets & Rentals</span>
              <span>💬</span>
            </a>
          </div>
        </div>
      </div>

      {/* Accommodations Offered (Long-term vs Short-stay) */}
      <div className="glass rounded-3xl p-8 sm:p-10 border border-sky-200/80 dark:border-slate-800 mb-16 bg-white/80 dark:bg-slate-900/60 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400 block mb-1">
            FLEXIBLE DURATION OPTIONS
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Choose Your Ideal Stay Duration
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-sky-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-950/50">
            <div className="text-xl mb-3">🗓️</div>
            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-2">
              Academic Session Leases
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Full-year student lodge rentals (12 months) formatted to match university session calendars. Perfect for students seeking continuous residence.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-sky-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-950/50">
            <div className="text-xl mb-3">🏨</div>
            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-2">
              Short-Stay Hotels & Lodges
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Daily or weekly hotel accommodation for entrance exams, convocation ceremonies, project research, or weekend visits.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-sky-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-950/50">
            <div className="text-xl mb-3">🏠</div>
            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-2">
              Long-Term Executive Flats
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Self-contained, 1-bedroom, and 2-bedroom residential apartments tailored for young professionals, corporate workers, and small families.
            </p>
          </div>
        </div>
      </div>

      {/* Core Highlights Grid */}
      <div className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400 block mb-1">
            WHY TENANTS TRUST US
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            The DOMOS PROPERTY Standard
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass rounded-3xl p-6 border border-sky-200/60 dark:border-slate-800 shadow-xs flex flex-col justify-between bg-white/80 dark:bg-slate-900/60">
            <div>
              <div className="w-12 h-12 rounded-2xl gold-bg-gradient flex items-center justify-center text-white text-xl mb-4 shadow-md">
                🛡️
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mb-2">
                100% Verified Lodges & Homes
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Every property (including Ehis Hostel, Treasure Hostel, and Elite Residence) is physically inspected and certified for safety, drainage, and structural integrity before listing.
              </p>
            </div>
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-4 block">
              ✓ Zero Fraud Guarantee
            </span>
          </div>

          <div className="glass rounded-3xl p-6 border border-sky-200/60 dark:border-slate-800 shadow-xs flex flex-col justify-between bg-white/80 dark:bg-slate-900/60">
            <div>
              <div className="w-12 h-12 rounded-2xl gold-bg-gradient flex items-center justify-center text-white text-xl mb-4 shadow-md">
                💡
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mb-2">
                24/7 Power & Water Supply
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Managed properties are equipped with continuous industrial borehole water systems, dedicated pre-paid electricity meters, overhead storage tanks, and backup solar/generators.
              </p>
            </div>
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-4 block">
              ✓ Living & Study Comfort Guaranteed
            </span>
          </div>

          <div className="glass rounded-3xl p-6 border border-sky-200/60 dark:border-slate-800 shadow-xs flex flex-col justify-between bg-white/80 dark:bg-slate-900/60">
            <div>
              <div className="w-12 h-12 rounded-2xl gold-bg-gradient flex items-center justify-center text-white text-xl mb-4 shadow-md">
                💬
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mb-2">
                Direct Admin & Agent Support
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Get instant responses from our dedicated team on WhatsApp (<span className="font-bold">07073537007</span>) for room reservations, maintenance requests, and tenant inquiries.
              </p>
            </div>
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-4 block">
              ✓ Instant WhatsApp Reservation
            </span>
          </div>
        </div>
      </div>

      {/* Corporate Mission & Credentials */}
      <div className="glass rounded-3xl p-8 sm:p-10 border border-sky-200/80 dark:border-slate-800 mb-16 relative overflow-hidden bg-sky-50/50 dark:bg-slate-900/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 block mb-2">
              OUR CORPORATE VISION
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4">
              Eliminating Real Estate Hassles & Fraud
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              DOMOS PROPERTY GLOBAL LIMITED was established to protect students and young professionals from unregistered fake agents, hidden illegal fees, and unhygienic living conditions.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              We manage over 150+ self-contained student rooms, shortlet suites, and executive residential apartments with transparent lease terms, straightforward caution deposit refund procedures, and prompt property maintenance.
            </p>
          </div>

          <div className="space-y-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-sky-200 dark:border-slate-800 shadow-xs">
            <h4 className="text-xs font-extrabold uppercase text-slate-900 dark:text-slate-100 tracking-wider">
              📍 Official Contact & Headquarters
            </h4>
            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <p>🏢 <span className="font-bold text-slate-900 dark:text-slate-100">Registered Firm:</span> DOMOS PROPERTY GLOBAL LIMITED</p>
              <p>📍 <span className="font-bold text-slate-900 dark:text-slate-100">Headquarters:</span> AAU Main Gate Area, Ekpoma, Edo State, Nigeria</p>
              <p>📞 <span className="font-bold text-slate-900 dark:text-slate-100">Admin Hotline:</span> 07073537007</p>
              <p>✉️ <span className="font-bold text-slate-900 dark:text-slate-100">Official Email:</span> <a href="mailto:domospropertygloballimited@gmail.com" className="text-sky-600 dark:text-sky-400 font-bold hover:underline">domospropertygloballimited@gmail.com</a></p>
              <p>⏰ <span className="font-bold text-slate-900 dark:text-slate-100">Official Hours:</span> Monday – Saturday (8:00 AM – 6:00 PM)</p>
            </div>
            
            <a
              href="mailto:domospropertygloballimited@gmail.com?subject=DOMOS%20PROPERTY%20Inquiry"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gold-bg-gradient text-white text-xs font-bold transition-opacity hover:opacity-95 shadow-xs w-full justify-center"
            >
              <span>✉️ Send Email to Housing Management</span>
            </a>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <button
          onClick={() => setActiveView("explore")}
          className="px-8 py-4 rounded-2xl gold-bg-gradient text-white font-black text-xs sm:text-sm shadow-lg hover:opacity-95 transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <span>🏫 Explore Available Hostels & Shortlets Now</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
