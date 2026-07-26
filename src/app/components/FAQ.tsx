"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "all" | "student" | "professional" | "payment" | "security";
}

export const FAQ: React.FC = () => {
  const { setActiveView } = useApp();
  const [openIndex, setOpenIndex] = useState<string | null>("1");
  const [filter, setFilter] = useState<"all" | "student" | "professional" | "payment" | "security">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const faqs: FAQItem[] = [
    {
      id: "1",
      category: "student",
      question: "How does DOMOS PROPERTY help students find affordable hostels in Ekpoma?",
      answer: "We connect students directly with verified student lodges (such as Ehis Hostel, Treasure Hostel, Elite Residence) located near Ambrose Alli University (AAU) main gates and major campus bus stops. You can browse transparent pricing, inspect photos and amenities, apply online, and lock in your room with zero agent markups or extortionate hidden fees."
    },
    {
      id: "2",
      category: "professional",
      question: "Can young professionals or interns find shortlets or long-term apartments here?",
      answer: "Yes! We specialize in executive 1-bedroom apartments, fully-furnished shortlets, and studio suites tailored for young professionals, corporate workers, and interns. Whether you need a place for a month, a full year, or a temporary work contract, we provide flexible lease arrangements."
    },
    {
      id: "3",
      category: "professional",
      question: "Do you offer short-stay hotel rooms or shortlets for daily/weekly stays?",
      answer: "Absolutely. If you are visiting Ekpoma for entrance exams, job interviews, project research, or weekend visits, we offer daily and weekly short-stay hotel lodges and serviced shortlet apartments equipped with AC, backup power, and clean water."
    },
    {
      id: "4",
      category: "payment",
      question: "What is the fee breakdown for renting a hostel or apartment?",
      answer: "Our pricing structure is 100% transparent. The total package includes: (1) Base Rent (per academic session for students or monthly/annually for professionals), (2) Refundable Caution Deposit (held safely and refunded upon lease expiration), and (3) Reservation Hold Deposit. All fees are clearly stated with no surprise charges."
    },
    {
      id: "5",
      category: "payment",
      question: "How and when is the Refundable Caution Fee returned?",
      answer: "Your Caution Deposit is 100% returned to your bank account at the end of your tenancy contract, following a brief joint inspection confirming that room fittings, pre-paid meters, and fixtures are undamaged."
    },
    {
      id: "6",
      category: "security",
      question: "How are properties verified to protect against fake agent fraud?",
      answer: "Every single property listed on DOMOS PROPERTY GLOBAL LIMITED undergoes physical structural and legal verification by our field inspection team in Ekpoma. We confirm property ownership, inspect security gates, verify power and water systems, and conduct all transactions through our official admin channels."
    },
    {
      id: "7",
      category: "security",
      question: "What security measures are in place across managed lodges?",
      answer: "Safety is our priority. Our student lodges and executive residences feature 24/7 uniformed security guards, perimeter fencing with locked security gates, bright compound floodlights, and verified tenant onboarding."
    },
    {
      id: "8",
      category: "student",
      question: "What utilities and facilities are included in student hostels?",
      answer: "Managed student lodges come with continuous industrial borehole water systems, overhead water storage tanks, pre-paid individual electricity meters, tiled floors, private balconies, waste management services, and quiet study areas."
    },
    {
      id: "9",
      category: "student",
      question: "Can I inspect the hostel or shortlet room before paying rent?",
      answer: "Yes! We strongly encourage physical or live video walkthroughs. Simply click 'Chat Agent on WhatsApp' or message us directly on WhatsApp at 07073537007 to schedule a guided tour with our Ekpoma team."
    },
    {
      id: "10",
      category: "payment",
      question: "How do I make a reservation and get my official receipt?",
      answer: "Select your desired property and room number, click 'Book Now', fill out the quick digital Tenant Application Form, and submit. The application summary generates automatically and is sent to Admin WhatsApp (07073537007) for instant confirmation and issuance of your official digital receipt."
    },
    {
      id: "11",
      category: "professional",
      question: "Can two students or young professionals share an apartment to split costs?",
      answer: "Yes, co-living and roommate arrangements are allowed in our self-contained double rooms, 1-bedroom flats, and 2-bedroom executive suites. Shared living is a great way to make quality housing even more affordable."
    },
    {
      id: "12",
      category: "security",
      question: "What should I do if I need maintenance support during my stay?",
      answer: "Our local Ekpoma administrative team is accessible 6 days a week via WhatsApp (07073537007) or phone call. Plumbing, electrical, or structural maintenance requests are handled promptly by verified local technicians."
    }
  ];

  // Filtering by category & search query
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = filter === "all" || faq.category === filter;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 animate-in fade-in duration-300">
      {/* Hero Badge */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-[10px] sm:text-xs bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-slate-700 rounded-full px-4 py-1.5 font-extrabold uppercase tracking-widest inline-block mb-3 shadow-xs">
          ❓ FREQUENTLY ASKED QUESTIONS
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-4">
          Everything You Need to Know About <br />
          <span className="gold-gradient-text">Student Hostels, Rentals & Shortlets</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          Have questions about booking student lodges near AAU, renting shortlet hotel suites as a young professional, caution deposits, or security? We have answers.
        </p>
      </div>

      {/* Real-time FAQ Search Bar */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search FAQ by keywords (e.g. shortlet, caution, water, booking)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3.5 pl-11 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-400 shadow-sm transition-all"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(
          [
            { id: "all", label: "All Questions" },
            { id: "student", label: "🎓 Students & Campus Lodges" },
            { id: "professional", label: "💼 Young Professionals & Shortlets" },
            { id: "payment", label: "💵 Rent & Caution Fees" },
            { id: "security", label: "🛡️ Verification & Security" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              filter === tab.id
                ? "gold-bg-gradient text-white shadow-md border-transparent"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-sky-200 dark:border-slate-800 hover:border-sky-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-4 mb-12">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-dashed border-sky-200 dark:border-slate-800">
            <span className="text-3xl">🔍</span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
              No matching questions found for &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilter("all");
              }}
              className="mt-3 text-xs text-sky-600 dark:text-sky-400 font-bold underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openIndex === faq.id;
            return (
              <div
                key={faq.id}
                className={`glass rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? "border-sky-400 dark:border-slate-700 shadow-md bg-sky-50/40 dark:bg-slate-900/60"
                    : "border-sky-200/60 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/60 hover:border-sky-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : faq.id)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                    <span className="text-sky-500 font-bold">Q.</span>
                    {faq.question}
                  </span>
                  <span
                    className={`w-7 h-7 rounded-full bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 flex items-center justify-center text-xs font-black transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 bg-sky-500 text-white" : ""
                    }`}
                  >
                    ↓
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 border-t border-sky-100 dark:border-slate-800/60 animate-in fade-in duration-200 font-medium">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Have Questions Box */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-sky-200 dark:border-slate-800 text-center bg-sky-50/70 dark:bg-slate-900/70">
        <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mb-1">
          Still Have Unanswered Questions?
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
          Our local Ekpoma housing managers are online on WhatsApp to assist students and young professionals with room walkthroughs, custom lease terms, and booking.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://wa.me/2347073537007?text=Hello%20DOMOS%20PROPERTY%20GLOBAL%20LIMITED%2C%20I%20have%20a%20question%20about%20booking%20a%20hostel%20or%20shortlet."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
          >
            <span>💬 Chat Admin on WhatsApp (07073537007)</span>
          </a>
          <button
            onClick={() => setActiveView("explore")}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer"
          >
            🏫 Browse Hostels & Rentals
          </button>
        </div>
      </div>
    </div>
  );
};
