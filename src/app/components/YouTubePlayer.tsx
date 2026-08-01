"use client";

import React, { useState } from "react";

interface YouTubePlayerProps {
  videoId?: string;
  url?: string;
  thumbnailUrl?: string;
  title?: string;
  className?: string;
}

export default function YouTubePlayer({
  videoId,
  url,
  thumbnailUrl,
  title = "Property Video Tour",
  className = "",
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video ID from URL if videoId is missing
  let activeVideoId = videoId;
  if (!activeVideoId && url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
    if (match) {
      activeVideoId = match[1];
    }
  }

  if (!activeVideoId) {
    return null;
  }

  const poster = thumbnailUrl || `https://img.youtube.com/vi/${activeVideoId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl ${className}`}>
      {!isPlaying ? (
        <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-600/90 group-hover:bg-red-600 group-hover:scale-110 text-white flex items-center justify-center shadow-2xl transition-all duration-300">
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Title Badge */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 truncate">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="font-medium truncate">{title}</span>
            </div>
            <span className="text-[11px] text-slate-300 font-mono bg-black/40 px-2 py-0.5 rounded">Click to Play</span>
          </div>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}
