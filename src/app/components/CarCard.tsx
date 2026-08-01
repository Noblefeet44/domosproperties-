"use client";

import React from "react";
import { Car } from "../data/cars";
import { useApp } from "../context/AppContext";

interface CarCardProps {
  car: Car;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const { setSelectedCar } = useApp();

  const hasRealImages = car.images && car.images.length > 0 && !car.images[0]?.startsWith("/images/");
  const hasYouTube = !!(car.youtubeVideoId || car.youtubeUrl);
  const showVideoCard = !hasRealImages && hasYouTube;
  const primaryImage = hasRealImages ? car.images[0] : "/images/ehis_hostel.png";
  const isRent = car.listingType === "rent";

  // Extract YouTube video ID
  let ytVideoId = car.youtubeVideoId;
  if (!ytVideoId && car.youtubeUrl) {
    const match = car.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
    if (match) ytVideoId = match[1];
  }

  return (
    <div
      onClick={() => setSelectedCar(car)}
      className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col h-full"
    >
      {/* Image / YouTube Video Header */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {showVideoCard && ytVideoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytVideoId}?rel=0&modestbranding=1`}
            title={car.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={primaryImage}
              alt={car.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
          </>
        )}

        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md ${
              isRent ? "bg-sky-600" : "bg-emerald-600"
            }`}
          >
            {isRent ? "🚗 For Rent (Hire)" : "🏷️ For Sale"}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-slate-200 text-[10px] font-bold border border-slate-700">
            {car.year} • {car.transmission.toUpperCase()}
          </span>
        </div>

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
