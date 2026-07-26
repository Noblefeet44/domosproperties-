"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Property, HostelRoom } from "../data/properties";

export const PropertyDetailsModal: React.FC = () => {
  const { properties, selectedProperty, setSelectedProperty, addBooking } = useApp();
  const modalContainerRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState<"details" | "apply" | "payment" | "success">("details");
  const [activeTab, setActiveTab] = useState<"overview" | "rooms" | "reviews">("overview");
  
  // Selected Room in Hostel
  const [selectedRoom, setSelectedRoom] = useState<HostelRoom | null>(null);

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

  // Fee Selection Checkboxes
  const [payRent, setPayRent] = useState(true);
  const [payCaution, setPayCaution] = useState(true);
  const [payReservation, setPayReservation] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Reset form & auto-select available room when selected property changes
  useEffect(() => {
    if (selectedProperty) {
      const today = new Date();
      setMoveInDate(today.toISOString().split("T")[0]);
      setStep("details");
      setActiveTab("overview");
      setSelectedImageIdx(0);
      setErrorMessage("");

      if (selectedProperty.rooms && selectedProperty.rooms.length > 0) {
        const firstAvail = selectedProperty.rooms.find(r => r.status === "available") || {
          roomNumber: selectedProperty.rooms[0].roomNumber,
          status: "available",
          type: selectedProperty.rooms[0].type,
          price: selectedProperty.rooms[0].price,
        };
        setSelectedRoom(firstAvail);
      } else {
        setSelectedRoom({
          roomNumber: "Executive Suite 101",
          status: "available",
          type: "Self-Contained Single",
          price: selectedProperty.price,
        });
      }
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

  // Fee Calculations
  const rentFeeAmount = selectedRoom ? selectedRoom.price : selectedProperty.price;
  const cautionFeeAmount = selectedProperty.cautionFee || 30000;
  const reservationFeeAmount = selectedProperty.reservationFee || 20000;

  const totalCalculatedPayment = 
    (payRent ? rentFeeAmount : 0) +
    (payCaution ? cautionFeeAmount : 0) +
    (payReservation ? reservationFeeAmount : 0);

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
    if (!selectedRoom) {
      setSelectedRoom({
        roomNumber: "Executive Suite 101",
        status: "available",
        type: "Self-Contained Single",
        price: selectedProperty.price,
      });
    }
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
      setErrorMessage("Please select at least one fee component (Rent, Caution Fee, or Reservation Fee) to make a payment.");
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
  const whatsappMsgText = encodeURIComponent(
    `📋 *DOMOS PROPERTY GLOBAL LIMITED — TENANT RENTAL APPLICATION*\n` +
    `--------------------------------------------------\n` +
    `🏠 *PROPERTY:* ${selectedProperty.title}\n` +
    `📍 *LOCATION:* ${selectedProperty.location} (${selectedProperty.neighborhood})\n` +
    `🚪 *ROOM ALLOCATION:* ${selectedRoom ? `${selectedRoom.roomNumber} (${selectedRoom.type})` : "Executive Suite"}\n` +
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
    `• Annual Rent: ${payRent ? `₦${rentFeeAmount.toLocaleString()}` : "Not Selected"}\n` +
    `• Caution Deposit: ${payCaution ? `₦${cautionFeeAmount.toLocaleString()}` : "Not Selected"}\n` +
    `• Reservation Hold Deposit: ${payReservation ? `₦${reservationFeeAmount.toLocaleString()}` : "Not Selected"}\n` +
    `💰 *TOTAL AMOUNT DUE:* ₦${totalCalculatedPayment.toLocaleString()}\n` +
    `--------------------------------------------------\n` +
    `Kindly review my application & confirm room reservation. Thank you!`
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
              DOMOS PROPERTY GLOBAL LIMITED • HOSTEL PORTAL
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
                {/* Image Gallery Carousel */}
                <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden mb-3 shadow-md group bg-slate-950">
                  <div 
                    className="w-full h-full flex flex-col transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateY(-${selectedImageIdx * 100}%)` }}
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

                  {/* Gradient Overlay & Property Badges */}
                  <div className="absolute bottom-4 left-4 text-white z-10 pointer-events-none">
                    <span className="text-[10px] uppercase font-extrabold tracking-widest gold-bg-gradient text-white px-2.5 py-1 rounded-full shadow-xs">
                      📍 {selectedProperty.neighborhood}
                    </span>
                    <h3 className="text-base font-black mt-1 text-white drop-shadow-md">{selectedProperty.title}</h3>
                  </div>

                  {/* Slide Counter Badge */}
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 flex items-center gap-1 border border-white/20">
                    <span>🖼️ Room Gallery</span>
                    <span>
                      ({selectedImageIdx + 1}/{selectedProperty.images?.length || 1})
                    </span>
                  </div>

                  {/* Vertical Navigation Up & Down Controls */}
                  {selectedProperty.images && selectedProperty.images.length > 1 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIdx((prev) =>
                            prev === 0 ? selectedProperty.images.length - 1 : prev - 1
                          )
                        }
                        className="p-2 rounded-full bg-slate-900/80 hover:bg-sky-500 text-white backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer"
                        aria-label="Previous photo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIdx((prev) =>
                            (prev + 1) % selectedProperty.images.length
                          )
                        }
                        className="p-2 rounded-full bg-slate-900/80 hover:bg-sky-500 text-white backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer"
                        aria-label="Next photo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    </div>
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
                    onClick={() => setActiveTab("rooms")}
                    className={`pb-2 text-xs font-black uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                      activeTab === "rooms"
                        ? "border-sky-500 text-sky-600 dark:text-sky-400"
                        : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    🗓️ Room Availability Grid ({selectedProperty.rooms?.length || 0})
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

                {activeTab === "rooms" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-sky-50 dark:bg-slate-800/40 border border-sky-200 dark:border-slate-700 rounded-xl text-xs">
                      <p className="font-bold text-sky-900 dark:text-sky-200">
                        ⚡ Real-Time Room Availability Calendar
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Select an available room below to lock in your booking application.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedProperty.rooms?.map((rm) => {
                        const isSelected = selectedRoom?.roomNumber === rm.roomNumber;
                        const isAvailable = rm.status === "available";

                        return (
                          <button
                            key={rm.roomNumber}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setSelectedRoom(rm)}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "border-sky-500 bg-sky-50/80 dark:bg-slate-800 ring-2 ring-sky-500"
                                : isAvailable
                                ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300"
                                : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 opacity-60 cursor-not-allowed"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                                {rm.roomNumber}
                              </span>
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                rm.status === "available"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : rm.status === "reserved"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                              }`}>
                                {rm.status}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              <span className="text-[10px] text-slate-500 font-medium">{rm.type}</span>
                              <span className="font-extrabold text-sky-600 dark:text-sky-400">
                                ₦{rm.price.toLocaleString()} / session
                              </span>
                            </div>
                          </button>
                        );
                      })}
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
                      <span className="text-slate-600 dark:text-slate-400">Annual Rent:</span>
                      <span className="font-black text-slate-900 dark:text-slate-100">
                        ₦{rentFeeAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Caution Deposit (Refundable):</span>
                      <span className="font-black text-slate-900 dark:text-slate-100">
                        ₦{cautionFeeAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Reservation / Hold Deposit:</span>
                      <span className="font-black text-slate-900 dark:text-slate-100">
                        ₦{reservationFeeAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm pt-1 font-black text-sky-600 dark:text-sky-400">
                      <span>Total Package:</span>
                      <span>₦{(rentFeeAmount + cautionFeeAmount + reservationFeeAmount).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Selected Room Pill */}
                  <div className="mb-5 p-3 rounded-2xl bg-sky-100/70 dark:bg-slate-800/80 border border-sky-300 dark:border-slate-700 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase font-extrabold text-sky-800 dark:text-sky-300 block">Target Room</span>
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                        {selectedRoom ? selectedRoom.roomNumber : "No Room Selected"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("rooms")}
                      className="text-[10px] font-bold text-sky-600 dark:text-sky-300 hover:underline cursor-pointer"
                    >
                      Change Room ⚙️
                    </button>
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
                    Applying for <span className="font-bold text-sky-600">{selectedProperty.title}</span> ({selectedRoom?.roomNumber})
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
                          Full Academic Session Rent
                        </span>
                        <span className="text-[10px] text-slate-500">12 Months Hostel Lease</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                      ₦{rentFeeAmount.toLocaleString()}
                    </span>
                  </label>

                  {/* Caution Fee checkbox */}
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

                  {/* Reservation Deposit checkbox */}
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
                          Room Reservation Fee
                        </span>
                        <span className="text-[10px] text-slate-500">Locks room immediately</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                      ₦{reservationFeeAmount.toLocaleString()}
                    </span>
                  </label>
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
                Thank you, <span className="font-bold text-slate-800 dark:text-slate-200">{fullName}</span>! Your booking for <span className="font-bold text-sky-600">{selectedProperty.title} ({selectedRoom?.roomNumber})</span> is ready.
              </p>

              {/* Receipt Summary Card */}
              <div className="w-full text-left bg-sky-50/60 dark:bg-slate-900/80 border border-sky-200 dark:border-slate-800 rounded-2xl p-5 space-y-2.5 text-xs mb-6 shadow-sm">
                <div className="flex justify-between items-center border-b border-sky-100 dark:border-slate-800 pb-2">
                  <span className="font-black text-sky-800 dark:text-sky-300 uppercase tracking-wider text-[10px]">Hostel:</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">{selectedProperty.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Allocated Room:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRoom?.roomNumber}</span>
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

