"use client";

import React, { useState } from "react";
import { Property } from "../data/properties";
import { useApp } from "../context/AppContext";

// Coordinates map for Ekpoma static properties
const STATIC_COORDINATES: Record<string, { x: number; y: number }> = {
  "1": { x: 72, y: 24 }, // Ehis Hostel (AAU Main Gate)
  "2": { x: 28, y: 62 }, // Treasure Hostel (Benin-Auchi Expressway)
  "3": { x: 52, y: 38 }, // Elite Residence (Ihniduma)
  "4": { x: 78, y: 68 }, // Royal Villa (University Road)
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
    // Random but stable position based on Ekpoma neighborhood
    let base = { x: 50, y: 50 };
    switch (property.neighborhood) {
      case "AAU Main Gate": base = { x: 70, y: 25 }; break;
      case "Ihniduma": base = { x: 50, y: 40 }; break;
      case "University Road": base = { x: 75, y: 65 }; break;
      case "Benin-Auchi Expressway": base = { x: 30, y: 60 }; break;
      case "Royal Market": base = { x: 45, y: 75 }; break;
    }
    const hash = property.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shiftX = (hash % 10) - 5;
    const shiftY = ((hash >> 2) % 10) - 5;
    return { x: base.x + shiftX, y: base.y + shiftY };
  };

  return (
    <div className="w-full h-full min-h-[500px] md:min-h-0 rounded-3xl overflow-hidden glass border border-sky-200/60 dark:border-slate-800 relative flex flex-col shadow-inner bg-slate-50/50 dark:bg-slate-950/40">
      {/* Map Header HUD */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <div className="glass rounded-xl px-3 py-1.5 border border-sky-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-widest text-sky-800 dark:text-sky-300 pointer-events-auto shadow-xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>
          Ekpoma AAU Campus & District Map
        </div>
        
        {selectedNeighborhood !== "All" && (
          <div className="glass rounded-xl px-3 py-1.5 border border-sky-400 text-[10px] font-bold text-sky-600 dark:text-sky-300 pointer-events-auto bg-sky-50 dark:bg-slate-900">
            Zone: {selectedNeighborhood}
          </div>
        )}
      </div>

      {/* Vector Map Wrapper */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {/* Abstract SVG Map Artwork */}
        <svg 
          className="absolute inset-0 w-full h-full text-sky-200 dark:text-slate-800/40" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.08" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" className="text-sky-200/40 dark:text-slate-800/20" />

          {/* Benin-Auchi Expressway Line */}
          <path 
            d="M 5,85 Q 25,75 35,50 T 80,10" 
            fill="none" 
            stroke="#0ea5e9" 
            strokeWidth="0.6"
            strokeDasharray="2 1"
            className="opacity-70"
          />
          <text x="10" y="80" className="text-[2px] font-extrabold uppercase tracking-widest fill-sky-600 dark:fill-sky-400">Benin-Auchi Expressway</text>

          {/* AAU Campus Ground Area */}
          <path 
            d="M 60,10 Q 80,12 92,30 T 75,45 Q 58,40 60,10 Z" 
            fill="rgba(14, 165, 233, 0.08)" 
            stroke="rgba(14, 165, 233, 0.3)"
            strokeWidth="0.4"
          />
          <text x="65" y="22" className="text-[2.2px] font-black uppercase tracking-wider fill-sky-700 dark:fill-sky-300">AMBROSE ALLI UNIV. (AAU)</text>

          {/* AAU Administrative Complex Landmark */}
          <circle cx="82" cy="18" r="3" fill="rgba(14, 165, 233, 0.2)" stroke="#0ea5e9" strokeWidth="0.3" />
          <text x="80" y="24" className="text-[1.8px] font-bold uppercase fill-sky-800 dark:fill-sky-200">Admin Block</text>

          {/* Main University Road */}
          <path d="M 35,50 Q 55,55 75,30" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 1" className="opacity-50" />

          {/* Label Districts */}
          <text x="68" y="28" className="text-[2.2px] font-black uppercase tracking-widest fill-sky-800 dark:fill-sky-300">AAU Main Gate</text>
          <text x="46" y="36" className="text-[2.2px] font-black uppercase tracking-widest fill-sky-800 dark:fill-sky-300">Ihniduma</text>
          <text x="75" y="62" className="text-[2.2px] font-black uppercase tracking-widest fill-sky-800 dark:fill-sky-300">University Road</text>
          <text x="18" y="58" className="text-[2.2px] font-black uppercase tracking-widest fill-sky-800 dark:fill-sky-300">Expressway Zone</text>
          <text x="42" y="78" className="text-[2.2px] font-black uppercase tracking-widest fill-sky-800 dark:fill-sky-300">Royal Market</text>
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
                className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 relative ${
                  isHovered 
                    ? "bg-sky-500/40 scale-125 shadow-lg" 
                    : "bg-sky-500/20 hover:bg-sky-500/30"
                }`}
              >
                {/* Center Core Pin */}
                <div className={`w-3 h-3 rounded-full gold-bg-gradient border-2 border-white dark:border-slate-900 transition-transform ${
                  isHovered ? "scale-110" : ""
                }`}></div>
                
                {/* CSS Radar Ping Animation */}
                <div className="absolute inset-0 rounded-full border border-sky-400 animate-ping opacity-70 pointer-events-none"></div>
              </div>

              {/* Hover Tooltip Card */}
              {isHovered && (
                <div 
                  className="absolute bottom-9 left-1/2 -translate-x-1/2 w-52 rounded-2xl glass border border-sky-300 dark:border-slate-700 shadow-2xl p-2.5 z-40 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150"
                  style={{ transform: "translate(-50%, -8px)" }}
                >
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-24 object-cover rounded-xl mb-2"
                  />
                  <div className="px-0.5">
                    <span className="text-[8px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-0.5">
                      📍 {property.neighborhood}
                    </span>
                    <h4 className="text-[11px] font-black text-slate-900 dark:text-slate-100 truncate mb-1">
                      {property.title}
                    </h4>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-sky-700 dark:text-sky-300">
                        ₦{property.price.toLocaleString()} / session
                      </span>
                      <span className="text-amber-500">
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
      <div className="p-3 border-t border-sky-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60 text-[9px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase flex justify-around gap-4 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          Student Hostels
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-1 border border-dashed border-sky-400 inline-block"></span>
          Expressway Arteries
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-sky-200 dark:bg-sky-900 border border-sky-500 rounded-xs"></span>
          AAU Ekpoma Campus
        </div>
      </div>
    </div>
  );
};

