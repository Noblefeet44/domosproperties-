"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Property } from "../data/properties";

export const HostDashboard: React.FC = () => {
  const { properties, addProperty, bookings } = useApp();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [neighborhood, setNeighborhood] = useState<Property["neighborhood"]>("Maitama");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [imageStyle, setImageStyle] = useState<"maitama" | "jabi" | "wuse" | "asokoro">("maitama");
  
  // Amenities list
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
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [notification, setNotification] = useState("");

  // Calculate earnings
  const hostProperties = properties.filter((p) => p.id.length < 8); // Simple logic: base properties + new listings
  const totalHostApartments = hostProperties.length;
  
  // Calculate mock host earnings from reservations
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

    setTimeout(() => {
      setNotification("");
    }, 4000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Host Portal
          </h1>
          <p className="text-sm text-stone-500 mt-1.5">
            Manage your listings and track shortlet earnings in Abuja.
          </p>
        </div>
      </div>

      {/* Host Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50 shadow-xs">
          <p className="text-xs text-stone-400 dark:text-zinc-500 uppercase tracking-widest font-semibold mb-1">Total Earnings</p>
          <p className="text-3xl font-black text-emerald-500">₦{totalEarnings.toLocaleString()}</p>
          <span className="text-[10px] text-stone-400 block mt-2">Payouts processed weekly</span>
        </div>
        <div className="glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50 shadow-xs">
          <p className="text-xs text-stone-400 dark:text-zinc-500 uppercase tracking-widest font-semibold mb-1">Active Listings</p>
          <p className="text-3xl font-black text-stone-900 dark:text-zinc-50">{totalHostApartments}</p>
          <span className="text-[10px] text-stone-400 block mt-2">All locations active and live</span>
        </div>
        <div className="glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50 shadow-xs">
          <p className="text-xs text-stone-400 dark:text-zinc-500 uppercase tracking-widest font-semibold mb-1">Bookings Confirmed</p>
          <p className="text-3xl font-black text-gold">{confirmedReservations.length}</p>
          <span className="text-[10px] text-stone-400 block mt-2">Avg. guest stay: 3.2 days</span>
        </div>
      </div>

      {/* Action Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Add Listing */}
        <div className="lg:col-span-7 glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50">
          <h2 className="text-lg font-bold mb-4">List New Shortlet Apartment</h2>
          
          {notification && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-500/20 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs rounded-xl font-medium">
              ✓ {notification}
            </div>
          )}

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

            {/* Custom Aesthetics: Image Selector based on project generated assets */}
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
                    className={`p-2 rounded-xl border text-center transition-all ${
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

            {/* Amenities Checkboxes */}
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
              className="w-full py-3 rounded-xl bg-stone-900 text-stone-50 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-gold hover:text-white dark:hover:bg-gold dark:hover:text-white font-bold text-xs transition-colors shadow-md"
            >
              Publish Listing
            </button>
          </form>
        </div>

        {/* Right Panel: Host Listings Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50">
            <h2 className="text-base font-bold mb-4">Your Active Apartments</h2>
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {hostProperties.map((property) => (
                <div key={property.id} className="flex gap-3.5 border-b border-stone-100 dark:border-zinc-900 pb-3">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-16 h-16 object-cover rounded-xl shrink-0"
                  />
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold truncate text-stone-800 dark:text-zinc-200">{property.title}</h4>
                    <p className="text-[10px] text-stone-400">{property.location}</p>
                    <div className="flex gap-2.5 mt-1.5">
                      <span className="text-[10px] font-extrabold text-gold">₦{property.price.toLocaleString()}/night</span>
                      <span className="text-[10px] text-stone-400">★ {property.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50">
            <h2 className="text-base font-bold mb-4 font-sans">Recent Booking Activity</h2>
            <div className="space-y-4">
              {confirmedReservations.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6">No reservations confirmed on your properties yet.</p>
              ) : (
                confirmedReservations.slice(0, 3).map((res) => (
                  <div key={res.id} className="flex justify-between items-start text-xs border-b border-stone-100 dark:border-zinc-900 pb-3">
                    <div>
                      <p className="font-bold">{res.propertyName}</p>
                      <p className="text-[10px] text-stone-400">{res.checkIn} to {res.checkOut}</p>
                    </div>
                    <span className="font-extrabold text-emerald-500">₦{res.totalPrice.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
