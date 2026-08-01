"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Property } from "../data/properties";
import { useApp } from "../context/AppContext";
import { getPropertySlug } from "@/lib/slug";
import { getListingCardMedia } from "@/lib/youtube";

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { setSelectedProperty } = useApp();

  const slug = getPropertySlug(property);
  const { imageUrl, hasVideo } = getListingCardMedia(property, "/images/ehis_hostel.png");

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group relative border border-sky-100 dark:border-slate-800 transition-all hover:shadow-lg">
      {/* Property Image Container with next/image */}
      <Link href={`/properties/${slug}`} className="relative h-60 w-full overflow-hidden block bg-slate-200 dark:bg-slate-800">
        <Image
          src={imageUrl}
          alt={property.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          unoptimized={imageUrl.includes("img.youtube.com")}
        />

        {/* Featured Badge */}
        {property.featured && (
          <span className="absolute top-3 left-3 bg-sky-950/80 backdrop-blur-xs text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border border-sky-400/40 shadow-md flex items-center gap-1 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span> Verified Hostel
          </span>
        )}

        {/* YouTube / Video Badge Overlay */}
        {hasVideo && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 rounded-full bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 border border-rose-400/40">
              <span className="text-[12px]">▶</span> Video Tour
            </span>
          </div>
        )}

        {/* Play Icon Center Overlay on Hover */}
        {hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 opacity-80 group-hover:opacity-100 transition-opacity z-10">
            <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform border-2 border-white/80">
              <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Neighborhood & Rating */}
        <div className="flex items-center justify-between text-xs text-sky-700 dark:text-sky-400 font-bold mb-1.5">
          <span>📍 {property.neighborhood}</span>
          <div className="flex items-center gap-1 bg-sky-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3.5 h-3.5 text-amber-400"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-slate-800 dark:text-slate-200 font-bold">
              {property.rating ? property.rating.toFixed(1) : "5.0"}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-normal text-[10px]">
              ({property.reviewsCount || 0})
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-black text-slate-900 dark:text-slate-100 line-clamp-1 mb-2">
          <Link href={`/properties/${slug}`} className="hover:text-amber-500 transition-colors">
            {property.title}
          </Link>
        </h3>

        {/* Details badges */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3 border-b border-sky-100 dark:border-slate-800 pb-3">
          <span className="flex items-center gap-1 font-semibold">
            🛏️ {property.bedrooms} {property.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
          </span>
          <span className="flex items-center gap-1 font-semibold">
            🚿 {property.bathrooms} {property.bathrooms === 1 ? "Bathroom" : "Bathrooms"}
          </span>
          <span className="flex items-center gap-1 font-semibold truncate">
            📍 {property.neighborhood}
          </span>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {property.amenities.slice(0, 3).map((amenity, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 px-2 py-0.5 rounded-md font-semibold text-sky-800 dark:text-sky-300"
            >
              ✦ {amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium self-center">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-sky-100 dark:border-slate-800">
          <div>
            <span className="text-lg font-black text-slate-900 dark:text-slate-50">
              ₦{property.price.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
              per session / year
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/properties/${slug}`}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-amber-500 transition-all shadow-md flex items-center gap-1"
            >
              Details
            </Link>
            <button
              onClick={() => setSelectedProperty(property)}
              className="text-xs font-bold px-3 py-2 rounded-xl gold-bg-gradient text-white hover:opacity-95 transition-all shadow-md cursor-pointer flex items-center gap-1"
            >
              <span>Inquire</span>
              <span className="text-[10px]">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
