"use client";

import React from "react";
import { Property } from "../data/properties";
import { useApp } from "../context/AppContext";

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { wishlist, toggleWishlist, setSelectedProperty } = useApp();

  const isWishlisted = wishlist.includes(property.id);

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group relative">
      {/* Property Image Container */}
      <div className="relative h-60 w-full overflow-hidden">
        <img
          src={property.images[0] || "/images/maitama.png"}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Featured Badge */}
        {property.featured && (
          <span className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-xs text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border border-gold/40 shadow-md">
            💎 Featured
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(property.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full glass border border-white/20 shadow-md text-stone-700 hover:text-red-500 dark:text-zinc-200 dark:hover:text-red-400 transition-colors"
          aria-label="Add to wishlist"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isWishlisted ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-5 h-5 transition-transform duration-200 hover:scale-110 ${
              isWishlisted ? "text-red-500" : ""
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        </button>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Neighborhood & Rating */}
        <div className="flex items-center justify-between text-xs text-stone-400 dark:text-zinc-500 font-semibold mb-2">
          <span>{property.neighborhood}</span>
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3.5 h-3.5 text-gold"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-stone-700 dark:text-zinc-300">
              {property.rating.toFixed(2)}
            </span>
            <span className="text-stone-400 dark:text-zinc-500 font-normal">
              ({property.reviewsCount})
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-stone-800 dark:text-zinc-100 line-clamp-1 mb-2">
          {property.title}
        </h3>

        {/* Details badges */}
        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-zinc-400 mb-4 border-b border-stone-100 dark:border-zinc-800 pb-3">
          <span className="flex items-center gap-1">
            🛏️ {property.bedrooms} Bed
          </span>
          <span className="flex items-center gap-1">
            🛁 {property.bathrooms} Bath
          </span>
          <span className="flex items-center gap-1">
            👥 {property.guests} Guests
          </span>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {property.amenities.slice(0, 3).map((amenity, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded-sm font-medium text-stone-600 dark:text-zinc-300"
            >
              {amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-medium self-center">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-stone-100 dark:border-zinc-800/80">
          <div>
            <span className="text-lg font-extrabold text-stone-900 dark:text-zinc-50">
              ₦{property.price.toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-500 dark:text-zinc-500 block">
              per night
            </span>
          </div>
          <button
            onClick={() => setSelectedProperty(property)}
            className="text-xs font-semibold px-4.5 py-2.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-gold hover:text-white dark:hover:bg-gold dark:hover:text-white transition-all shadow-xs"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
