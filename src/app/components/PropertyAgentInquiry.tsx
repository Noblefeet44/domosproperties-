"use client";

import React, { useState } from "react";
import { Property } from "../data/properties";
import { INITIAL_AGENTS, AgentProfile } from "../data/agents";

interface PropertyAgentInquiryProps {
  property: Property;
}

export function PropertyAgentInquiry({ property }: PropertyAgentInquiryProps) {
  // Find Agent profile
  const listingAgent: AgentProfile =
    INITIAL_AGENTS.find(
      (a) => a.id === property.agentId || a.whatsapp === property.agentPhone
    ) || INITIAL_AGENTS[0];

  const agentPhone = listingAgent.whatsapp || property.agentPhone || "07073537007";
  const agentCleanPhone = agentPhone.replace(/^0/, "");

  // Form State
  const [fullName, setFullName] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [moveInDate, setMoveInDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [errorMessage, setErrorMessage] = useState("");

  // Fee Calculations
  const rentFeeAmount = property.price || 0;
  const cautionFeeAmount = property.cautionFee || 0;
  const reservationFeeAmount = property.reservationFee || 0;
  const agencyFeeAmount = property.agencyFee || 0;
  const inspectionFeeAmount = property.inspectionFee || 0;
  const legalFeeAmount = property.legalFee || 0;

  const totalCalculatedPayment =
    rentFeeAmount +
    cautionFeeAmount +
    reservationFeeAmount +
    agencyFeeAmount +
    inspectionFeeAmount +
    legalFeeAmount;

  const handleWhatsAppInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !whatsappPhone.trim() || !moveInDate) {
      setErrorMessage("Please enter your Full Name, WhatsApp Phone Number, and Move-In Date.");
      return;
    }
    setErrorMessage("");

    const prefilledWhatsappMsg = `Hello ${encodeURIComponent(
      listingAgent.name || "Listing Agent"
    )}, I am inquiring about leasing ${encodeURIComponent(property.title)} at ${encodeURIComponent(
      property.location
    )}.%0A%0A👤 Applicant Details:%0A- Name: ${encodeURIComponent(
      fullName
    )}%0A- Phone/WhatsApp: ${encodeURIComponent(
      whatsappPhone
    )}%0A- Occupation: ${encodeURIComponent(
      occupation || "N/A"
    )}%0A- Preferred Move-In Date: ${encodeURIComponent(
      moveInDate
    )}%0A%0A💰 Fee Breakdown Summary:%0A- Annual Rent: ₦${rentFeeAmount.toLocaleString()}${
      legalFeeAmount > 0 ? `%0A- Legal Fee: ₦${legalFeeAmount.toLocaleString()}` : ""
    }${
      inspectionFeeAmount > 0 ? `%0A- Inspection Fee: ₦${inspectionFeeAmount.toLocaleString()}` : ""
    }${
      agencyFeeAmount > 0 ? `%0A- Agency Fee: ₦${agencyFeeAmount.toLocaleString()}` : ""
    }${
      cautionFeeAmount > 0 ? `%0A- Caution Deposit: ₦${cautionFeeAmount.toLocaleString()}` : ""
    }${
      reservationFeeAmount > 0 ? `%0A- Reservation Deposit: ₦${reservationFeeAmount.toLocaleString()}` : ""
    }%0A%0ATotal Package Amount: ₦${totalCalculatedPayment.toLocaleString()}`;

    const directWhatsappUrl = `https://wa.me/234${agentCleanPhone}?text=${prefilledWhatsappMsg}`;
    window.open(directWhatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* 1. VERIFIED LISTING AGENT DETAILS CARD */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-sky-50/60 dark:from-slate-900 dark:to-slate-800/80 border border-amber-200/80 dark:border-slate-700 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-slate-700 pb-3">
          <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
            ✓ Verified Listing Agent
          </span>
          <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
            {listingAgent.cacNumber}
          </span>
        </div>

        <div className="flex items-start gap-4">
          <img
            src={listingAgent.profileImage || "/images/ehis_hostel.png"}
            alt={listingAgent.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-md flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/ehis_hostel.png";
            }}
          />
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {listingAgent.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              📍 {listingAgent.officeAddress}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ✉️ {listingAgent.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <a
            href={`tel:${agentPhone}`}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span>📞 Call Agent</span>
          </a>
          <a
            href={`https://wa.me/234${agentCleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span>💬 Direct WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 2. TENANT INQUIRY APPLICATION FORM */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>📝</span> Send Direct Inquiry to Listing Agent
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fill in your contact details to connect directly on WhatsApp with prefilled property info.
          </p>
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/50 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleWhatsAppInquiry} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold block mb-1 text-slate-700 dark:text-slate-300">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Samuel Okon"
                className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold block mb-1 text-slate-700 dark:text-slate-300">
                WhatsApp Phone Number *
              </label>
              <input
                type="tel"
                required
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="08012345678"
                className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-700 dark:text-slate-300">
                  Occupation / Student Status
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. AAU Student, Staff..."
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-700 dark:text-slate-300">
                  Preferred Move-In Date *
                </label>
                <input
                  type="date"
                  required
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Package Breakdown Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
            <span className="font-extrabold text-amber-600 dark:text-amber-400 block text-[11px] uppercase tracking-wider">
              Calculated Initial Package:
            </span>
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Annual Rent:</span>
              <span className="font-bold">₦{rentFeeAmount.toLocaleString()}</span>
            </div>
            {totalCalculatedPayment > rentFeeAmount && (
              <div className="flex justify-between text-slate-500">
                <span>Additional Fees (Legal/Inspection/Agency/Caution):</span>
                <span className="font-bold">₦{(totalCalculatedPayment - rentFeeAmount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-black text-amber-500">
              <span>Total Estimated Payment:</span>
              <span>₦{totalCalculatedPayment.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl gold-bg-gradient hover:opacity-95 text-white font-black text-xs text-center flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <span>💬 Proceed with Inquiry on WhatsApp</span>
            <span>→</span>
          </button>
        </form>
      </div>
    </div>
  );
}
