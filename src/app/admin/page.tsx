"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import { Property } from "../data/properties";

// Fast client-side canvas image optimizer & downscaler
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export default function AdminPage() {
  const { properties, addProperty, deleteProperty, updateProperty, bookings, darkMode, toggleDarkMode } = useApp();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [shake, setShake] = useState(false);

  // Active sub-view in admin
  const [activeTab, setActiveTab] = useState<"listings" | "add-new" | "bookings">("listings");

  // Form states for adding/editing property
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [cautionFee, setCautionFee] = useState("");
  const [reservationFee, setReservationFee] = useState("");
  const [agencyFee, setAgencyFee] = useState("");
  const [inspectionFee, setInspectionFee] = useState("");
  const [legalFee, setLegalFee] = useState("");
  const [location, setLocation] = useState("");
  const [neighborhood, setNeighborhood] = useState<Property["neighborhood"]>("AAU Main Gate");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [guests, setGuests] = useState(2);
  
  // Custom uploaded image URLs
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [notification, setNotification] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableAmenities = [
    "Private Balcony",
    "High-speed Fiber Wi-Fi",
    "Central Heating",
    "Smart Keyless Entry",
    "Elevator / Lift Access",
    "Concierge Service",
    "Washer & Dryer",
    "Fully Equipped Gym",
    "Underground Garage"
  ];

  // Load authentication status on mount
  useEffect(() => {
    const auth = sessionStorage.getItem("domos_admin_auth") || sessionStorage.getItem("abuja_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPass = process.env.ADMIN_PASSWORD || "Admin@password";
    if (passwordInput === adminPass) {
      sessionStorage.setItem("abuja_admin_auth", "true");
      sessionStorage.setItem("domos_admin_auth", "true");
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const totalCount = uploadedImageUrls.length + files.length;
    if (totalCount > 10) {
      alert("You can upload a maximum of 10 images per listing.");
      return;
    }

    setUploading(true);

    try {
      // Compress and resize selected image files to lightweight JPEGs
      const compressPromises = Array.from(files).map((file) => compressImageFile(file));
      const dataUrls = await Promise.all(compressPromises);
      setUploadedImageUrls((prev) => [...prev, ...dataUrls]);
      setNotification(`${dataUrls.length} photo(s) optimized & uploaded!`);
      setTimeout(() => setNotification(""), 2500);
    } catch (err) {
      console.error("Image processing error:", err);
      alert("Failed to process images. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startEdit = (property: Property) => {
    setEditingPropertyId(property.id);
    setTitle(property.title);
    setDescription(property.description);
    setPrice(property.price.toString());
    setCautionFee(property.cautionFee ? property.cautionFee.toString() : "");
    setReservationFee(property.reservationFee ? property.reservationFee.toString() : "");
    setAgencyFee(property.agencyFee ? property.agencyFee.toString() : "");
    setInspectionFee(property.inspectionFee ? property.inspectionFee.toString() : "");
    setLegalFee(property.legalFee ? property.legalFee.toString() : "");
    setLocation(property.location);
    setNeighborhood(property.neighborhood);
    setBedrooms(property.bedrooms);
    setBathrooms(property.bathrooms);
    setGuests(property.guests);
    setSelectedAmenities(property.amenities);

    // Load existing property images
    setUploadedImageUrls(property.images || []);

    setActiveTab("add-new");
  };

  const resetForm = () => {
    setEditingPropertyId(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setCautionFee("");
    setReservationFee("");
    setAgencyFee("");
    setInspectionFee("");
    setLegalFee("");
    setLocation("");
    setNeighborhood("AAU Main Gate");
    setBedrooms(1);
    setBathrooms(1);
    setGuests(2);
    setUploadedImageUrls([]);
    setSelectedAmenities([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price || !location) {
      alert("Please fill in all details.");
      return;
    }

    if (uploadedImageUrls.length === 0) {
      alert("Please upload at least one showcase image file for your apartment.");
      return;
    }

    const parsedPrice = parseInt(price) || 0;
    const parsedCaution = cautionFee !== "" ? parseInt(cautionFee) || 0 : undefined;
    const parsedReservation = reservationFee !== "" ? parseInt(reservationFee) || 0 : undefined;
    const parsedAgency = agencyFee !== "" ? parseInt(agencyFee) || 0 : undefined;
    const parsedInspection = inspectionFee !== "" ? parseInt(inspectionFee) || 0 : undefined;
    const parsedLegal = legalFee !== "" ? parseInt(legalFee) || 0 : undefined;

    if (editingPropertyId) {
      // Edit Mode
      await updateProperty(editingPropertyId, {
        title,
        description,
        price: parsedPrice,
        cautionFee: parsedCaution,
        reservationFee: parsedReservation,
        agencyFee: parsedAgency,
        inspectionFee: parsedInspection,
        legalFee: parsedLegal,
        location,
        neighborhood,
        bedrooms,
        bathrooms,
        guests,
        images: uploadedImageUrls,
        amenities: selectedAmenities,
      });
      setNotification("Listing successfully updated!");
    } else {
      // Create Mode
      addProperty({
        title,
        description,
        price: parsedPrice,
        cautionFee: parsedCaution,
        reservationFee: parsedReservation,
        agencyFee: parsedAgency,
        inspectionFee: parsedInspection,
        legalFee: parsedLegal,
        location,
        neighborhood,
        bedrooms,
        bathrooms,
        guests,
        images: uploadedImageUrls,
        amenities: selectedAmenities,
      });
      setNotification("Listing successfully created and published!");
    }

    // Clear and redirect
    resetForm();
    setTimeout(() => {
      setNotification("");
      setActiveTab("listings");
    }, 1500);
  };

  const handleDelete = (propertyId: string, titleStr: string) => {
    if (confirm(`Are you sure you want to delete the listing "${titleStr}"?`)) {
      deleteProperty(propertyId);
    }
  };

  // Lock Screen Render
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-50 flex items-center justify-center p-4 transition-colors duration-300">
        <div 
          className={`w-full max-w-md p-8 glass rounded-3xl border border-stone-200/60 dark:border-zinc-850 shadow-xl transition-all ${
            shake ? "animate-bounce" : ""
          }`}
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-2xl gold-bg-gradient flex items-center justify-center text-white text-xl font-bold shadow-md mb-3">
              🔒
            </div>
            <h1 className="text-lg font-extrabold tracking-wider uppercase text-stone-850 dark:text-zinc-200">
              DOMOS <span className="gold-gradient-text">PROPERTY</span>
            </h1>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest leading-none mt-1">Hostel Manager Lock</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                Enter Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                className={`w-full px-4 py-3 text-xs rounded-xl border bg-stone-50/50 dark:bg-zinc-900/50 focus:outline-hidden focus:ring-1 focus:ring-gold ${
                  passwordError 
                    ? "border-red-500 text-red-900 dark:text-red-400" 
                    : "border-stone-200 dark:border-zinc-800"
                }`}
                required
              />
              {passwordError && (
                <span className="text-[9px] font-bold text-red-500 mt-1 block">
                  ✗ Incorrect password. Please try again.
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-stone-900 text-stone-50 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-gold hover:text-white dark:hover:bg-gold dark:hover:text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
            >
              Unlock Workspace
            </button>
          </form>

          <div className="mt-6 text-center border-t border-stone-200/40 dark:border-zinc-850 pt-4">
            <Link href="/" className="text-xs font-semibold text-stone-450 hover:text-gold transition-colors">
              🏠 Return to Explore Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-50 flex flex-col font-sans transition-colors duration-300">
      {/* Admin HUD Header */}
      <header className="border-b border-stone-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gold-bg-gradient flex items-center justify-center text-white font-bold shadow-md">
            D
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider uppercase text-stone-850 dark:text-zinc-200">
              DOMOS <span className="gold-gradient-text">PROPERTY</span>
            </h1>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest leading-none mt-0.5">Global Admin Workspace</p>
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
            <span className="text-[9px] text-stone-400 block mt-2">Calculated from confirmed managed bookings</span>
          </div>
          <div className="glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50 shadow-xs">
            <p className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-widest font-extrabold mb-1">Active Directory Listings</p>
            <p className="text-3xl font-black text-stone-900 dark:text-zinc-50">{totalHostApartments}</p>
            <span className="text-[9px] text-stone-400 block mt-2">All managed residences published live</span>
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
            {editingPropertyId ? "✏️ Edit Residence" : "➕ List New Residence"}
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-2.5 font-bold uppercase tracking-wider text-[11px] transition-colors border-b-2 cursor-pointer ${
              activeTab === "bookings"
                ? "border-gold text-gold"
                : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-zinc-300"
            }`}
          >
            ✉️ Recent Inquiries ({bookings.length})
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
            <h2 className="text-base font-bold mb-4">Published Residences</h2>
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
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px]">
                          <span className="font-extrabold text-sky-600 dark:text-sky-400">Rent: ₦{property.price.toLocaleString()}</span>
                          <span className="text-stone-400">•</span>
                          <span className="text-stone-600 dark:text-zinc-400 font-semibold">Caution: ₦{(property.cautionFee ?? 30000).toLocaleString()}</span>
                          <span className="text-stone-400">•</span>
                          <span className="text-stone-600 dark:text-zinc-400 font-semibold">Hold: ₦{(property.reservationFee ?? 20000).toLocaleString()}</span>
                          <span className="text-stone-400 font-normal">★ {property.rating.toFixed(1)} ({property.reviewsCount})</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(property)}
                        className="px-4 py-2 border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-900 text-stone-600 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Edit Listing
                      </button>
                      <button
                        onClick={() => handleDelete(property.id, property.title)}
                        className="px-4 py-2 border border-red-500/20 hover:border-red-500 bg-red-500/5 text-red-500 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Delete Listing
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Listing Form */}
        {activeTab === "add-new" && (
          <div className="glass rounded-3xl p-6 border border-stone-200/50 dark:border-zinc-800/50 max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold">
                {editingPropertyId ? `Edit Residence: ${title}` : "List New Managed Residence"}
              </h2>
              {editingPropertyId && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab("listings");
                  }}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-1">
                    Apartment Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ehis Executive Hostel Lodge"
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
                    <option value="AAU Main Gate">AAU Main Gate</option>
                    <option value="Benin-Auchi Expressway">Benin-Auchi Expressway</option>
                    <option value="Ihniduma">Ihniduma</option>
                    <option value="University Road">University Road</option>
                    <option value="Royal Market">Royal Market</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. AAU Main Gate, Ekpoma, Edo State"
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
                  placeholder="Provide a luxury pitch for your residence..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 focus:outline-hidden focus:ring-1 focus:ring-gold"
                  required
                />
              </div>

              {/* Financial Fee Breakdown Inputs */}
              <div className="p-4 rounded-2xl bg-stone-100/60 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-stone-800 dark:text-zinc-200 uppercase tracking-wider">
                    💵 Financial & Fee Breakdown (Naira ₦)
                  </h4>
                  <span className="text-[10px] text-stone-400 font-medium">Editable for all new & existing listings</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 dark:text-zinc-400 uppercase mb-1">
                      Annual / Session Rent (₦) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 350000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-gold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 dark:text-zinc-400 uppercase mb-1">
                      Refundable Caution Fee (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="Optional (e.g. 30000)"
                      value={cautionFee}
                      onChange={(e) => setCautionFee(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 dark:text-zinc-400 uppercase mb-1">
                      Reservation / Hold Deposit (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="Optional (e.g. 20000)"
                      value={reservationFee}
                      onChange={(e) => setReservationFee(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 dark:text-zinc-400 uppercase mb-1">
                      Agency Fee (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="Optional (e.g. 15000)"
                      value={agencyFee}
                      onChange={(e) => setAgencyFee(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 dark:text-zinc-400 uppercase mb-1">
                      Inspection Fee (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="Optional (e.g. 5000)"
                      value={inspectionFee}
                      onChange={(e) => setInspectionFee(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 dark:text-zinc-400 uppercase mb-1">
                      Legal Fee (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="Optional (e.g. 10000)"
                      value={legalFee}
                      onChange={(e) => setLegalFee(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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

              {/* Showcase Photos upload section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase">
                    Apartment Showcase Photos ({uploadedImageUrls.length}/10)
                  </label>
                  {uploadedImageUrls.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUploadedImageUrls([])}
                      className="text-[10px] font-bold text-red-500 hover:underline"
                    >
                      Clear All Photos
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {uploadedImageUrls.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 border border-stone-200 dark:border-zinc-850 rounded-2xl bg-stone-50/20 dark:bg-zinc-900/10">
                    {uploadedImageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden group border border-stone-200 dark:border-zinc-800">
                        <img
                          src={url}
                          alt={`Showcase ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedImageUrls((prev) => prev.filter((_, idx) => idx !== index));
                          }}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer transition-colors"
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Add More button inside grid if less than 10 */}
                    {uploadedImageUrls.length < 10 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-video sm:aspect-square rounded-xl border-2 border-dashed border-stone-200 dark:border-zinc-850 hover:border-gold dark:hover:border-gold flex flex-col items-center justify-center gap-1 hover:bg-stone-100/50 dark:hover:bg-zinc-900/30 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <span className="text-lg text-stone-400 dark:text-zinc-500">+</span>
                        <span className="text-[9px] font-bold text-stone-500 dark:text-zinc-400">
                          {uploading ? "Uploading..." : "Add Photo"}
                        </span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-stone-200 dark:border-zinc-850 hover:border-gold dark:hover:border-gold rounded-2xl bg-stone-50/30 dark:bg-zinc-900/10 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-zinc-900 flex items-center justify-center text-base shadow-sm mb-3">
                      📷
                    </div>
                    <p className="text-xs font-bold">
                      {uploading ? "Uploading images..." : "Click to upload up to 10 photos"}
                    </p>
                    <p className="text-[9px] text-stone-400 mt-1">
                      Drag & drop or select multiple files. Images will host permanently on Airtable.
                    </p>
                  </div>
                )}
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
                {editingPropertyId ? "Save Changes & Update" : "Publish Listing"}
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

                    {/* Guest details if available */}
                    {(booking.guestName || booking.guestPhone) && (
                      <div className="mt-2.5 flex items-center gap-3">
                        <span className="text-[9px] font-bold text-stone-450 uppercase tracking-widest">Guest Info:</span>
                        {booking.guestName && (
                          <span className="text-[10px] text-stone-600 dark:text-zinc-400">👤 {booking.guestName}</span>
                        )}
                        {booking.guestPhone && (
                          <span className="text-[10px] text-stone-650 dark:text-zinc-350">💬 {booking.guestPhone}</span>
                        )}
                      </div>
                    )}

                    {booking.addons && booking.addons.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
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
