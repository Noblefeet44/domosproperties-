"use client";

import React, { useState, useRef } from "react";

interface ImageUploaderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  maxImages?: number;
  label?: string;
  description?: string;
}

// Client-side Canvas Image Compression Helper (Max 1200px width/height, 0.82 JPEG quality)
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Canvas blob conversion failed"));
              }
            },
            "image/jpeg",
            0.82
          );
        } else {
          reject(new Error("Canvas context null"));
        }
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// Fallback to Data URL string if blob upload fails
const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 25,
  label = "Upload Listing Images",
  description = "Select multiple photos at once from your phone gallery or computer.",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAndUploadFiles = async (filesList: FileList | File[]) => {
    const rawFiles = Array.from(filesList).filter((f) => f.type.startsWith("image/"));
    if (rawFiles.length === 0) return;

    // Check remaining slots
    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      alert(`Maximum ${maxImages} images allowed.`);
      return;
    }

    const filesToProcess = rawFiles.slice(0, availableSlots);
    setIsUploading(true);
    setUploadProgress({ current: 0, total: filesToProcess.length });

    const uploadedUrls: string[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      setUploadProgress({ current: i + 1, total: filesToProcess.length });
      const file = filesToProcess[i];

      try {
        // Step 1: Compress image on client
        let compressedBlob: Blob;
        try {
          compressedBlob = await compressImage(file);
        } catch (e) {
          console.warn("Client compression failed, using original file", e);
          compressedBlob = file;
        }

        // Create compressed File object for upload
        const compressedFile = new File(
          [compressedBlob],
          file.name.replace(/\.[^/.]+$/, "") + ".jpg",
          { type: "image/jpeg" }
        );

        // Step 2: Try uploading to /api/upload endpoint
        const formData = new FormData();
        formData.append("files", compressedFile);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.urls && resData.urls.length > 0) {
            uploadedUrls.push(resData.urls[0]);
            continue;
          }
        }

        // Step 3: Fallback to client base64 data URL if API/Supabase fails
        const fallbackDataUrl = await blobToDataURL(compressedBlob);
        uploadedUrls.push(fallbackDataUrl);
      } catch (err) {
        console.error(`Failed to process image ${file.name}:`, err);
        try {
          const fallbackDataUrl = await blobToDataURL(file);
          uploadedUrls.push(fallbackDataUrl);
        } catch {
          // Skip corrupt file
        }
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
    }

    setIsUploading(false);

    // CRITICAL FOR MOBILE: Reset input value so re-selecting same files triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndUploadFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAndUploadFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    moveImage(index, 0);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block uppercase tracking-wider">
            {label} ({images.length}/{maxImages})
          </label>
          {description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
        {images.length > 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || images.length >= maxImages}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
          >
            <span>➕</span> Add More Photos
          </button>
        )}
      </div>

      {/* Upload Zone / Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && images.length < maxImages && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer select-none ${
          isDragging
            ? "border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 scale-[0.99]"
            : "border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-amber-400"
        } ${isUploading || images.length >= maxImages ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading || images.length >= maxImages}
        />

        {isUploading ? (
          <div className="py-3 space-y-2">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
              Processing & Uploading Image {uploadProgress.current} of {uploadProgress.total}...
            </p>
            <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 pointer-events-none">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto text-2xl">
              📷
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Tap here to select multiple photos from phone or computer
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Supports JPG, PNG, WEBP, HEIC (Auto-compressed for fast loading)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="group relative h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm transition-all hover:shadow-md"
            >
              <img
                src={url}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setPreviewImage(url)}
              />

              {/* Cover Badge */}
              {idx === 0 ? (
                <span className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs">
                  ⭐ Cover Photo
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAsCover(idx)}
                  className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md transition-all cursor-pointer"
                  title="Make this the primary cover photo"
                >
                  Set Cover
                </button>
              )}

              {/* Quick Actions (Move & Delete) */}
              <div className="absolute bottom-1.5 right-1.5 left-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all bg-slate-950/70 p-1 rounded-xl backdrop-blur-xs">
                <div className="flex items-center gap-1">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx - 1)}
                      className="w-5 h-5 rounded-lg bg-white/20 hover:bg-white/40 text-white text-[10px] flex items-center justify-center cursor-pointer"
                      title="Move Left"
                    >
                      ◀
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx + 1)}
                      className="w-5 h-5 rounded-lg bg-white/20 hover:bg-white/40 text-white text-[10px] flex items-center justify-center cursor-pointer"
                      title="Move Right"
                    >
                      ▶
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="w-5 h-5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] flex items-center justify-center cursor-pointer"
                  title="Delete image"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Zoom Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-700 p-2 shadow-2xl">
            <img
              src={previewImage}
              alt="Preview Full"
              className="max-w-full max-h-[75vh] object-contain rounded-2xl mx-auto"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-slate-900/90 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-rose-600 cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
