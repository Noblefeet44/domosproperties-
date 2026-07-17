"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import { Property } from "../data/properties";

export default function AdminPage() {
  const { properties, addProperty, deleteProperty, bookings, darkMode, toggleDarkMode } = useApp();

  // Active sub-view in admin
  const [activeTab, setActiveTab] = useState<"listings" | "add-new" | "bookings">("listings");

  // Form states for adding property
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [neighborhood, setNeighborhood] = useState<Property["neighborhood"]>("Maitama");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [imageStyle, setImageStyle] = useState<"maitama" | "jabi" | "wuse" | "asokoro">("maitama");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [notification, setNotification] = useState("");

  const availableAmenities = [
    "Private Pool",
    "24/7 Solar Backup",
    "Armed Security",
    "Personal Chef",
    "High-speed Fiber",
    "Smart Home",
    "Lake View",
    "Fully Equipped Gym",
    "Outdoor Lounge"
  ];

  // Calculate earnings and counts
  const totalHostApartments = properties.length;
  const confirmedReservations = bookings.filter(b => b.status === "confirmed");
  const totalEarnings = confirmedReservations.reduce((sum, res) => sum + res.totalPrice, 0);

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(item => item !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price || !location) {
      alert("Please fill in all details.");
      return;
    }

    const imagePath = `/images/${imageStyle}.png`;

    addProperty({
      title,
      description,
      price: parseInt(price),
      location,
      neighborhood,
      bedrooms,
      bathrooms,
      guests,
      images: [imagePath],
      amenities: selectedAmenities,
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setPrice("");
    setLocation("");
    setSelectedAmenities([]);
    setNotification("Listing successfully created and published!");
    
    // Switch to listings tab to view new property
    setTimeout(() => {
      setNotification("");
      setActiveTab("listings");
    }, 1500);
  };

  const handleDelete = (propertyId: string, title: string) => {
    if (confirm(`Are you sure you want to delete the listing "${title}"?`)) {
      deleteProperty(propertyId);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-50 flex flex-col font-sans transition-colors duration-300">
      {/* Admin HUD Header */}
      <header className="border-b border-stone-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gold-bg-gradient flex items-center justify-center text-white font-bold shadow-md">
            A
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider uppercase text-stone-850 dark:text-zinc-200">
              Abuja<span className="gold-gradient-text">Shortlet</span>
            </h1>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest leading-none mt-0.5">Admin Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Theme */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full border border-stone-200/60 dark:border-zinc-850 hover:bg-stone-100/50 dark:hover:bg-zinc-900/40 text-stone-600 dark:text-zinc-300 transition-colors cursor-pointer"
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

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
          >
            🏠 Return to Explore
          </Link>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Admin Stats HUD */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50 shadow-xs">
            <p className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-widest font-extrabold mb-1">Estimated Earnings</p>
            <p className="text-3xl font-black text-emerald-500">₦{totalEarnings.toLocaleString()}</p>
            <span className="text-[9px] text-stone-400 block mt-2">Calculated from confirmed shortlet orders</span>
          </div>
          <div className="glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50 shadow-xs">
            <p className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-widest font-extrabold mb-1">Active Directory Listings</p>
            <p className="text-3xl font-black text-stone-900 dark:text-zinc-50">{totalHostApartments}</p>
            <span className="text-[9px] text-stone-400 block mt-2">All shortlets published live</span>
          </div>
          <div className="glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50 shadow-xs">
            <p className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-widest font-extrabold mb-1">Bookings Initiated</p>
            <p className="text-3xl font-black text-gold">{bookings.length}</p>
            <span className="text-[9px] text-stone-400 block mt-2">Total reservations requested via portal</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-4 border-b border-stone-200/40 dark:border-zinc-850 mb-8 text-sm">
          <button
            onClick={() => setActiveTab("listings")}
            className={`pb-2.5 font-bold uppercase tracking-wider text-[11px] transition-colors border-b-2 cursor-pointer ${
              activeTab === "listings"
                ? "border-gold text-gold"
                : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300"
            }`}
          >
            📋 Manage Listings ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab("add-new")}
            className={`pb-2.5 font-bold uppercase tracking-wider text-[11px] transition-colors border-b-2 cursor-pointer ${
              activeTab === "add-new"
                ? "border-gold text-gold"
                : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300"
            }`}
          >
            ➕ List New Shortlet
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-2.5 font-bold uppercase tracking-wider text-[11px] transition-colors border-b-2 cursor-pointer ${
              activeTab === "bookings"
                ? "border-gold text-gold"
                : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300"
            }`}
          >
            ✉️ Recent Booking Invoices ({bookings.length})
          </button>
        </div>

        {/* Success Notifications */}
        {notification && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-500/20 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs rounded-xl font-bold flex items-center gap-2 max-w-lg">
            <span>✓</span> {notification}
          </div>
        )}

        {/* Tab 1: Listings Management */}
        {activeTab === "listings" && (
          <div className="glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50 shadow-xs">
            <h2 className="text-base font-bold mb-4">Published Apartments</h2>
            <div className="space-y-4">
              {properties.length === 0 ? (
                <p className="text-xs text-stone-500 italic py-6 text-center">No properties listed in your directory.</p>
              ) : (
                properties.map((property) => (
                  <div key={property.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200/40 dark:border-zinc-850 pb-4 last:border-0 last:pb-0">
                    <div className="flex gap-4">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded-xl shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-stone-850 dark:text-zinc-200">{property.title}</h4>
                        <p className="text-[10px] text-stone-400">{property.location}</p>
                        <div className="flex gap-3 mt-1.5">
                          <span className="text-[10px] font-extrabold text-gold">₦{property.price.toLocaleString()}/night</span>
                          <span className="text-[10px] text-stone-400">★ {property.rating.toFixed(1)} ({property.reviewsCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(property.id, property.title)}
                      className="px-4 py-2 border border-red-500/20 hover:border-red-500 bg-red-500/5 text-red-500 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Delete Listing
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Listing Form */}
        {activeTab === "add-new" && (
          <div className="glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50 max-w-2xl">
            <h2 className="text-base font-bold mb-4">List New Shortlet Apartment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-1">
                    Apartment Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maitama Executive Suite"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 focus:outline-hidden focus:ring-1 focus:ring-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-1">
                    Neighborhood
                  </label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value as Property["neighborhood"])}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 focus:outline-hidden focus:ring-1 focus:ring-gold"
                  >
                    <option value="Maitama">Maitama</option>
                    <option value="Asokoro">Asokoro</option>
                    <option value="Wuse II">Wuse II</option>
                    <option value="Jabi">Jabi</option>
                    <option value="Garki">Garki</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12 Gana Street, Maitama, Abuja"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 focus:outline-hidden focus:ring-1 focus:ring-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Provide a luxury pitch for your apartment..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 focus:outline-hidden focus:ring-1 focus:ring-gold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-1">
                    Nightly Price (₦)
                  </label>
                  <input
                    type="number"
                    placeholder="120000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 focus:outline-hidden focus:ring-1 focus:ring-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={bedrooms}
                    min={1}
                    onChange={(e) => setBedrooms(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={bathrooms}
                    min={1}
                    step={0.5}
                    onChange={(e) => setBathrooms(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-1">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    value={guests}
                    min={1}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Photo Style Selection */}
              <div>
                <label className="block text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-2">
                  Select Showcase Photo Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { style: "maitama", name: "Maitama Villa" },
                    { style: "jabi", name: "Jabi Lakeview" },
                    { style: "wuse", name: "Wuse Boutique" },
                    { style: "asokoro", name: "Asokoro Royal" }
                  ].map((item) => (
                    <button
                      key={item.style}
                      type="button"
                      onClick={() => setImageStyle(item.style as "maitama" | "jabi" | "wuse" | "asokoro")}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        imageStyle === item.style
                          ? "border-gold bg-gold/10 text-gold font-semibold"
                          : "border-stone-200 dark:border-zinc-800 text-stone-500 hover:bg-stone-100/50"
                      }`}
                    >
                      <img
                        src={`/images/${item.style}.png`}
                        alt={item.name}
                        className="w-full h-12 object-cover rounded-md mb-1"
                      />
                      <span className="text-[10px]">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities checkboxes */}
              <div>
                <label className="block text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-2">
                  Premium Amenities Included
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableAmenities.map((amenity) => {
                    const checked = selectedAmenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-xs cursor-pointer transition-colors ${
                          checked
                            ? "border-gold/60 bg-gold/5 dark:bg-gold/10"
                            : "border-stone-200 dark:border-zinc-800 hover:bg-stone-100/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleAmenityChange(amenity)}
                          className="rounded-sm accent-gold w-3.5 h-3.5"
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-stone-900 text-stone-50 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-gold hover:text-white dark:hover:bg-gold dark:hover:text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
              >
                Publish Listing
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Recent Bookings & Invoices */}
        {activeTab === "bookings" && (
          <div className="glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50 shadow-xs">
            <h2 className="text-base font-bold mb-4">Reservations Logs</h2>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-xs text-stone-500 italic py-6 text-center">No bookings registered on your portal yet.</p>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="border-b border-stone-200/40 dark:border-zinc-850 pb-4 last:border-0 last:pb-0 text-xs">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Reference: {booking.id}</span>
                        <h4 className="font-bold text-stone-850 dark:text-zinc-200 text-sm mt-0.5">{booking.propertyName}</h4>
                        <p className="text-stone-400">{booking.propertyLocation}</p>
                      </div>
                      <span className="text-emerald-500 font-extrabold text-sm">₦{booking.totalPrice.toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-stone-100/50 dark:bg-zinc-900/20 border border-stone-200/30 dark:border-zinc-850 p-3 rounded-xl">
                      <div>
                        <span className="text-[9px] uppercase text-stone-400 block">Check-in</span>
                        <span className="font-medium text-stone-800 dark:text-zinc-200">{booking.checkIn}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-stone-400 block">Check-out</span>
                        <span className="font-medium text-stone-800 dark:text-zinc-200">{booking.checkOut}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-stone-400 block">Guests count</span>
                        <span className="font-medium text-stone-800 dark:text-zinc-200">{booking.guestsCount}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-stone-400 block">Booking Date</span>
                        <span className="font-medium text-stone-800 dark:text-zinc-200">{booking.bookingDate}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-stone-400 block">Status</span>
                        <span className={`text-[10px] font-extrabold uppercase ${
                          booking.status === "confirmed" ? "text-emerald-500" : "text-red-500"
                        }`}>{booking.status}</span>
                      </div>
                    </div>

                    {booking.addons && booking.addons.length > 0 && (
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold text-stone-450 uppercase tracking-widest mr-1.5">Add-ons:</span>
                        {booking.addons.map((a) => (
                          <span key={a.id} className="bg-gold/10 text-gold text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-gold/15">
                            ✦ {a.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
