"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Hotel } from "../data/hotels";
import YouTubePlayer from "./YouTubePlayer";
import { getListingCardMedia } from "@/lib/youtube";

export const HotelDetailsModal: React.FC = () => {
  const { hotels, allAgents, selectedHotel, setSelectedHotel, addBooking } = useApp();
  const modalContainerRef = React.useRef<HTMLDivElement>(null);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestsCount, setGuestsCount] = useState(2);
  const [selectedRoomName, setSelectedRoomName] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (selectedHotel) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      setCheckIn(today.toISOString().split("T")[0]);
      setCheckOut(tomorrow.toISOString().split("T")[0]);
      setGuestsCount(2);
      setGuestName("");
      setGuestPhone("");
      setSuccessMsg("");
      setActiveImageIndex(0);

      if (selectedHotel.rooms && selectedHotel.rooms.length > 0) {
        setSelectedRoomName(selectedHotel.rooms[0].name);
      } else {
        setSelectedRoomName("Standard Suite");
      }

      if (modalContainerRef.current) {
        modalContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [selectedHotel?.id]);

  if (!selectedHotel) return null;

  // Find Listing Agent Profile
  const listingAgent = allAgents.find(
    (a) => a.id === selectedHotel.agentId || a.whatsapp === selectedHotel.agentPhone
  ) || allAgents[0];

  const agentPhone = listingAgent?.whatsapp || selectedHotel.agentPhone || "07073537007";
  const agentCleanPhone = agentPhone.replace(/^0/, "");

  const activeRoom = selectedHotel.rooms?.find((r) => r.name === selectedRoomName);
  const currentNightlyRate = activeRoom ? activeRoom.price : selectedHotel.pricePerNight;

  // Calculate 3 similar hotels from ALL agents
  const similarHotels = hotels
    .filter((h) => h.id !== selectedHotel.id)
    .sort((a, b) => {
      const aSameNeigh = a.neighborhood === selectedHotel.neighborhood ? 2 : 0;
      const bSameNeigh = b.neighborhood === selectedHotel.neighborhood ? 2 : 0;
      return bSameNeigh - aSameNeigh;
    })
    .slice(0, 3);

  // Calculate Nights Stayed
  const checkInDate = checkIn ? new Date(checkIn) : new Date();
  const checkOutDate = checkOut ? new Date(checkOut) : new Date();
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  const nightsCount = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  const totalCalculated = currentNightlyRate * nightsCount;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    addBooking({
      category: "hotel",
      propertyId: selectedHotel.id,
      propertyName: `${selectedHotel.title} (${selectedRoomName})`,
      propertyImage: activeRoom?.image || selectedHotel.images?.[0] || "/images/ehis_hostel.png",
      propertyLocation: selectedHotel.location,
      checkIn: checkIn || "Standard Stay",
      checkOut: checkOut || "Standard Stay",
      guestsCount,
      totalPrice: totalCalculated,
      guestName,
      guestPhone,
    });

    setSuccessMsg("🎉 Hotel reservation saved successfully!");
  };

  const prefilledWhatsappMsg = `Hello ${encodeURIComponent(listingAgent?.name || "Hotel Manager")}, I want to reserve ${encodeURIComponent(selectedHotel.title)} (${encodeURIComponent(selectedRoomName)}).%0A%0AReservation Details:%0AGuest Name: ${encodeURIComponent(guestName || "Valued Guest")}%0APhone: ${encodeURIComponent(guestPhone || "N/A")}%0ACheck-in: ${encodeURIComponent(checkIn)}%0ACheck-out: ${encodeURIComponent(checkOut)} (${nightsCount} Night(s))%0ANightly Rate: ₦${currentNightlyRate.toLocaleString()}%0ATotal Estimated Amount: ₦${totalCalculated.toLocaleString()}`;

  const directWhatsappUrl = `https://wa.me/234${agentCleanPhone}?text=${prefilledWhatsappMsg}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/50">
              🏨 Hotel & Short Stay Directory
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {selectedHotel.title}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <span>📍</span> {selectedHotel.location}
            </p>
          </div>
          <button
            onClick={() => setSelectedHotel(null)}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div ref={modalContainerRef} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* 1. Gallery / Video Showcase at top */}
          {(() => {
            const { imageUrl, hasVideo } = getListingCardMedia(selectedHotel, "/images/ehis_hostel.png");
            const hasCustomPhotos = selectedHotel.images && selectedHotel.images.length > 0 && selectedHotel.images[0] !== "/images/ehis_hostel.png";
            const displayImg = activeRoom?.image || (selectedHotel.images?.[activeImageIndex] !== "/images/ehis_hostel.png" ? selectedHotel.images?.[activeImageIndex] : imageUrl);
            const showVideo = hasVideo && !activeRoom && (!hasCustomPhotos || activeImageIndex === 0);

            return (
              <div className="space-y-3">
                {showVideo ? (
                  <YouTubePlayer
                    videoId={selectedHotel.youtubeVideoId}
                    url={selectedHotel.youtubeUrl}
                    thumbnailUrl={selectedHotel.youtubeThumbnail || imageUrl}
                    title={selectedHotel.title}
                  />
                ) : (
                  <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                    <img
                      src={displayImg || imageUrl}
                      alt={selectedHotel.title}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  </div>
                )}
              </div>
            );
          })()}

          {/* 2. Hotel Overview & Amenities */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Hotel Overview</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              {selectedHotel.description}
            </p>
          </div>

          {/* 3. Booking Form & Calculator */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-sky-50 dark:from-slate-800/80 dark:to-slate-900 border border-amber-200/80 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Reserve Hotel Room Category
                </h3>
                <p className="text-xs text-slate-500">Select custom room type & calculate stay duration</p>
              </div>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500 text-white text-xs font-bold rounded-xl text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleBooking} className="space-y-4">
              {/* Room Categories Selector */}
              {selectedHotel.rooms && selectedHotel.rooms.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Select Room Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedHotel.rooms.map((room, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedRoomName(room.name)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          selectedRoomName === room.name
                            ? "bg-white dark:bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                            : "bg-white/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {room.image ? (
                            <img src={room.image} alt={room.name} className="w-12 h-12 rounded-xl object-cover border border-amber-300" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-slate-800 flex items-center justify-center text-amber-600 font-bold text-xs">
                              🛏️
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block line-clamp-1">
                              {room.name}
                            </span>
                            <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 block">
                              ₦{room.price.toLocaleString()} / night
                            </span>
                            <span className={`text-[9px] font-extrabold uppercase ${room.status === 'booked' ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {room.status === 'booked' ? '• Booked' : '• Available'}
                            </span>
                          </div>
                        </div>
                        {selectedRoomName === room.name && <span className="text-amber-500 font-black text-sm">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates & Guest info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold block mb-1">Check-in Date *</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold block mb-1">Check-out Date *</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold block mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold block mb-1">WhatsApp Phone</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-amber-400 block">
                    Calculated Stay ({nightsCount} Night(s))
                  </span>
                  <span className="text-xl font-black text-amber-500">
                    ₦{totalCalculated.toLocaleString()}
                  </span>
                </div>

                <a
                  href={directWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <span>💬</span> Book via WhatsApp
                </a>
              </div>
            </form>
          </div>

          {/* 4. VERIFIED LISTING HOTEL AGENT BADGE (Placed at bottom!) */}
          {listingAgent && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={listingAgent.profileImage || "/images/ehis_hostel.png"}
                  alt={listingAgent.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      ✓ Verified Hotel Manager
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
                  <span>📞</span> Call Manager
                </div>
                <span className="text-[11px] font-bold opacity-90">{agentPhone}</span>
              </a>
            </div>
          )}

          {/* 5. SIMILAR HOTELS SECTION (Across all agents) */}
          {similarHotels.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>🏨</span> Similar Hotels & Suites You Might Like
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {similarHotels.map((simHotel) => {
                  const simAgent = allAgents.find((a) => a.id === simHotel.agentId) || allAgents[0];
                  const { imageUrl: simImgUrl, hasVideo: simHasVideo } = getListingCardMedia(simHotel, "/images/ehis_hostel.png");
                  return (
                    <div
                      key={simHotel.id}
                      onClick={() => setSelectedHotel(simHotel)}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-amber-500 cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                        <img
                          src={simImgUrl}
                          alt={simHotel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {simHasVideo && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow flex items-center gap-0.5 border border-rose-400/40">
                            <span>▶</span> Video
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                        {simHotel.title}
                      </h4>
                      <p className="text-[11px] font-black text-amber-500">
                        ₦{simHotel.pricePerNight.toLocaleString()} / night
                      </p>
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-700/50">
                        <img src={simAgent.profileImage || "/images/ehis_hostel.png"} alt={simAgent.name} className="w-4 h-4 rounded-full object-cover" />
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
