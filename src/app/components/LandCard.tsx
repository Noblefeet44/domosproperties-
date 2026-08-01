"use client";

import React from "react";
import { LandProperty } from "../data/lands";
import { useApp } from "../context/AppContext";
import { getListingCardMedia, isDirectVideoUrl } from "@/lib/youtube";

interface LandCardProps {
  land: LandProperty;
}

export const LandCard: React.FC<LandCardProps> = ({ land }) => {
  const { setSelectedLand } = useApp();

  const { imageUrl, hasVideo, isVideoFile } = getListingCardMedia(land, "/images/treasure_hostel.png");
  const isVid = isVideoFile || isDirectVideoUrl(imageUrl);

  return (
    <div
      onClick={() => setSelectedLand(land)}
      className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col h-full"
    >
      {/* Image Header */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {isVid ? (
          <video
            src={`${imageUrl}#t=0.5`}
            preload="metadata"
            muted
            playsInline
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <img
            src={imageUrl}
            alt={land.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/treasure_hostel.png";
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-md">
            📐 Land & Plots
          </span>
          <div className="flex items-center gap-1.5">
            {hasVideo && (
              <span className="px-2.5 py-1 rounded-full bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 border border-rose-400/40">
                <span>▶</span> Video Tour
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black shadow-md">
              {land.titleDocument}
            </span>
          </div>
        </div>

        {/* Play Icon Center Overlay on Hover when video exists */}
        {hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 opacity-80 group-hover:opacity-100 transition-opacity z-10">
            <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform border-2 border-white/80">
              <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Location overlay bottom left */}
        <div className="absolute bottom-3 left-3.5 right-3.5 text-white z-10">
          <p className="text-[11px] font-semibold text-emerald-200 flex items-center gap-1">
            <span>📍</span> {land.location}
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase">
              {land.zoning} Zoning
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Size: {land.size}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-500 transition-colors">
            {land.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {land.description}
          </p>
        </div>

        {/* Land Feature badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {land.features?.slice(0, 3).map((feat, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/50 dark:border-emerald-900/50"
            >
              {feat}
            </span>
          ))}
          {land.features && land.features.length > 3 && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-medium">
              +{land.features.length - 3} more
            </span>
          )}
        </div>

        {/* Card Footer Price & Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Plot Price</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              ₦{land.price.toLocaleString()}
            </span>
          </div>

          <button className="px-4 py-2 rounded-xl gold-bg-gradient text-white text-xs font-bold shadow-md group-hover:scale-105 transition-all flex items-center gap-1 cursor-pointer">
            <span>Book Site Inspection</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
