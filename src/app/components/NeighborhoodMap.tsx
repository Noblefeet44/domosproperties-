"use client";

import React, { useState } from "react";
import { Property } from "../data/properties";
import { useApp } from "../context/AppContext";


// Coordinates map for static properties
const STATIC_COORDINATES: Record<string, { x: number; y: number }> = {
  "1": { x: 70, y: 22 }, // Maitama Villa
  "2": { x: 22, y: 38 }, // Jabi Penthouse (by the lake)
  "3": { x: 48, y: 32 }, // Emerald Wuse Studio
  "4": { x: 82, y: 65 }, // Asokoro Presidential Suite
  "5": { x: 55, y: 78 }, // Garki Suite
  "6": { x: 18, y: 44 }, // Jabi Lake Breeze
  "7": { x: 76, y: 58 }, // Asokoro Royal Heights
  "8": { x: 42, y: 26 }, // Wuse Nightlife Penthouse
};

interface NeighborhoodMapProps {
  properties: Property[];
}

export const NeighborhoodMap: React.FC<NeighborhoodMapProps> = ({ properties }) => {
  const { setSelectedProperty, selectedNeighborhood } = useApp();
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);

  // Helper to get coordinates, including dynamic fallback for new host listings
  const getCoordinates = (property: Property): { x: number; y: number } => {
    if (STATIC_COORDINATES[property.id]) {
      return STATIC_COORDINATES[property.id];
    }
    // Random but stable position based on neighborhood
    let base = { x: 50, y: 50 };
    switch (property.neighborhood) {
      case "Maitama": base = { x: 70, y: 25 }; break;
      case "Asokoro": base = { x: 80, y: 60 }; break;
      case "Wuse II": base = { x: 45, y: 30 }; break;
      case "Jabi": base = { x: 20, y: 42 }; break;
      case "Garki": base = { x: 55, y: 75 }; break;
    }
    // Add tiny deterministic shift based on ID hash
    const hash = property.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shiftX = (hash % 12) - 6;
    const shiftY = ((hash >> 2) % 12) - 6;
    return { x: base.x + shiftX, y: base.y + shiftY };
  };

  return (
    <div className="w-full h-full min-h-[500px] md:min-h-0 rounded-3xl overflow-hidden glass border border-stone-200/50 dark:border-zinc-800/50 relative flex flex-col shadow-inner bg-stone-100/40 dark:bg-zinc-950/20">
      {/* Map Header HUD */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <div className="glass rounded-xl px-3 py-1.5 border border-stone-200/45 dark:border-zinc-800/45 text-[10px] uppercase font-bold tracking-widest text-stone-700 dark:text-zinc-300 pointer-events-auto shadow-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping"></span>
          Abuja Core Satellite HUD
        </div>
        
        {selectedNeighborhood !== "All" && (
          <div className="glass rounded-xl px-3 py-1.5 border border-gold/30 text-[10px] font-bold text-gold pointer-events-auto">
            Focus: {selectedNeighborhood}
          </div>
        )}
      </div>

      {/* Vector Map Wrapper */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {/* Abstract SVG Map Artwork */}
        <svg 
          className="absolute inset-0 w-full h-full text-stone-300/40 dark:text-zinc-800/20" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.05" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" className="text-stone-300/10 dark:text-zinc-900/15" />

          {/* Jabi Lake Body */}
          <path 
            d="M 5,30 Q 15,35 20,40 T 25,55 Q 18,65 10,55 T 5,30 Z" 
            fill="rgba(212, 175, 55, 0.05)" 
            stroke="rgba(212, 175, 55, 0.15)"
            strokeWidth="0.5"
            className="animate-pulse"
          />
          <text x="14" y="48" className="text-[2px] font-extrabold uppercase tracking-widest fill-stone-400 dark:fill-zinc-650 opacity-60">Jabi Lake</text>

          {/* Millennium Park Area */}
          <path 
            d="M 68,36 Q 74,32 78,38 T 72,46 Q 66,42 68,36 Z" 
            fill="rgba(34, 197, 94, 0.03)" 
            stroke="rgba(34, 197, 94, 0.1)"
            strokeWidth="0.3"
          />

          {/* Aso Rock Outcrop Landmark */}
          <path 
            d="M 85,15 Q 92,8 99,16 Q 96,25 90,22 Z" 
            fill="none" 
            stroke="currentColor"
            strokeWidth="0.2"
            strokeDasharray="1 1"
          />
          <text x="89" y="16" className="text-[1.8px] font-bold uppercase fill-stone-400 dark:fill-zinc-600 opacity-65">Aso Rock</text>

          {/* Major highway arteries (dashed curves) */}
          {/* Nnamdi Azikiwe Dr */}
          <path d="M 5,90 Q 30,80 50,50 T 95,15" fill="none" stroke="currentColor" strokeWidth="0.15" strokeDasharray="1 2" className="opacity-40" />
          {/* Murtala Mohammed Expy */}
          <path d="M 40,95 Q 60,70 70,30 T 85,5" fill="none" stroke="currentColor" strokeWidth="0.15" strokeDasharray="2 2" className="opacity-30" />
          {/* Inner ring road */}
          <path d="M 30,20 Q 50,15 70,35 T 50,75 Q 30,70 30,20" fill="none" stroke="currentColor" strokeWidth="0.1" className="opacity-20" />

          {/* Label Districts */}
          <text x="72" y="28" className="text-[2.2px] font-black uppercase tracking-widest fill-stone-400/80 dark:fill-zinc-500/80">Maitama</text>
          <text x="82" y="52" className="text-[2.2px] font-black uppercase tracking-widest fill-stone-400/80 dark:fill-zinc-500/80">Asokoro</text>
          <text x="45" y="42" className="text-[2.2px] font-black uppercase tracking-widest fill-stone-400/80 dark:fill-zinc-500/80">Wuse II</text>
          <text x="22" y="58" className="text-[2.2px] font-black uppercase tracking-widest fill-stone-400/80 dark:fill-zinc-500/80">Jabi</text>
          <text x="56" y="85" className="text-[2.2px] font-black uppercase tracking-widest fill-stone-400/80 dark:fill-zinc-500/80">Garki</text>
        </svg>

        {/* Interactive Property Pins overlay */}
        {properties.map((property) => {
          const coords = getCoordinates(property);
          const isHovered = hoveredProperty?.id === property.id;

          return (
            <div
              key={property.id}
              className="absolute transition-all duration-300"
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: isHovered ? 30 : 20
              }}
            >
              {/* Outer Glowing Halo */}
              <div 
                onMouseEnter={() => setHoveredProperty(property)}
                onMouseLeave={() => setHoveredProperty(null)}
                onClick={() => setSelectedProperty(property)}
                className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 relative ${
                  isHovered 
                    ? "bg-gold/30 scale-125" 
                    : "bg-gold/15 hover:bg-gold/25"
                }`}
              >
                {/* Center Core Pin */}
                <div className={`w-2.5 h-2.5 rounded-full gold-bg-gradient border border-white dark:border-zinc-950 transition-transform ${
                  isHovered ? "scale-110" : ""
                }`}></div>
                
                {/* CSS Radar Ping Animation */}
                <div className="absolute inset-0 rounded-full border border-gold/50 animate-ping opacity-60 pointer-events-none"></div>
              </div>

              {/* Hover Tooltip Card */}
              {isHovered && (
                <div 
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 rounded-2xl glass border border-stone-200/60 dark:border-zinc-800/60 shadow-xl p-2.5 z-40 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150"
                  style={{ transform: "translate(-50%, -8px)" }}
                >
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-20 object-cover rounded-xl mb-2"
                  />
                  <div className="px-0.5">
                    <span className="text-[8px] font-bold text-gold uppercase tracking-wider block mb-0.5">
                      {property.neighborhood}
                    </span>
                    <h4 className="text-[10px] font-extrabold text-stone-850 dark:text-zinc-100 truncate mb-1">
                      {property.title}
                    </h4>
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-stone-700 dark:text-zinc-300">
                        ₦{property.price.toLocaleString()}
                      </span>
                      <span className="text-gold">
                        ★ {property.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Map Legend */}
      <div className="p-3 border-t border-stone-200/50 dark:border-zinc-800/50 bg-stone-50/50 dark:bg-zinc-950/40 text-[9px] text-stone-400 dark:text-zinc-500 font-semibold tracking-wider uppercase flex justify-around gap-4 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
          VIP shortlets
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1.5 border border-dashed border-stone-450 dark:border-zinc-650 opacity-60 inline-block"></span>
          Express Highways
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-sm"></span>
          Parks & Enclaves
        </div>
      </div>
    </div>
  );
};
