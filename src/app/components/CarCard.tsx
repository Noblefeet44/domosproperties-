"use client";

import React from "react";
import { Car } from "../data/cars";
import { useApp } from "../context/AppContext";
import { getListingCardMedia, isDirectVideoUrl } from "@/lib/youtube";

interface CarCardProps {
  car: Car;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const { setSelectedCar } = useApp();

  const { imageUrl, hasVideo, isVideoFile } = getListingCardMedia(car, "/images/royal_villa.png");
  const isVid = isVideoFile || isDirectVideoUrl(imageUrl);
  const isRent = car.listingType === "rent";

  return (
    <div
      onClick={() => setSelectedCar(car)}
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
            alt={car.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/royal_villa.png";
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md ${
              isRent ? "bg-sky-600" : "bg-emerald-600"
            }`}
          >
            {isRent ? "🚗 For Rent (Hire)" : "🏷️ For Sale"}
          </span>
          <div className="flex items-center gap-1.5">
            {hasVideo && (
              <span className="px-2.5 py-1 rounded-full bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 border border-rose-400/40">
                <span>▶</span> Video Tour
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-slate-200 text-[10px] font-bold border border-slate-700">
              {car.year} • {car.transmission.toUpperCase()}
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
          <p className="text-[11px] font-semibold text-sky-200 flex items-center gap-1">
            <span>📍</span> {car.location}
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-extrabold uppercase">
              {car.make}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Condition: {car.condition.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-sky-500 transition-colors">
            {car.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {car.description}
          </p>
        </div>

        {/* Car quick specs badges */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
          <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-[10px] font-bold text-slate-700 dark:text-slate-300">
            💺 {car.seats} Seats
          </div>
          <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-[10px] font-bold text-slate-700 dark:text-slate-300">
            ⚙️ {car.transmission}
          </div>
          <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-[10px] font-bold text-slate-700 dark:text-slate-300">
            ⛽ {car.fuelType}
          </div>
        </div>

        {/* Card Footer Price & Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {isRent ? "Daily Rate" : "Asking Price"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                ₦{car.price.toLocaleString()}
              </span>
              {isRent && <span className="text-[11px] font-semibold text-slate-500">/day</span>}
            </div>
          </div>

          <button className="px-4 py-2 rounded-xl gold-bg-gradient text-white text-xs font-bold shadow-md group-hover:scale-105 transition-all flex items-center gap-1 cursor-pointer">
            <span>{isRent ? "Rent Car" : "Buy Car"}</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
