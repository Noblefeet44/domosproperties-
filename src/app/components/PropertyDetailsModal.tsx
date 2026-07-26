"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Property } from "../data/properties";

export const PropertyDetailsModal: React.FC = () => {
  const { properties, selectedProperty, setSelectedProperty, addBooking } = useApp();
  const modalContainerRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState<"details" | "apply" | "payment" | "success">("details");
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");

  // Tenant Application Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [institution, setInstitution] = useState("Ambrose Alli University (AAU)");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("100 Level");
  const [guarantorName, setGuarantorName] = useState("");
  const [guarantorPhone, setGuarantorPhone] = useState("");
  const [guarantorRelation, setGuarantorRelation] = useState("Parent / Guardian");
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

  // Calculate 3 similar property suggestions
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

  // Fee Calculations (Only include optional fees if configured by Admin > 0)
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

  const totalBasePackage = 
    rentFeeAmount + cautionFeeAmount + reservationFeeAmount + agencyFeeAmount + inspectionFeeAmount + legalFeeAmount;

  const handleSelectSimilarProperty = (prop: Property) => {
    setSelectedProperty(prop);
    setSelectedImageIdx(0);
    setStep("details");
    setActiveTab("overview");
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleProceedToApplication = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setStep("apply");
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !whatsapp.trim() || !department.trim() || !guarantorName.trim() || !guarantorPhone.trim()) {
      setErrorMessage("Please complete all required fields in the Tenant Application Form.");
      return;
    }
    setErrorMessage("");
    setStep("payment");
  };

  const handleFinalPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCalculatedPayment <= 0) {
      setErrorMessage("Please select at least one payment component to complete your application.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      // 1. Register booking in local app state & API
      await addBooking({
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.title,
        propertyImage: selectedProperty.images[0] || "/images/ehis_hostel.png",
        propertyLocation: selectedProperty.location,
        checkIn: moveInDate,
        checkOut: "Session End (12 Months)",
        guestsCount: 1,
        totalPrice: totalCalculatedPayment,
        guestName: fullName,
        guestPhone: whatsapp,
      });

      setStep("success");

      // 2. Automatically forward complete tenant application details to Admin WhatsApp (07073537007)
      if (typeof window !== "undefined") {
        window.open(directWhatsAppUrl, "_blank");
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Booking Payment Error:", error);
      setErrorMessage(error.message || "Failed to submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Build comprehensive WhatsApp pre-filled message text targeting Admin (07073537007)
  const feeLines = [
    `• Annual Rent: ${payRent ? `₦${rentFeeAmount.toLocaleString()}` : "Not Selected"}`,
    cautionFeeAmount > 0 ? `• Caution Fee (Refundable): ${payCaution ? `₦${cautionFeeAmount.toLocaleString()}` : "Not Selected"}` : null,
    reservationFeeAmount > 0 ? `• Reservation Fee: ${payReservation ? `₦${reservationFeeAmount.toLocaleString()}` : "Not Selected"}` : null,
    agencyFeeAmount > 0 ? `• Agency Fee: ${payAgency ? `₦${agencyFeeAmount.toLocaleString()}` : "Not Selected"}` : null,
    inspectionFeeAmount > 0 ? `• Inspection Fee: ${payInspection ? `₦${inspectionFeeAmount.toLocaleString()}` : "Not Selected"}` : null,
    legalFeeAmount > 0 ? `• Legal Fee: ${payLegal ? `₦${legalFeeAmount.toLocaleString()}` : "Not Selected"}` : null,
  ].filter(Boolean).join("\n");

  const whatsappMsgText = encodeURIComponent(
    `📋 *DOMOS PROPERTY GLOBAL LIMITED — TENANT RENTAL APPLICATION*\n` +
    `--------------------------------------------------\n` +
    `🏠 *PROPERTY:* ${selectedProperty.title}\n` +
    `📍 *LOCATION:* ${selectedProperty.location} (${selectedProperty.neighborhood})\n` +
    `--------------------------------------------------\n` +
    `👤 *TENANT PERSONAL DETAILS:*\n` +
    `• Full Name: ${fullName}\n` +
    `• Email Address: ${email}\n` +
    `• WhatsApp Phone: ${whatsapp}\n` +
    `• Move-in Date: ${moveInDate}\n` +
    `--------------------------------------------------\n` +
    `🎓 *ACADEMIC DETAILS:*\n` +
    `• Institution: ${institution}\n` +
    `• Department / Course: ${department}\n` +
    `• Level of Study: ${level}\n` +
    `--------------------------------------------------\n` +
    `🛡️ *GUARANTOR / PARENT CONTACT:*\n` +
    `• Guarantor Name: ${guarantorName}\n` +
    `• Guarantor Phone: ${guarantorPhone}\n` +
    `• Relationship: ${guarantorRelation}\n` +
    `--------------------------------------------------\n` +
    `💵 *PAYMENT SUMMARY:*\n` +
    `${feeLines}\n` +
    `💰 *TOTAL AMOUNT DUE:* ₦${totalCalculatedPayment.toLocaleString()}\n` +
    `--------------------------------------------------\n` +
    `Kindly review my application & confirm booking. Thank you!`
  );

  const directWhatsAppUrl = `https://wa.me/2347073537007?text=${whatsappMsgText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-300">
      <div 
        className="fixed inset-0" 
        onClick={() => setSelectedProperty(null)}
      />

      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-sky-200 dark:border-slate-800 z-10 max-h-[94vh] flex flex-col">
        {/* Modal Top Header Bar */}
        <div className="px-6 py-3 border-b border-sky-100 dark:border-slate-800 bg-sky-50/70 dark:bg-slate-900 flex justify-between items-center z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-sky-800 dark:text-sky-300">
              DOMOS PROPERTY GLOBAL LIMITED • TENANT PORTAL
            </span>
          </div>

          <button
            onClick={() => setSelectedProperty(null)}
            className="p-1.5 rounded-full bg-sky-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Container */}
        <div ref={modalContainerRef} className="overflow-y-auto flex-1">
          {step === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Left Column: Room Gallery & Tabs */}
              <div className="p-5 md:p-7 md:col-span-7 border-b md:border-b-0 md:border-r border-sky-100 dark:border-slate-800">
                {/* Image Gallery Carousel (Horizontal Sliding with Sideways Arrows) */}
                <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden mb-3 shadow-md group bg-slate-950">
                  <div 
                    className="w-full h-full flex flex-row transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${selectedImageIdx * 100}%)` }}
                  >
                    {(selectedProperty.images && selectedProperty.images.length > 0 
                      ? selectedProperty.images 
                      : ["/images/ehis_hostel.png"]
                    ).map((img, idx) => (
                      <div key={idx} className="w-full h-full shrink-0 relative">
                        <img
                          src={img}
                          alt={`${selectedProperty.title} photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
                      </div>
                    ))}
                  </div>

                  {/* Gradient Overlay & Property Title */}
                  <div className="absolute bottom-4 left-4 text-white z-10 pointer-events-none">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest gold-bg-gradient text-white px-2.5 py-1 rounded-full shadow-xs">
                      📍 {selectedProperty.neighborhood}
                    </span>
                    <h3 className="text-base font-black mt-1 text-white drop-shadow-md">{selectedProperty.title}</h3>
                  </div>

                  {/* Slide Counter Badge */}
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 flex items-center gap-1 border border-white/20">
                    <span>🖼️ Gallery</span>
                    <span>
                      ({selectedImageIdx + 1}/{selectedProperty.images?.length || 1})
                    </span>
                  </div>

                  {/* Sideways Horizontal Navigation Arrows (Left & Right) */}
                  {selectedProperty.images && selectedProperty.images.length > 1 && (
                    <>
                      {/* Left Arrow Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIdx((prev) =>
                            prev === 0 ? selectedProperty.images.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-sky-500 text-white backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer z-20"
                        aria-label="Previous photo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                      </button>

                      {/* Right Arrow Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIdx((prev) =>
                            (prev + 1) % selectedProperty.images.length
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-sky-500 text-white backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer z-20"
                        aria-label="Next photo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {/* Gallery Thumbnails */}
                {selectedProperty.images && selectedProperty.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
                    {selectedProperty.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIdx(idx)}
                        className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          selectedImageIdx === idx 
                            ? "border-sky-500 scale-95 shadow-md" 
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Navigation Tabs */}
                <div className="flex gap-4 border-b border-sky-100 dark:border-slate-800 mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className={`pb-2 text-xs font-black uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                      activeTab === "overview"
                        ? "border-sky-500 text-sky-600 dark:text-sky-400"
                        : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    Overview & Location
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("reviews")}
                    className={`pb-2 text-xs font-black uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                      activeTab === "reviews"
                        ? "border-sky-500 text-sky-600 dark:text-sky-400"
                        : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    Reviews ({selectedProperty.reviews?.length || 0})
                  </button>
                </div>

                {activeTab === "overview" && (
                  <div>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 mb-5">
                      {selectedProperty.description}
                    </p>
                    
                    {/* Google Maps Location Button */}
                    <div className="mb-5 p-3 rounded-2xl bg-sky-50 dark:bg-slate-800/60 border border-sky-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300 block">Google Maps Location</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{selectedProperty.location}</span>
                      </div>
                      <a
                        href={selectedProperty.googleMapsUrl || "https://maps.google.com/?q=Ekpoma+Edo+State"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition-colors shadow-xs flex items-center gap-1"
                      >
                        <span>🗺️ View Map</span>
                      </a>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Hostel Facilities & Amenities:
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProperty.amenities.map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                            <span className="text-sky-500 font-bold">✦</span>
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-3">
                    {selectedProperty.reviews?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-4 text-center">No reviews listed yet.</p>
                    ) : (
                      selectedProperty.reviews?.map((review) => (
                        <div key={review.id} className="p-3.5 rounded-2xl border border-sky-100 dark:border-slate-800 bg-sky-50/30 dark:bg-slate-900/30">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full gold-bg-gradient text-white flex items-center justify-center font-bold text-xs">
                                {review.avatar}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{review.guestName}</h4>
                                <span className="text-[9px] text-slate-400">{review.date}</span>
                              </div>
                            </div>
                            <span className="text-xs font-black text-amber-400">★ {review.rating.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                            &ldquo;{review.comment}&rdquo;
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Pricing & Booking Application Action */}
              <div className="p-5 md:p-7 md:col-span-5 flex flex-col justify-between bg-sky-50/40 dark:bg-slate-900/30">
                <div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-sky-200 dark:border-slate-800 shadow-xs mb-5 space-y-2.5">
                    <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block tracking-wider">
                      Fee Structure Breakdown
                    </span>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Annual / Session Rent:</span>
                      <span className="font-black text-slate-900 dark:text-slate-100">
                        ₦{rentFeeAmount.toLocaleString()}
                      </span>
                    </div>

                    {cautionFeeAmount > 0 && (
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">Caution Deposit (Refundable):</span>
                        <span className="font-black text-slate-900 dark:text-slate-100">
                          ₦{cautionFeeAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {reservationFeeAmount > 0 && (
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">Reservation / Hold Deposit:</span>
                        <span className="font-black text-slate-900 dark:text-slate-100">
                          ₦{reservationFeeAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {agencyFeeAmount > 0 && (
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">Agency Fee:</span>
                        <span className="font-black text-slate-900 dark:text-slate-100">
                          ₦{agencyFeeAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {inspectionFeeAmount > 0 && (
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">Inspection Fee:</span>
                        <span className="font-black text-slate-900 dark:text-slate-100">
                          ₦{inspectionFeeAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {legalFeeAmount > 0 && (
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">Legal Fee:</span>
                        <span className="font-black text-slate-900 dark:text-slate-100">
                          ₦{legalFeeAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm pt-1 font-black text-sky-600 dark:text-sky-400">
                      <span>Total Package:</span>
                      <span>₦{totalBasePackage.toLocaleString()}</span>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold mb-4">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleProceedToApplication}
                    className="w-full py-3.5 rounded-2xl gold-bg-gradient text-white font-black text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📝 Start Tenant Application</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Agent Contact Details */}
                <div className="mt-6 pt-4 border-t border-sky-100 dark:border-slate-800 text-center space-y-2">
                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>💬 Chat Agent on WhatsApp (07073537007)</span>
                  </a>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">
                    DOMOS PROPERTY GLOBAL LIMITED • Ekpoma Managed Housing
                  </p>
                </div>
              </div>

              {/* Similar Apartments / Hostels Recommendations */}
              {similarProperties.length > 0 && (
                <div className="col-span-1 md:col-span-12 p-5 sm:p-7 border-t border-sky-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-900/50">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 block">
                        💡 SIMILAR ACCOMMODATIONS IN EKPOMA
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                        Suggested Apartments Near {selectedProperty.neighborhood}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {similarProperties.map((similarProp) => (
                      <div
                        key={similarProp.id}
                        onClick={() => handleSelectSimilarProperty(similarProp)}
                        className="glass-card rounded-2xl overflow-hidden p-3 border border-sky-200/60 dark:border-slate-800 cursor-pointer hover:scale-[1.02] transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2.5 bg-slate-900">
                            <img
                              src={similarProp.images[0] || "/images/ehis_hostel.png"}
                              alt={similarProp.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full">
                              📍 {similarProp.neighborhood}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-sky-500 transition-colors">
                            {similarProp.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                            {similarProp.location}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-sky-100 dark:border-slate-800 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                              ₦{similarProp.price.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-slate-400">/ session</span>
                          </div>
                          <button
                            type="button"
                            className="px-2.5 py-1 rounded-lg gold-bg-gradient text-white text-[10px] font-bold shadow-xs hover:opacity-90 cursor-pointer"
                          >
                            View →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "apply" && (
            <div className="p-6 sm:p-8 max-w-2xl mx-auto">
              <div className="mb-6 flex justify-between items-center border-b border-sky-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                    Tenant Application Form
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Applying for <span className="font-bold text-sky-600">{selectedProperty.title}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  ← Back to Details
                </button>
              </div>

              <form onSubmit={handleProceedToPayment} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Osasere Emmanuel"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-sky-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. student@aauekpoma.edu.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-sky-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      WhatsApp Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 08012345678"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-sky-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Intended Move-in Date *
                    </label>
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-sky-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="p-4 bg-sky-50 dark:bg-slate-800/50 border border-sky-200 dark:border-slate-700 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-sky-800 dark:text-sky-300 uppercase tracking-wider">
                    🎓 Academic Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Department / Course *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Level of Study
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        <option value="100 Level">100 Level</option>
                        <option value="200 Level">200 Level</option>
                        <option value="300 Level">300 Level</option>
                        <option value="400 Level">400 Level</option>
                        <option value="500 Level">500 Level / PG</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-sky-50 dark:bg-slate-800/50 border border-sky-200 dark:border-slate-700 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-sky-800 dark:text-sky-300 uppercase tracking-wider">
                    🛡️ Guarantor / Parent Contact
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Guarantor Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chief Johnson Osagie"
                        value={guarantorName}
                        onChange={(e) => setGuarantorName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Guarantor Phone *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 08033344455"
                        value={guarantorPhone}
                        onChange={(e) => setGuarantorPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Relationship
                      </label>
                      <input
                        type="text"
                        placeholder="Parent / Guardian"
                        value={guarantorRelation}
                        onChange={(e) => setGuarantorRelation(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl gold-bg-gradient text-white font-black text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Payment Breakdown & Checkout</span>
                  <span>→</span>
                </button>
              </form>
            </div>
          )}

          {step === "payment" && (
            <div className="p-6 sm:p-8 max-w-xl mx-auto">
              <div className="mb-6 flex justify-between items-center border-b border-sky-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                    Payment & Deposit Selector
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select payment components for <span className="font-bold text-sky-600">{selectedProperty.title}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("apply")}
                  className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  ← Edit Application
                </button>
              </div>

              <form onSubmit={handleFinalPaymentSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-3">
                  {/* Rent checkbox */}
                  <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    payRent
                      ? "border-sky-500 bg-sky-50/70 dark:bg-slate-800/80 ring-1 ring-sky-500"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={payRent}
                        onChange={(e) => setPayRent(e.target.checked)}
                        className="w-4 h-4 accent-sky-500 rounded-sm"
                      />
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                          Annual / Session Rent
                        </span>
                        <span className="text-[10px] text-slate-500">Base Accommodation Rent</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                      ₦{rentFeeAmount.toLocaleString()}
                    </span>
                  </label>

                  {/* Caution Fee checkbox (Only if filled by Admin > 0) */}
                  {cautionFeeAmount > 0 && (
                    <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      payCaution
                        ? "border-sky-500 bg-sky-50/70 dark:bg-slate-800/80 ring-1 ring-sky-500"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={payCaution}
                          onChange={(e) => setPayCaution(e.target.checked)}
                          className="w-4 h-4 accent-sky-500 rounded-sm"
                        />
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                            Refundable Caution Fee
                          </span>
                          <span className="text-[10px] text-slate-500">Refundable at end of tenancy</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                        ₦{cautionFeeAmount.toLocaleString()}
                      </span>
                    </label>
                  )}

                  {/* Reservation Deposit checkbox (Only if filled by Admin > 0) */}
                  {reservationFeeAmount > 0 && (
                    <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      payReservation
                        ? "border-sky-500 bg-sky-50/70 dark:bg-slate-800/80 ring-1 ring-sky-500"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={payReservation}
                          onChange={(e) => setPayReservation(e.target.checked)}
                          className="w-4 h-4 accent-sky-500 rounded-sm"
                        />
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                            Room Reservation / Hold Fee
                          </span>
                          <span className="text-[10px] text-slate-500">Locks property immediately</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                        ₦{reservationFeeAmount.toLocaleString()}
                      </span>
                    </label>
                  )}

                  {/* Agency Fee checkbox (Only if filled by Admin > 0) */}
                  {agencyFeeAmount > 0 && (
                    <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      payAgency
                        ? "border-sky-500 bg-sky-50/70 dark:bg-slate-800/80 ring-1 ring-sky-500"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={payAgency}
                          onChange={(e) => setPayAgency(e.target.checked)}
                          className="w-4 h-4 accent-sky-500 rounded-sm"
                        />
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                            Agency Fee
                          </span>
                          <span className="text-[10px] text-slate-500">Processing & documentation</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                        ₦{agencyFeeAmount.toLocaleString()}
                      </span>
                    </label>
                  )}

                  {/* Inspection Fee checkbox (Only if filled by Admin > 0) */}
                  {inspectionFeeAmount > 0 && (
                    <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      payInspection
                        ? "border-sky-500 bg-sky-50/70 dark:bg-slate-800/80 ring-1 ring-sky-500"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={payInspection}
                          onChange={(e) => setPayInspection(e.target.checked)}
                          className="w-4 h-4 accent-sky-500 rounded-sm"
                        />
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                            Inspection Fee
                          </span>
                          <span className="text-[10px] text-slate-500">On-site property tour</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                        ₦{inspectionFeeAmount.toLocaleString()}
                      </span>
                    </label>
                  )}

                  {/* Legal Fee checkbox (Only if filled by Admin > 0) */}
                  {legalFeeAmount > 0 && (
                    <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      payLegal
                        ? "border-sky-500 bg-sky-50/70 dark:bg-slate-800/80 ring-1 ring-sky-500"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={payLegal}
                          onChange={(e) => setPayLegal(e.target.checked)}
                          className="w-4 h-4 accent-sky-500 rounded-sm"
                        />
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                            Legal / Tenancy Agreement Fee
                          </span>
                          <span className="text-[10px] text-slate-500">Legal contract & verification</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                        ₦{legalFeeAmount.toLocaleString()}
                      </span>
                    </label>
                  )}
                </div>

                {/* Total Payment Banner */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white flex justify-between items-center shadow-md">
                  <div>
                    <span className="text-[10px] text-sky-400 font-extrabold uppercase tracking-wider block">Total Payment Due:</span>
                    <span className="text-2xl font-black text-white">₦{totalCalculatedPayment.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] bg-sky-500 text-white font-bold px-2.5 py-1 rounded-full">
                    Instant Receipt
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl gold-bg-gradient text-white font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Processing Booking Application...</span>
                  ) : (
                    <span>💳 Confirm Booking & Generate Receipt</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === "success" && (
            <div className="p-8 text-center max-w-lg mx-auto flex flex-col items-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-4 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>

              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 mb-1">
                Booking Application Generated!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Thank you, <span className="font-bold text-slate-800 dark:text-slate-200">{fullName}</span>! Your booking for <span className="font-bold text-sky-600">{selectedProperty.title}</span> is ready.
              </p>

              {/* Receipt Summary Card */}
              <div className="w-full text-left bg-sky-50/60 dark:bg-slate-900/80 border border-sky-200 dark:border-slate-800 rounded-2xl p-5 space-y-2.5 text-xs mb-6 shadow-sm">
                <div className="flex justify-between items-center border-b border-sky-100 dark:border-slate-800 pb-2">
                  <span className="font-black text-sky-800 dark:text-sky-300 uppercase tracking-wider text-[10px]">Property:</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">{selectedProperty.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Tenant WhatsApp:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{whatsapp} ({fullName})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Academic Info:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{institution} ({department}, {level})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Guarantor Contact:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{guarantorName} ({guarantorPhone} - {guarantorRelation})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Move-in Date:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{moveInDate}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-sky-100 dark:border-slate-800">
                  <span className="font-black text-slate-900 dark:text-slate-100">Total Package Amount:</span>
                  <span className="text-base font-black text-sky-600 dark:text-sky-400">₦{totalCalculatedPayment.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/50"
                >
                  <span className="text-base">🚀</span>
                  <span>Forward Application to Admin WhatsApp (07073537007)</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedProperty(null)}
                  className="w-full py-3 rounded-2xl border border-sky-200 dark:border-slate-800 hover:bg-sky-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Close & Explore More Hostels
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
