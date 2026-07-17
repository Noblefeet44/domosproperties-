"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import { useApp, ConciergeAddon } from "../context/AppContext";

const CONCIERGE_OPTIONS = [
  {
    id: "co-security",
    name: "Armed Police Escort",
    description: "24/7 dedicated armed professional guard escort",
    price: 80000,
    type: "daily" as const,
    icon: "👮‍♂️"
  },
  {
    id: "co-chef",
    name: "Private Culinary Chef",
    description: "Custom premium gourmet local & continental meals",
    price: 50000,
    type: "daily" as const,
    icon: "👨‍🍳"
  },
  {
    id: "co-chauffeur",
    name: "Luxury Chauffeur Service",
    description: "Premium armored SUV with professional driver",
    price: 150000,
    type: "daily" as const,
    icon: "🚘"
  },
  {
    id: "co-airport",
    name: "Airport VIP Meet & Greet",
    description: "Airport terminal clearance, lounge & VIP shuttle",
    price: 30000,
    type: "flat" as const,
    icon: "✈️"
  }
];

export const PropertyDetailsModal: React.FC = () => {
  const { selectedProperty, setSelectedProperty, addBooking } = useApp();
  
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");
  
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<ConciergeAddon[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [bookingId, setBookingId] = useState("");

  // Set default dates (today and tomorrow)
  useEffect(() => {
    if (selectedProperty) {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      setCheckIn(today.toISOString().split("T")[0]);
      setCheckOut(tomorrow.toISOString().split("T")[0]);
      setGuests(1);
      setSelectedAddons([]);
      setGuestName("");
      setGuestPhone("");
      setStep("details");
      setActiveTab("overview");
    }
  }, [selectedProperty]);

  if (!selectedProperty) return null;

  // Calculate nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const subtotal = selectedProperty.price * nights;
  
  // Add-ons total
  const addonsTotal = selectedAddons.reduce((sum, opt) => {
    if (opt.type === "daily") {
      return sum + opt.price * nights;
    }
    return sum + opt.price;
  }, 0);

  const serviceFee = Math.round((subtotal + addonsTotal) * 0.05); // 5% service fee on overall stay
  const total = subtotal + serviceFee + addonsTotal;

  const handleToggleAddon = (opt: typeof CONCIERGE_OPTIONS[number]) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((addon) => addon.id === opt.id);
      if (exists) {
        return prev.filter((addon) => addon.id !== opt.id);
      } else {
        return [...prev, { id: opt.id, name: opt.name, price: opt.price, type: opt.type }];
      }
    });
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      alert("Please fill in your details.");
      return;
    }
    setStep("payment");
  };

  const formatWhatsAppMessage = (bId: string) => {
    const selectedAddonsText = selectedAddons.length > 0 
      ? selectedAddons.map(a => `• ${a.name} (₦${(a.type === 'daily' ? a.price * nights : a.price).toLocaleString()})`).join("\n")
      : "None";

    const message = `🇳🇬 NEW BOOKING REQUEST - ABUJA SHORTLET
----------------------------------------
Booking Ref: ${bId}
Apartment: ${selectedProperty.title}
Location: ${selectedProperty.location}
Check-in: ${checkIn}
Check-out: ${checkOut}
Nights: ${nights} ${nights === 1 ? 'night' : 'nights'}
Guests: ${guests} ${guests === 1 ? 'guest' : 'guests'}

Selected VIP Add-ons:
${selectedAddonsText}

Total Invoice: ₦${total.toLocaleString()}
----------------------------------------
Guest Name: ${guestName}
Guest WhatsApp: ${guestPhone}
----------------------------------------
Please confirm availability and booking details. Thank you!`;

    return encodeURIComponent(message);
  };

  const handleConfirmPayment = () => {
    setPaymentProcessing(true);
    
    // Simulate booking registration
    setTimeout(() => {
      setPaymentProcessing(false);
      const generatedBkId = "BK-" + Math.floor(100000 + Math.random() * 900000);
      setBookingId(generatedBkId);
      
      // Add booking to our state context
      addBooking({
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.title,
        propertyImage: selectedProperty.images[0],
        propertyLocation: selectedProperty.location,
        checkIn,
        checkOut,
        guestsCount: guests,
        totalPrice: total,
        addons: selectedAddons,
        guestName,
        guestPhone,
      });

      // Redirect guest to WhatsApp chat with Host
      const whatsappUrl = `https://wa.me/2347045636039?text=${formatWhatsAppMessage(generatedBkId)}`;
      window.open(whatsappUrl, "_blank");

      setStep("success");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-300">
      <div 
        className="fixed inset-0" 
        onClick={() => setSelectedProperty(null)}
      />

      <div className="relative w-full max-w-4xl bg-stone-50 dark:bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-zinc-800/80 z-10 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProperty(null)}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white z-20 transition-colors"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {step === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Left Column: Image, Details & Reviews Tabs */}
              <div className="p-6 md:p-8 md:col-span-7 border-b md:border-b-0 md:border-r border-stone-200/60 dark:border-zinc-800/60">
                <div className="relative h-60 w-full rounded-2xl overflow-hidden mb-6 shadow-sm">
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest bg-gold px-2.5 py-1 rounded-full">
                      {selectedProperty.neighborhood}
                    </span>
                    <h3 className="text-base font-bold mt-2">{selectedProperty.location}</h3>
                  </div>
                </div>

                {/* Tab Controls */}
                <div className="flex gap-4 border-b border-stone-200/40 dark:border-zinc-800/40 mb-5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                      activeTab === "overview"
                        ? "border-gold text-gold"
                        : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("reviews")}
                    className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
                      activeTab === "reviews"
                        ? "border-gold text-gold"
                        : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300"
                    }`}
                  >
                    Guest Reviews
                    <span className="h-4.5 min-w-4.5 px-1.5 rounded-full bg-stone-200/60 dark:bg-zinc-800/80 text-[10px] text-stone-600 dark:text-zinc-400 font-bold flex items-center justify-center">
                      {selectedProperty.reviews?.length || 0}
                    </span>
                  </button>
                </div>

                {/* Tab content: Overview */}
                {activeTab === "overview" && (
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-zinc-100 mb-3">
                      {selectedProperty.title}
                    </h2>

                    <div className="flex gap-4 text-xs font-medium text-stone-500 dark:text-zinc-400 mb-5 pb-4 border-b border-stone-200/40 dark:border-zinc-800/40">
                      <span>🛏️ {selectedProperty.bedrooms} Bedrooms</span>
                      <span>🛁 {selectedProperty.bathrooms} Bathrooms</span>
                      <span>👥 Up to {selectedProperty.guests} Guests</span>
                    </div>

                    <p className="text-xs leading-relaxed text-stone-600 dark:text-zinc-300 mb-6">
                      {selectedProperty.description}
                    </p>

                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 mb-3">
                        Premium Amenities included:
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProperty.amenities.map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-stone-700 dark:text-zinc-300">
                            <span className="text-gold">✦</span>
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab content: Reviews */}
                {activeTab === "reviews" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-5 p-4 rounded-2xl bg-stone-100/50 dark:bg-zinc-900/30 border border-stone-200/50 dark:border-zinc-850">
                      <div className="text-center">
                        <p className="text-3xl font-black text-stone-900 dark:text-zinc-50">{selectedProperty.rating.toFixed(2)}</p>
                        <div className="flex justify-center text-gold my-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill={i < Math.floor(selectedProperty.rating) ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth={1.5}
                              className="w-3.5 h-3.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.174-.477.892-.477 1.066 0l2.4 4.887 5.392.784c.532.077.744.73.356 1.107l-3.9 3.801.921 5.37c.09.528-.47.935-.945.688l-4.82-2.535-4.82 2.535c-.475.247-1.035-.16-.945-.688l.921-5.37-3.9-3.801c-.388-.378-.176-1.03.356-1.107l5.392-.784 2.4-4.887Z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">{selectedProperty.reviewsCount} reviews</p>
                      </div>
                      <div className="flex-1 border-l border-stone-200/50 dark:border-zinc-800/50 pl-5 text-xs text-stone-500 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-12 shrink-0">Cleanliness</span>
                          <div className="flex-1 h-1.5 rounded-full bg-stone-200 dark:bg-zinc-800 overflow-hidden">
                            <div className="h-full bg-gold" style={{ width: "95%" }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-stone-700 dark:text-zinc-300">4.9</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-12 shrink-0">Location</span>
                          <div className="flex-1 h-1.5 rounded-full bg-stone-200 dark:bg-zinc-800 overflow-hidden">
                            <div className="h-full bg-gold" style={{ width: "98%" }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-stone-700 dark:text-zinc-300">5.0</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-12 shrink-0">Power/WiFi</span>
                          <div className="flex-1 h-1.5 rounded-full bg-stone-200 dark:bg-zinc-800 overflow-hidden">
                            <div className="h-full bg-gold" style={{ width: "96%" }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-stone-700 dark:text-zinc-300">4.8</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                      {selectedProperty.reviews?.length === 0 ? (
                        <p className="text-xs text-stone-500 italic py-4 text-center">No reviews listed yet.</p>
                      ) : (
                        selectedProperty.reviews?.map((review) => (
                          <div key={review.id} className="p-3.5 rounded-xl border border-stone-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/10">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold text-xs">
                                  {review.avatar}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-stone-850 dark:text-zinc-250">{review.guestName}</h4>
                                  <span className="text-[9px] text-stone-400">{review.date}</span>
                                </div>
                              </div>
                              <span className="text-xs font-black text-gold">★ {review.rating.toFixed(1)}</span>
                            </div>
                            <p className="text-xs text-stone-500 dark:text-zinc-400 italic leading-relaxed">
                              &ldquo;{review.comment}&rdquo;
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Checkout Config & VIP Add-ons */}
              <div className="p-6 md:p-8 md:col-span-5 flex flex-col justify-between bg-stone-100/30 dark:bg-zinc-900/10">
                <div>
                  <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-stone-200/40 dark:border-zinc-800/40">
                    <span className="text-sm font-medium text-stone-500 dark:text-zinc-400">Nightly Rate</span>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-stone-900 dark:text-zinc-50">
                        ₦{selectedProperty.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-stone-500 block">per night</span>
                    </div>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-0.5">
                          Check-in
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-gold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-0.5">
                          Check-out
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          min={checkIn || new Date().toISOString().split("T")[0]}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-gold"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="block text-[9px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-0.5">
                          Guests count
                        </label>
                        <select
                          value={guests}
                          onChange={(e) => setGuests(parseInt(e.target.value))}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-gold"
                        >
                          {Array.from({ length: selectedProperty.guests }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n} {n === 1 ? "Guest" : "Guests"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Guest Contact Details */}
                    <div className="grid grid-cols-1 gap-2 border-t border-stone-200/40 dark:border-zinc-800/40 pt-2.5">
                      <div>
                        <label className="block text-[9px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-0.5">
                          Guest Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Alhaji Ibrahim"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-gold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-0.5">
                          WhatsApp Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. 07045636039"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-gold"
                          required
                        />
                      </div>
                    </div>

                    {/* VIP Concierge Add-ons Section */}
                    <div>
                      <label className="block text-[9px] font-bold text-stone-400 dark:text-zinc-500 uppercase mb-1.5">
                        VIP Concierge Add-ons (Optional)
                      </label>
                      <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                        {CONCIERGE_OPTIONS.map((opt) => {
                          const isSelected = selectedAddons.some((a) => a.id === opt.id);
                          return (
                            <button
                              type="button"
                              key={opt.id}
                              onClick={() => handleToggleAddon(opt)}
                              className={`w-full flex items-center justify-between p-2 border rounded-xl text-left transition-all ${
                                isSelected
                                  ? "border-gold/80 bg-gold/5 dark:bg-gold/10 text-stone-900 dark:text-zinc-50"
                                  : "border-stone-200 dark:border-zinc-850 hover:bg-stone-150/40 dark:hover:bg-zinc-900/60 text-stone-600 dark:text-zinc-400"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xs shrink-0">{opt.icon}</span>
                                <div className="truncate">
                                  <p className="text-[10px] font-bold truncate leading-snug">{opt.name}</p>
                                  <p className="text-[8px] text-stone-400 truncate leading-none">{opt.description}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0 ml-2">
                                <p className="text-[10px] font-black text-gold">₦{opt.price.toLocaleString()}</p>
                                <p className="text-[7px] text-stone-400 uppercase tracking-wider">{opt.type === "daily" ? "/day" : "flat"}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="pt-2.5 space-y-1 border-t border-stone-200/40 dark:border-zinc-800/40 text-xs">
                      <div className="flex justify-between text-stone-500 text-[11px]">
                        <span>₦{selectedProperty.price.toLocaleString()} x {nights} nights</span>
                        <span>₦{subtotal.toLocaleString()}</span>
                      </div>
                      
                      {selectedAddons.map((addon) => (
                        <div key={addon.id} className="flex justify-between text-stone-500 text-[10px]">
                          <span>
                            {addon.name} {addon.type === "daily" ? `(₦${addon.price.toLocaleString()} x ${nights} days)` : "(flat fee)"}
                          </span>
                          <span>
                            ₦{(addon.type === "daily" ? addon.price * nights : addon.price).toLocaleString()}
                          </span>
                        </div>
                      ))}

                      <div className="flex justify-between text-stone-500 text-[11px]">
                        <span>Luxury Service Fee (5%)</span>
                        <span>₦{serviceFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-xs text-stone-900 dark:text-zinc-50 pt-1.5 border-t border-dashed border-stone-200 dark:border-zinc-800">
                        <span>Total Invoice</span>
                        <span className="text-gold">₦{total.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-3 py-2.5 rounded-xl bg-stone-900 text-stone-50 hover:bg-gold dark:bg-zinc-550 dark:text-zinc-50 dark:hover:bg-gold dark:hover:text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Reserve Apartment
                    </button>
                  </form>
                </div>

                <p className="text-[8px] text-center text-stone-400 dark:text-zinc-500 mt-4 leading-normal">
                  You won&apos;t be charged yet. The next step will launch your booking request to WhatsApp.
                </p>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="p-8 max-w-md mx-auto text-center">
              <span className="text-4xl block mb-3">💬</span>
              <h2 className="text-lg font-black tracking-tight text-stone-900 dark:text-zinc-150 mb-2">
                WhatsApp Booking Checkout
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed mb-6">
                To guarantee secure VIP service and instantly confirm shortlet availability, click the button below. This will prepare a full invoice detail and redirect to chat with our reservations team on WhatsApp.
              </p>

              {/* Brief Invoice Summary Card */}
              <div className="bg-stone-100 dark:bg-zinc-900/50 rounded-2xl p-4 border border-stone-200/50 dark:border-zinc-800/50 text-left text-xs space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-stone-400">Apartment:</span>
                  <span className="font-bold text-stone-800 dark:text-zinc-200 truncate max-w-[200px]">{selectedProperty.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Dates:</span>
                  <span className="font-medium">{checkIn} to {checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Guest:</span>
                  <span className="font-medium">{guestName} ({guestPhone})</span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="text-[10px] text-stone-450 border-t border-stone-200/40 dark:border-zinc-800/40 pt-1.5">
                    <span className="font-semibold block mb-0.5">Selected Services:</span>
                    <span className="text-gold font-bold">{selectedAddons.map(a => a.name).join(", ")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-dashed border-stone-200 dark:border-zinc-800 pt-2 mt-1">
                  <span>Total Bill:</span>
                  <span className="text-gold">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("details")}
                  className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-900 font-semibold text-xs transition-colors cursor-pointer"
                  disabled={paymentProcessing}
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="flex-[2] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Launching Chat...
                    </>
                  ) : (
                    "Confirm & Book via WhatsApp"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="p-8 text-center max-w-md mx-auto flex flex-col items-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/25 flex items-center justify-center text-emerald-500 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-zinc-100 mb-2">
                WhatsApp Invoice Prepared!
              </h2>
              <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                Your reservation at <span className="font-semibold text-stone-700 dark:text-zinc-300">{selectedProperty.title}</span> has been created on the portal and redirected to WhatsApp.
              </p>

              {/* Receipt detail */}
              <div className="w-full text-left bg-stone-100/50 dark:bg-zinc-900/60 border border-stone-200/50 dark:border-zinc-800/50 rounded-2xl p-5 space-y-2.5 text-xs mb-8 shadow-sm">
                <div className="flex justify-between">
                  <span className="text-stone-400">Booking Reference:</span>
                  <span className="font-bold text-stone-850 dark:text-zinc-200">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Dates:</span>
                  <span className="font-medium text-stone-850 dark:text-zinc-200">{checkIn} to {checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Nights:</span>
                  <span className="font-medium text-stone-850 dark:text-zinc-200">{nights} {nights === 1 ? "night" : "nights"}</span>
                </div>
                
                {selectedAddons.length > 0 && (
                  <div className="border-t border-dashed border-stone-200 dark:border-zinc-800/80 pt-2.5">
                    <span className="text-stone-400 block mb-1">VIP Services Included:</span>
                    <div className="space-y-1 pl-2">
                      {selectedAddons.map((addon) => (
                        <div key={addon.id} className="flex justify-between text-[11px] text-stone-600 dark:text-zinc-300">
                          <span>• {addon.name}</span>
                          <span>₦{(addon.type === "daily" ? addon.price * nights : addon.price).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2.5 border-t border-dashed border-stone-200 dark:border-zinc-800 font-bold text-sm">
                  <span>Amount Due:</span>
                  <span className="text-emerald-500">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2.5 w-full">
                <button
                  onClick={() => {
                    const whatsappUrl = `https://wa.me/2347045636039?text=${formatWhatsAppMessage(bookingId)}`;
                    window.open(whatsappUrl, "_blank");
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  💬 Re-launch WhatsApp Chat
                </button>
                
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="w-full py-2.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-gold hover:text-white dark:hover:bg-gold dark:hover:text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  Back to Explore
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
