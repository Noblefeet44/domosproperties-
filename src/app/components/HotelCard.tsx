"use client";

import React from "react";
import { Hotel } from "../data/hotels";
import { useApp } from "../context/AppContext";

interface HotelCardProps {
  hotel: Hotel;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const { setSelectedHotel } = useApp();

  const hasRealImages = hotel.images && hotel.images.length > 0 && !hotel.images[0]?.startsWith("/images/");
  const hasYouTube = !!(hotel.youtubeVideoId || hotel.youtubeUrl);
  const showVideoCard = !hasRealImages && hasYouTube;
  const primaryImage = hasRealImages ? hotel.images[0] : "/images/ehis_hostel.png";

  // Extract YouTube video ID
  let ytVideoId = hotel.youtubeVideoId;
  if (!ytVideoId && hotel.youtubeUrl) {
    const match = hotel.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
    if (match) ytVideoId = match[1];
  }

  return (
    <div
      onClick={() => setSelectedHotel(hotel)}
      className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col h-full"
    >
      {/* Image / YouTube Video Header */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {showVideoCard && ytVideoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytVideoId}?rel=0&modestbranding=1`}
            title={hotel.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={primaryImage}
              alt={hotel.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
          </>
        )}

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500 text-white shadow-md">
            🏨 Hotel & Short Stay
          </span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-amber-400 text-xs font-bold border border-amber-500/30">
            <span>★</span>
            <span>{hotel.starRating.toFixed(1)}</span>
            <span className="text-slate-300 font-normal">({hotel.reviewsCount})</span>
          </div>
        </div>

        {/* Location overlay bottom left */}
        <div className="absolute bottom-3 left-3.5 right-3.5 text-white z-10">
          <p className="text-[11px] font-semibold text-sky-200 flex items-center gap-1">
            <span>📍</span> {hotel.location}
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
            {hotel.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {hotel.description}
          </p>
        </div>

        {/* Amenities Pill list */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {hotel.amenities?.slice(0, 3).map((amenity, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200/50 dark:border-amber-900/50"
            >
              {amenity}
            </span>
          ))}
          {hotel.amenities && hotel.amenities.length > 3 && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-medium">
              +{hotel.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Card Footer Price & Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rate / Night</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                ₦{hotel.pricePerNight.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">/night</span>
            </div>
          </div>

          <button className="px-4 py-2 rounded-xl gold-bg-gradient text-white text-xs font-bold shadow-md group-hover:scale-105 transition-all flex items-center gap-1 cursor-pointer">
            <span>Book Room</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
