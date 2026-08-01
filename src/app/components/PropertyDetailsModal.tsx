"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Property } from "../data/properties";
import YouTubePlayer from "./YouTubePlayer";
import { getListingCardMedia } from "@/lib/youtube";

export const PropertyDetailsModal: React.FC = () => {
  const { properties, allAgents, selectedProperty, setSelectedProperty, addBooking } = useApp();
  const modalContainerRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState<"details" | "apply" | "payment" | "success">("details");
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");

  // Tenant Application Form Fields
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [propertyType, setPropertyType] = useState("Self-Contained Single Room Lodge");
  const [preferredLocation, setPreferredLocation] = useState("AAU Main Gate Area");
  const [occupation, setOccupation] = useState("");
  const [agreeInspectionFee, setAgreeInspectionFee] = useState(false);
  const [moveInDate, setMoveInDate] = useState("");

  // Dynamic Fee Selection Checkboxes
  const [payRent, setPayRent] = useState(true);
  const [payCaution, setPayCaution] = useState(true);
  const [payReservation, setPayReservation] = useState(true);
  const [payAgency, setPayAgency] = useState(true);
  const [payInspection, setPayInspection] = useState(true);
  const [payLegal, setPayLegal] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Reset form when selected property changes
  useEffect(() => {
    if (selectedProperty) {
      const today = new Date();
      setMoveInDate(today.toISOString().split("T")[0]);
      setStep("details");
      setActiveTab("overview");
      setSelectedImageIdx(0);
      setErrorMessage("");
      setFullName("");
      setWhatsapp("");
      setPropertyType("Self-Contained Single Room Lodge");
      setPreferredLocation(selectedProperty.neighborhood || "AAU Main Gate Area");
      setOccupation("");
      setAgreeInspectionFee(false);
      setPayRent(true);
      setPayCaution(true);
      setPayReservation(true);
      setPayAgency(true);
      setPayInspection(true);
      setPayLegal(true);

      if (modalContainerRef.current) {
        modalContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [selectedProperty?.id]);

  if (!selectedProperty) return null;

  // Find Listing Agent Profile
  const listingAgent = allAgents.find(
    (a) => a.id === selectedProperty.agentId || a.whatsapp === selectedProperty.agentPhone
  ) || allAgents[0];

  const agentPhone = listingAgent?.whatsapp || selectedProperty.agentPhone || "07073537007";
  const agentCleanPhone = agentPhone.replace(/^0/, "");

  // Calculate 3 similar property suggestions from ALL agents
  const similarProperties = properties
    .filter((p) => p.id !== selectedProperty.id)
    .sort((a, b) => {
      const aSameNeigh = a.neighborhood === selectedProperty.neighborhood ? 2 : 0;
      const bSameNeigh = b.neighborhood === selectedProperty.neighborhood ? 2 : 0;
      const aPriceDiff = Math.abs(a.price - selectedProperty.price);
      const bPriceDiff = Math.abs(b.price - selectedProperty.price);
      return (bSameNeigh - aSameNeigh) || (aPriceDiff - bPriceDiff);
    })
    .slice(0, 3);

  // Fee Calculations
  const rentFeeAmount = selectedProperty.price;
  const cautionFeeAmount = selectedProperty.cautionFee && selectedProperty.cautionFee > 0 ? selectedProperty.cautionFee : 0;
  const reservationFeeAmount = selectedProperty.reservationFee && selectedProperty.reservationFee > 0 ? selectedProperty.reservationFee : 0;
  const agencyFeeAmount = selectedProperty.agencyFee && selectedProperty.agencyFee > 0 ? selectedProperty.agencyFee : 0;
  const inspectionFeeAmount = selectedProperty.inspectionFee && selectedProperty.inspectionFee > 0 ? selectedProperty.inspectionFee : 0;
  const legalFeeAmount = selectedProperty.legalFee && selectedProperty.legalFee > 0 ? selectedProperty.legalFee : 0;

  const totalCalculatedPayment = 
    (payRent ? rentFeeAmount : 0) +
    (cautionFeeAmount > 0 && payCaution ? cautionFeeAmount : 0) +
    (reservationFeeAmount > 0 && payReservation ? reservationFeeAmount : 0) +
    (agencyFeeAmount > 0 && payAgency ? agencyFeeAmount : 0) +
    (inspectionFeeAmount > 0 && payInspection ? inspectionFeeAmount : 0) +
    (legalFeeAmount > 0 && payLegal ? legalFeeAmount : 0);

  const handleSelectSimilarProperty = (prop: Property) => {
    setSelectedProperty(prop);
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !whatsapp.trim() || !moveInDate) {
      setErrorMessage("Please fill in all mandatory contact fields.");
      return;
    }
    setErrorMessage("");
    setStep("payment");
  };

  const prefilledWhatsappMsg = `Hello ${encodeURIComponent(listingAgent?.name || "Agent")}, I am inquiring about leasing ${encodeURIComponent(selectedProperty?.title || "")} at ${encodeURIComponent(selectedProperty?.location || "")}.%0A%0A👤 Applicant Details:%0A- Name: ${encodeURIComponent(fullName || "Valued Prospect")}%0A- Phone/WhatsApp: ${encodeURIComponent(whatsapp || "N/A")}%0A- Occupation: ${encodeURIComponent(occupation || "N/A")}%0A- Move-In Date: ${encodeURIComponent(moveInDate || "Immediate")}%0A%0A💰 Fee Breakdown:%0A- Annual Rent: ₦${rentFeeAmount.toLocaleString()}${legalFeeAmount > 0 ? `%0A- Legal Fee: ₦${legalFeeAmount.toLocaleString()}` : ""}${inspectionFeeAmount > 0 ? `%0A- Inspection Fee: ₦${inspectionFeeAmount.toLocaleString()}` : ""}${agencyFeeAmount > 0 ? `%0A- Agency Fee: ₦${agencyFeeAmount.toLocaleString()}` : ""}${cautionFeeAmount > 0 ? `%0A- Caution Deposit: ₦${cautionFeeAmount.toLocaleString()}` : ""}${reservationFeeAmount > 0 ? `%0A- Reservation Deposit: ₦${reservationFeeAmount.toLocaleString()}` : ""}%0A%0ATotal Package Amount: ₦${totalCalculatedPayment.toLocaleString()}`;

  const directWhatsappUrl = `https://wa.me/234${agentCleanPhone}?text=${prefilledWhatsappMsg}`;

  const { imageUrl: modalCardImageUrl, hasVideo: modalCardHasVideo } = getListingCardMedia(selectedProperty || {}, "/images/ehis_hostel.png");
  const hasCustomPhotos = Boolean(selectedProperty?.images && selectedProperty.images.length > 0 && selectedProperty.images[0] !== "/images/ehis_hostel.png");
  const showVideoShowcase = modalCardHasVideo && (!hasCustomPhotos || selectedImageIdx === 0);

  if (!selectedProperty) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/50">
              🏢 Apartment Listing
            </span>
            <span className="text-[10px] font-bold text-slate-400 ml-2">
              Ref ID: #{selectedProperty.id}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {selectedProperty.title}
            </h2>
            <p className="text-xs text-slate-500">📍 {selectedProperty.location}</p>
          </div>
          <button
            onClick={() => setSelectedProperty(null)}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* STEP 1: PROPERTY DETAILS VIEW */}
          {step === "details" && (
            <>
              {/* 1. Gallery / Video Showcase at top */}
              <div className="space-y-3">
                {showVideoShowcase ? (
                  <YouTubePlayer
                    videoId={selectedProperty.youtubeVideoId}
                    url={selectedProperty.youtubeUrl}
                    thumbnailUrl={selectedProperty.youtubeThumbnail || modalCardImageUrl}
                    title={selectedProperty.title}
                  />
                ) : (
                  <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                    <img
                      src={selectedProperty.images?.[selectedImageIdx] || modalCardImageUrl}
                      alt={selectedProperty.title}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  </div>
                )}
                {hasCustomPhotos && selectedProperty.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedProperty.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIdx(idx)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                          selectedImageIdx === idx ? "border-amber-500 scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Pricing Banner (Annual Rent + Fee Summary) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-amber-400 block">
                    Annual Rent Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-amber-500">
                      ₦{selectedProperty.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/ session (year)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1 font-medium">
                    Total Package with Fees: <strong className="text-amber-400">₦{totalCalculatedPayment.toLocaleString()}</strong>
                  </span>
                </div>
                <button
                  onClick={() => {
                    setStep("apply");
                    if (modalContainerRef.current) modalContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-5 py-3 rounded-xl gold-bg-gradient font-black text-xs text-white shadow-lg hover:scale-105 transition-transform cursor-pointer"
                >
                  Make Inquiry →
                </button>
              </div>

              {/* Fee Breakdown Overview Box */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/50 border border-amber-200/80 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  📊 Fee & Payment Structure Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Annual Rent</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">₦{rentFeeAmount.toLocaleString()}</span>
                  </div>
                  {legalFeeAmount > 0 && (
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">📜 Legal Fee</span>
                      <span className="font-extrabold text-purple-600 dark:text-purple-400">₦{legalFeeAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {inspectionFeeAmount > 0 && (
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">🔎 Inspection Fee</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₦{inspectionFeeAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {agencyFeeAmount > 0 && (
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">🤝 Agency Fee</span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400">₦{agencyFeeAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {cautionFeeAmount > 0 && (
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">🛡️ Caution Fee</span>
                      <span className="font-extrabold text-sky-600 dark:text-sky-400">₦{cautionFeeAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {reservationFeeAmount > 0 && (
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">📌 Reservation Deposit</span>
                      <span className="font-extrabold text-rose-600 dark:text-rose-400">₦{reservationFeeAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-amber-200/60 dark:border-slate-700 text-xs font-black">
                  <span>Total Initial Package:</span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400">₦{totalCalculatedPayment.toLocaleString()}</span>
                </div>
              </div>

              {/* 3. Details Tabs */}
              <div className="space-y-4">
                <div className="flex border-b border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`pb-3 px-4 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "overview" ? "border-b-2 border-amber-500 text-amber-600 dark:text-amber-400" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Property Description & Amenities
                  </button>
                </div>

                {activeTab === "overview" && (
                  <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {(selectedProperty.youtubeVideoId || selectedProperty.youtubeUrl) && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          <span>Official Video Tour</span>
                        </div>
                        <YouTubePlayer
                          videoId={selectedProperty.youtubeVideoId}
                          url={selectedProperty.youtubeUrl}
                          thumbnailUrl={selectedProperty.youtubeThumbnail}
                          title={selectedProperty.title}
                        />
                      </div>
                    )}
                    <p>{selectedProperty.description}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                      {selectedProperty.amenities?.map((am, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 font-semibold text-slate-800 dark:text-slate-200">
                          ✓ {am}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. VERIFIED LISTING AGENT BADGE */}
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
                          ✓ Verified Listing Agent
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

              {/* 5. SIMILAR APARTMENTS SECTION */}
              {similarProperties.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🏢</span> Similar Apartments & Lodges You Might Like
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {similarProperties.map((simProp) => {
                      const simAgent = allAgents.find((a) => a.id === simProp.agentId) || allAgents[0];
                      return (
                        <div
                          key={simProp.id}
                          onClick={() => handleSelectSimilarProperty(simProp)}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-amber-500 cursor-pointer transition-all space-y-2 group"
                        >
                          <div className="h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                            <img
                              src={simProp.images[0] || "/images/ehis_hostel.png"}
                              alt={simProp.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                            {simProp.title}
                          </h4>
                          <p className="text-[11px] font-black text-amber-500">
                            ₦{simProp.price.toLocaleString()} / year
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
            </>
          )}

          {/* STEP 2: DEDICATED INQUIRY APPLICATION FORM PAGE */}
          {step === "apply" && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-200">
              {/* Back Button Header */}
              <button
                onClick={() => setStep("details")}
                className="text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                ← Back to Property Details
              </button>

              {/* Property Summary Bar */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wide">Inquiring For:</h4>
                  <p className="text-sm font-black line-clamp-1 mt-0.5">{selectedProperty.title}</p>
                  <p className="text-[11px] text-slate-400">📍 {selectedProperty.location}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Package</span>
                  <span className="text-base font-black text-amber-500">₦{totalCalculatedPayment.toLocaleString()}</span>
                </div>
              </div>

              {/* Form Component */}
              <form onSubmit={(e) => {
                e.preventDefault();
                addBooking({
                  propertyId: selectedProperty.id,
                  propertyName: selectedProperty.title,
                  propertyImage: selectedProperty.images[0] || "",
                  propertyLocation: selectedProperty.location,
                  checkIn: moveInDate || new Date().toISOString().split("T")[0],
                  checkOut: moveInDate || new Date().toISOString().split("T")[0],
                  guestsCount: 1,
                  totalPrice: totalCalculatedPayment,
                  guestName: fullName || "Valued Prospect",
                  guestPhone: whatsapp || "N/A",
                  agentId: selectedProperty.agentId,
                });
                window.open(directWhatsappUrl, "_blank");
              }} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                  Tenant Inquiry Application Form
                </h3>

                {errorMessage && (
                  <p className="text-xs text-rose-500 font-bold bg-rose-100 p-2.5 rounded-xl">{errorMessage}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold block mb-1 text-slate-700 dark:text-slate-300">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full p-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold block mb-1 text-slate-700 dark:text-slate-300">WhatsApp Phone *</label>
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="08012345678"
                      className="w-full p-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold block mb-1 text-slate-700 dark:text-slate-300">Occupation / Status</label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="e.g. Student, Businessman, Engineer..."
                      className="w-full p-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold block mb-1 text-slate-700 dark:text-slate-300">Preferred Move-In Date *</label>
                    <input
                      type="date"
                      required
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium"
                    />
                  </div>
                </div>

                {/* Fee Breakdown Summary */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 block text-[11px]">Fee Breakdown Summary:</span>
                  <div className="flex justify-between">
                    <span>Annual Rent:</span>
                    <span className="font-bold">₦{rentFeeAmount.toLocaleString()}</span>
                  </div>
                  {totalCalculatedPayment > rentFeeAmount && (
                    <div className="flex justify-between text-slate-500">
                      <span>Additional Admin Fees:</span>
                      <span className="font-bold">₦{(totalCalculatedPayment - rentFeeAmount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800 font-black text-amber-500">
                    <span>Total Initial Package:</span>
                    <span>₦{totalCalculatedPayment.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={directWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      addBooking({
                        propertyId: selectedProperty.id,
                        propertyName: selectedProperty.title,
                        propertyImage: selectedProperty.images[0] || "",
                        propertyLocation: selectedProperty.location,
                        checkIn: moveInDate || new Date().toISOString().split("T")[0],
                        checkOut: moveInDate || new Date().toISOString().split("T")[0],
                        guestsCount: 1,
                        totalPrice: totalCalculatedPayment,
                        guestName: fullName || "Valued Prospect",
                        guestPhone: whatsapp || "N/A",
                        agentId: selectedProperty.agentId,
                      });
                    }}
                    className="w-full py-4 rounded-xl gold-bg-gradient hover:opacity-95 text-white font-extrabold text-xs text-center flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <span>Proceed with Inquiry →</span>
                  </a>
                </div>
              </form>

              {/* Listing Agent Contact Card */}
              {listingAgent && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={listingAgent.profileImage || "/images/ehis_hostel.png"}
                      alt={listingAgent.name}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-amber-500 shadow-sm"
                    />
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        ✓ Verified Listing Agent
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {listingAgent.name}
                      </h4>
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
            </div>
          )}

                {/* 5. SIMILAR APARTMENTS SECTION (Across all agents) */}
                {similarProperties.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>🏢</span> Similar Apartments & Lodges You Might Like
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {similarProperties.map((simProp) => {
                        const simAgent = allAgents.find((a) => a.id === simProp.agentId) || allAgents[0];
                        const { imageUrl: simImgUrl, hasVideo: simHasVideo } = getListingCardMedia(simProp, "/images/ehis_hostel.png");
                        return (
                          <div
                            key={simProp.id}
                            onClick={() => handleSelectSimilarProperty(simProp)}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-amber-500 cursor-pointer transition-all space-y-2 group"
                          >
                            <div className="h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                              <img
                                src={simImgUrl}
                                alt={simProp.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              {simHasVideo && (
                                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow flex items-center gap-0.5 border border-rose-400/40">
                                  <span>▶</span> Video
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                              {simProp.title}
                            </h4>
                            <p className="text-[11px] font-black text-amber-500">
                              ₦{simProp.price.toLocaleString()} / year
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
