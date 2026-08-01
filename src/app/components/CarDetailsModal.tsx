"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Car } from "../data/cars";
import YouTubePlayer from "./YouTubePlayer";
import { getListingCardMedia, isDirectVideoUrl } from "@/lib/youtube";

export const CarDetailsModal: React.FC = () => {
  const { cars, allAgents, selectedCar, setSelectedCar, addBooking } = useApp();
  const modalContainerRef = React.useRef<HTMLDivElement>(null);

  const [rentDays, setRentDays] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (selectedCar) {
      const today = new Date();
      setPickupDate(today.toISOString().split("T")[0]);
      setRentDays(1);
      setCustomerName("");
      setCustomerPhone("");
      setActiveImageIndex(0);

      if (modalContainerRef.current) {
        modalContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [selectedCar?.id]);

  if (!selectedCar) return null;

  // Find Listing Agent / Dealer Profile
  const listingAgent = allAgents.find(
    (a) => a.id === selectedCar.agentId || a.whatsapp === selectedCar.agentPhone
  ) || allAgents[0];

  const agentPhone = listingAgent?.whatsapp || selectedCar.agentPhone || "07073537007";
  const agentCleanPhone = agentPhone.replace(/^0/, "");

  // Calculate 3 similar cars from ALL agents
  const similarCars = cars
    .filter((c) => c.id !== selectedCar.id)
    .slice(0, 3);

  const totalCalculated = selectedCar.listingType === 'rent' ? selectedCar.price * rentDays : selectedCar.price;

  const prefilledWhatsappMsg = `Hello ${encodeURIComponent(listingAgent?.name || "Dealer")}, I am interested in ${selectedCar.listingType === 'rent' ? 'renting' : 'purchasing'} the ${encodeURIComponent(selectedCar.title)} (Price: ₦${selectedCar.price.toLocaleString()}${selectedCar.listingType === 'rent' ? '/day' : ''}).%0A%0ACustomer Details:%0AName: ${encodeURIComponent(customerName || "Valued Buyer")}%0APhone: ${encodeURIComponent(customerPhone || "N/A")}%0APickup Date: ${encodeURIComponent(pickupDate)}%0A${selectedCar.listingType === 'rent' ? `Rental Duration: ${rentDays} Day(s)%0ATotal Estimated Rental Fee: ₦${totalCalculated.toLocaleString()}` : `Total Asking Sale Price: ₦${selectedCar.price.toLocaleString()}`}`;

  const directWhatsappUrl = `https://wa.me/234${agentCleanPhone}?text=${prefilledWhatsappMsg}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20">
          <div>
            <span className={`text-[10px] font-extrabold tracking-widest uppercase text-white px-2.5 py-1 rounded-full ${
              selectedCar.listingType === 'rent' ? 'bg-sky-600' : 'bg-emerald-600'
            }`}>
              🚗 {selectedCar.listingType === 'rent' ? 'Car Rental Directory' : 'Car For Sale Directory'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {selectedCar.title}
            </h2>
            <p className="text-xs text-slate-500">📍 {selectedCar.location} • {selectedCar.year} {selectedCar.make}</p>
          </div>
          <button
            onClick={() => setSelectedCar(null)}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div ref={modalContainerRef} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* 1. Gallery / Video Showcase at top */}
          {(() => {
            const { imageUrl, hasVideo } = getListingCardMedia(selectedCar, "/images/royal_villa.png");
            const hasCustomPhotos = selectedCar.images && selectedCar.images.length > 0 && selectedCar.images[0] !== "/images/royal_villa.png" && selectedCar.images[0] !== "/images/ehis_hostel.png";
            const displayImg = selectedCar.images?.[activeImageIndex] && selectedCar.images[activeImageIndex] !== "/images/royal_villa.png" ? selectedCar.images[activeImageIndex] : imageUrl;
            const showVideo = hasVideo && (!hasCustomPhotos || activeImageIndex === 0);

            return (
              <div className="space-y-3">
                {showVideo ? (
                  <YouTubePlayer
                    videoId={selectedCar.youtubeVideoId}
                    url={selectedCar.youtubeUrl}
                    thumbnailUrl={selectedCar.youtubeThumbnail || imageUrl}
                    title={selectedCar.title}
                  />
                ) : (
                  <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                    {isDirectVideoUrl(displayImg || imageUrl) ? (
                      <video
                        src={`${displayImg || imageUrl}#t=0.5`}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={displayImg || imageUrl}
                        alt={selectedCar.title}
                        className="w-full h-full object-cover transition-all duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/royal_villa.png";
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* 2. Vehicle Description & Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Vehicle Description & Specifications</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              {selectedCar.description}
            </p>
          </div>

          {/* 3. Booking / Buy Action Form */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
              {selectedCar.listingType === 'rent' ? 'Reserve Vehicle for Hire' : 'Inquire to Buy Vehicle'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold block mb-1">WhatsApp Phone *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            {selectedCar.listingType === 'rent' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold block mb-1">Pickup Date *</label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold block mb-1">Rental Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={rentDays}
                    onChange={(e) => setRentDays(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-400 block">
                  {selectedCar.listingType === 'rent' ? `Rental Fee (${rentDays} Day(s))` : 'Outright Purchase Asking Price'}
                </span>
                <span className="text-2xl font-black text-amber-500">
                  ₦{totalCalculated.toLocaleString()}
                </span>
              </div>

              <a
                href={directWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>💬</span> Connect with Dealer on WhatsApp
              </a>
            </div>
          </div>

          {/* 4. VERIFIED LISTING DEALER BADGE (Placed at bottom!) */}
          {listingAgent && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={listingAgent.profileImage || "/images/royal_villa.png"}
                  alt={listingAgent.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      ✓ Verified Vehicle Dealer
                    </span>
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                      {listingAgent.cacNumber}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {listingAgent.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">📍 {listingAgent.officeAddress}</p>
                </div>
              </div>

              <a
                href={`tel:${agentPhone}`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex flex-col items-center justify-center shadow-md transition-all cursor-pointer text-center"
              >
                <div className="flex items-center gap-1 text-xs font-black">
                  <span>📞</span> Call Dealer
                </div>
                <span className="text-[11px] font-bold opacity-90">{agentPhone}</span>
              </a>
            </div>
          )}

          {/* 5. SIMILAR VEHICLES SECTION (Across all agents) */}
          {similarCars.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>🚗</span> Similar Vehicles You Might Like
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {similarCars.map((simCar) => {
                  const simAgent = allAgents.find((a) => a.id === simCar.agentId) || allAgents[0];
                  const { imageUrl: simImgUrl, hasVideo: simHasVideo } = getListingCardMedia(simCar, "/images/royal_villa.png");
                  return (
                    <div
                      key={simCar.id}
                      onClick={() => setSelectedCar(simCar)}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-amber-500 cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                        <img
                          src={simImgUrl}
                          alt={simCar.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {simHasVideo && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow flex items-center gap-0.5 border border-rose-400/40">
                            <span>▶</span> Video
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                        {simCar.title}
                      </h4>
                      <p className="text-[11px] font-black text-amber-500">
                        ₦{simCar.price.toLocaleString()} {simCar.listingType === 'rent' && '/ day'}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-700/50">
                        <img src={simAgent.profileImage || "/images/royal_villa.png"} alt={simAgent.name} className="w-4 h-4 rounded-full object-cover" />
                        <span className="text-[10px] text-slate-400 line-clamp-1">{simAgent.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
