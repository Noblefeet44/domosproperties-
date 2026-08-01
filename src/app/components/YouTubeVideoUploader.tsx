"use client";

import React, { useState, useRef } from "react";

export interface YouTubeUploadResult {
  videoId: string;
  videoUrl: string;
  thumbnailUrl: string;
}

interface YouTubeVideoUploaderProps {
  currentVideoId?: string;
  currentVideoUrl?: string;
  currentThumbnailUrl?: string;
  onUploadSuccess: (result: YouTubeUploadResult) => void;
  onRemoveVideo?: () => void;
  title?: string;
  description?: string;
}

const MAX_FILE_SIZE_MB = 200;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function YouTubeVideoUploader({
  currentVideoId,
  currentVideoUrl,
  currentThumbnailUrl,
  onUploadSuccess,
  onRemoveVideo,
  title = "Listing Video Tour",
  description = "DomosProperty Video Tour",
}: YouTubeVideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`Video file size exceeds the ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller video.`);
      return;
    }

    // Validate type
    if (!file.type.startsWith("video/")) {
      setError("Selected file is not a valid video format (.mp4, .mov, .webm, etc.).");
      return;
    }

    setUploading(true);
    setProgress(0);
    setStatusMessage("Connecting to DomosProperty YouTube server...");

    try {
      // 1. Get Resumable Upload Session URL from backend
      const sessionRes = await fetch("/api/youtube/upload-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fileSize: file.size,
          fileType: file.type,
        }),
      });

      const sessionData = await sessionRes.json();

      if (!sessionRes.ok || !sessionData.uploadUrl) {
        throw new Error(
          sessionData.error || "Failed to initialize YouTube upload session. Make sure YouTube credentials are set."
        );
      }

      const { uploadUrl } = sessionData;

      setStatusMessage("Uploading video directly to YouTube channel...");

      // 2. Direct upload to YouTube via XMLHttpRequest for accurate progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.round((evt.loaded / evt.total) * 100);
          setProgress(percent);
          if (percent === 100) {
            setStatusMessage("Processing video on YouTube...");
          }
        }
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseData = JSON.parse(xhr.responseText);
            const videoId = responseData.id;
            if (videoId) {
              const videoUrl = `https://youtu.be/${videoId}`;
              const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              
              setStatusMessage("Upload completed successfully!");
              onUploadSuccess({ videoId, videoUrl, thumbnailUrl });
            } else {
              setError("YouTube completed upload but returned no video ID.");
            }
          } catch (err) {
            setError("Failed to parse YouTube upload response.");
          }
        } else {
          setError(`YouTube upload failed with status code ${xhr.status}.`);
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setError("Network error occurred during YouTube upload.");
      };

      xhr.send(file);
    } catch (err: any) {
      setUploading(false);
      setError(err?.message || "An unexpected error occurred during upload.");
    }
  };

  const activeVideoId = currentVideoId;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 sm:p-5 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <h4 className="text-sm font-semibold text-slate-100">YouTube Video Tour</h4>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Max {MAX_FILE_SIZE_MB}MB</span>
      </div>

      {/* Active Video Preview */}
      {activeVideoId ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 mb-3 group">
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${activeVideoId}?rel=0`}
              title="Listing YouTube Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-3 flex items-center justify-between bg-slate-900">
            <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ID: {activeVideoId}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                Replace Video
              </button>
              {onRemoveVideo && (
                <button
                  type="button"
                  onClick={onRemoveVideo}
                  className="text-xs px-2.5 py-1 rounded bg-red-900/40 hover:bg-red-800/60 text-red-300 transition"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-sky-500/50 hover:bg-slate-800/40 transition-all ${
            uploading ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-200 mb-1">
            Click to upload property video tour
          </p>
          <p className="text-xs text-slate-400">
            MP4, MOV, or WEBM (up to {MAX_FILE_SIZE_MB}MB)
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>{statusMessage}</span>
            <span className="font-semibold text-sky-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-950/60 border border-red-800/60 text-xs text-red-300 flex items-start gap-2">
          <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
