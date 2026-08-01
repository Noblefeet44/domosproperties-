"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { LandProperty } from "../data/lands";
import YouTubePlayer from "./YouTubePlayer";
import { getListingCardMedia } from "@/lib/youtube";

export const LandDetailsModal: React.FC = () => {
  const { lands, allAgents, selectedLand, setSelectedLand, addBooking } = useApp();

  const [inspectionDate, setInspectionDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (selectedLand) {
      const today = new Date();
      setInspectionDate(today.toISOString().split("T")[0]);
      setCustomerName("");
      setCustomerPhone("");
      setNotes("");
      setActiveImageIndex(0);
    }
  }, [selectedLand?.id]);

  if (!selectedLand) return null;

  // Find Listing Agent Profile
  const listingAgent = allAgents.find(
    (a) => a.id === selectedLand.agentId || a.whatsapp === selectedLand.agentPhone
  ) || allAgents[0];

  const agentPhone = listingAgent?.whatsapp || selectedLand.agentPhone || "07073537007";
  const agentCleanPhone = agentPhone.replace(/^0/, "");

  // Calculate 3 similar lands from ALL agents
  const similarLands = lands
    .filter((l) => l.id !== selectedLand.id)
    .slice(0, 3);

  const prefilledWhatsappMsg = `Hello ${encodeURIComponent(listingAgent?.name || "Land Agent")}, I want to inspect / buy the Land Plot: ${encodeURIComponent(selectedLand.title)} (${encodeURIComponent(selectedLand.size)}, Document: ${encodeURIComponent(selectedLand.titleDocument)}, Price: ₦${selectedLand.price.toLocaleString()}).%0A%0ABuyer Contact Details:%0AName: ${encodeURIComponent(customerName || "Interested Buyer")}%0APhone: ${encodeURIComponent(customerPhone || "N/A")}%0APreferred Site Inspection Date: ${encodeURIComponent(inspectionDate)}%0ANotes/Inquiry: ${encodeURIComponent(notes || "None")}`;

  const directWhatsappUrl = `https://wa.me/234${agentCleanPhone}?text=${prefilledWhatsappMsg}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/50">
              📐 Land Properties Directory
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {selectedLand.title}
            </h2>
            <p className="text-xs text-slate-500">📍 {selectedLand.location} • {selectedLand.size}</p>
          </div>
          <button
            onClick={() => setSelectedLand(null)}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* 1. Gallery / Video Showcase at top */}
          {(() => {
            const { imageUrl, hasVideo } = getListingCardMedia(selectedLand, "/images/treasure_hostel.png");
            const hasCustomPhotos = selectedLand.images && selectedLand.images.length > 0 && selectedLand.images[0] !== "/images/treasure_hostel.png" && selectedLand.images[0] !== "/images/ehis_hostel.png";
            const displayImg = selectedLand.images?.[activeImageIndex] && selectedLand.images[activeImageIndex] !== "/images/treasure_hostel.png" ? selectedLand.images[activeImageIndex] : imageUrl;
            const showVideo = hasVideo && (!hasCustomPhotos || activeImageIndex === 0);

            return (
              <div className="space-y-3">
                {showVideo ? (
                  <YouTubePlayer
                    videoId={selectedLand.youtubeVideoId}
                    url={selectedLand.youtubeUrl}
                    thumbnailUrl={selectedLand.youtubeThumbnail || imageUrl}
                    title={selectedLand.title}
                  />
                ) : (
                  <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                    <img
                      src={displayImg || imageUrl}
                      alt={selectedLand.title}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  </div>
                )}
              </div>
            );
          })()}

          {/* 2. Land Overview & Document Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Land Description & Title Info</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              {selectedLand.description}
            </p>
          </div>

          {/* 3. Site Inspection Booking Form */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
              Book Physical Land Site Inspection
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

            <div>
              <label className="text-[11px] font-bold block mb-1">Preferred Site Inspection Date *</label>
              <input
                type="date"
                required
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold block mb-1">Additional Notes / Questions</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ask about survey, deed verification, or payment installments..."
                className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-400 block">
                  Total Asking Land Price
                </span>
                <span className="text-2xl font-black text-amber-500">
                  ₦{selectedLand.price.toLocaleString()}
                </span>
              </div>

              <a
                href={directWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>💬</span> Connect with Agent on WhatsApp
              </a>
            </div>
          </div>

          {/* 4. VERIFIED LISTING LAND AGENT BADGE (Placed at bottom!) */}
          {listingAgent && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={listingAgent.profileImage || "/images/treasure_hostel.png"}
                  alt={listingAgent.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      ✓ Verified Real Estate Agent
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
                  <span>📞</span> Call Agent
                </div>
                <span className="text-[11px] font-bold opacity-90">{agentPhone}</span>
              </a>
            </div>
          )}

          {/* 5. SIMILAR LAND PLOTS SECTION (Across all agents) */}
          {similarLands.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>📐</span> Similar Land Plots You Might Like
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {similarLands.map((simLand) => {
                  const simAgent = allAgents.find((a) => a.id === simLand.agentId) || allAgents[0];
                  const { imageUrl: simImgUrl, hasVideo: simHasVideo } = getListingCardMedia(simLand, "/images/treasure_hostel.png");
                  return (
                    <div
                      key={simLand.id}
                      onClick={() => setSelectedLand(simLand)}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-amber-500 cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                        <img
                          src={simImgUrl}
                          alt={simLand.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {simHasVideo && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow flex items-center gap-0.5 border border-rose-400/40">
                            <span>▶</span> Video
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                        {simLand.title}
                      </h4>
                      <p className="text-[11px] font-black text-amber-500">
                        ₦{simLand.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-700/50">
                        <img src={simAgent.profileImage || "/images/treasure_hostel.png"} alt={simAgent.name} className="w-4 h-4 rounded-full object-cover" />
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
