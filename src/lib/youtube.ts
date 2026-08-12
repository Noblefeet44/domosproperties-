/**
 * Utility functions for YouTube video URL parsing, thumbnail extraction, and card media helpers.
 */

/**
 * Checks if a URL points to a direct video file (e.g. MP4, MOV, WebM) or Telegram video stream.
 */
export function isDirectVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".mp4") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".m4v") ||
    lower.includes("/video") ||
    (lower.includes("api.telegram.org") && (lower.includes(".mp4") || lower.includes("file_") || lower.includes("video")))
  );
}

/**
 * Extracts YouTube Video ID from various URL formats or raw ID string.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Raw 11-character video ID
 */
export function extractYouTubeVideoId(input?: string): string | null {
  if (!input) return null;
  const str = input.trim();
  if (!str) return null;

  // Standard raw 11-character ID check
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Returns a high quality thumbnail URL for a given YouTube Video ID or URL.
 */
export function getYouTubeThumbnailUrl(videoIdOrUrl?: string, customThumbnailUrl?: string): string | null {
  if (customThumbnailUrl && customThumbnailUrl.trim().length > 0 && !isDirectVideoUrl(customThumbnailUrl)) {
    return customThumbnailUrl.trim();
  }

  const videoId = extractYouTubeVideoId(videoIdOrUrl);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  return null;
}

/**
 * Known placeholder fallback images used in the application.
 */
const DEFAULT_FALLBACK_IMAGES = new Set([
  "/images/ehis_hostel.png",
  "/images/royal_villa.png",
  "/images/treasure_hostel.png",
  "/images/maitama.png",
  "/images/jabi.png",
  "/images/wuse.png",
  "/images/asokoro.png",
]);

/**
 * Checks if a string is a valid, non-empty image URL.
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  if (trimmed === "null" || trimmed === "undefined" || trimmed === "[object Object]") return false;
  return true;
}

/**
 * Checks if an image URL is a default system placeholder image.
 */
export function isPlaceholderImage(url?: string | null): boolean {
  if (!isValidImageUrl(url)) return true;
  const trimmed = url!.trim();
  if (DEFAULT_FALLBACK_IMAGES.has(trimmed)) return true;
  return false;
}

interface ListingMediaItem {
  images?: string[];
  youtubeVideoId?: string;
  youtubeUrl?: string;
  youtubeThumbnail?: string;
}

export interface CardMediaResult {
  imageUrl: string;
  hasVideo: boolean;
  isVideoFile: boolean;
  videoId: string | null;
  youtubeUrl: string | null;
  isYouTubeThumbnail: boolean;
}

/**
 * Determines the primary image to display on a listing card.
 * If a YouTube video or uploaded video exists and the item has no custom photos (or only default placeholders),
 * it uses the video's YouTube thumbnail image or video stream with a video badge/play overlay.
 */
export function getListingCardMedia(
  item: ListingMediaItem,
  defaultFallbackImage: string = "/images/ehis_hostel.png"
): CardMediaResult {
  const videoId =
    extractYouTubeVideoId(item.youtubeVideoId) || extractYouTubeVideoId(item.youtubeUrl);
  const directVidUrl = isDirectVideoUrl(item.youtubeUrl)
    ? item.youtubeUrl
    : isDirectVideoUrl(item.images?.[0])
    ? item.images?.[0]
    : null;
  const hasVideo = Boolean(videoId || item.youtubeUrl || item.youtubeThumbnail || directVidUrl);

  const videoThumbnail = getYouTubeThumbnailUrl(videoId || item.youtubeUrl, item.youtubeThumbnail);

  // Filter images array to valid non-empty URLs
  const validImages = (item.images || []).filter((img) => isValidImageUrl(img));
  const firstImage = validImages[0] || "";
  const isFirstImagePlaceholder = isPlaceholderImage(firstImage);
  const isFirstImageVideo = isDirectVideoUrl(firstImage);

  // If first image is a direct video file
  if (isFirstImageVideo) {
    return {
      imageUrl: firstImage,
      hasVideo: true,
      isVideoFile: true,
      videoId: null,
      youtubeUrl: item.youtubeUrl || firstImage,
      isYouTubeThumbnail: false,
    };
  }

  // If custom valid (non-placeholder) photos exist, use first custom photo
  if (firstImage && !isFirstImagePlaceholder) {
    return {
      imageUrl: firstImage,
      hasVideo,
      isVideoFile: isDirectVideoUrl(firstImage),
      videoId,
      youtubeUrl: item.youtubeUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null),
      isYouTubeThumbnail: false,
    };
  }

  // If a video exists (and no custom photos exist), use YouTube video thumbnail or video stream
  if (hasVideo && (videoThumbnail || directVidUrl)) {
    const finalMediaUrl = videoThumbnail || directVidUrl || "";
    const isVid = isDirectVideoUrl(finalMediaUrl);
    return {
      imageUrl: finalMediaUrl,
      hasVideo: true,
      isVideoFile: isVid,
      videoId,
      youtubeUrl: item.youtubeUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null),
      isYouTubeThumbnail: Boolean(videoThumbnail && finalMediaUrl === videoThumbnail),
    };
  }

  // Fallback to video thumbnail or valid image or guaranteed default fallback path
  const fallback = isValidImageUrl(defaultFallbackImage) ? defaultFallbackImage : "/images/ehis_hostel.png";
  const finalImageUrl =
    videoThumbnail ||
    (firstImage && !isFirstImagePlaceholder ? firstImage : "") ||
    fallback;

  return {
    imageUrl: finalImageUrl,
    hasVideo,
    isVideoFile: isDirectVideoUrl(finalImageUrl),
    videoId,
    youtubeUrl: item.youtubeUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null),
    isYouTubeThumbnail: Boolean(videoThumbnail && finalImageUrl === videoThumbnail),
  };
}

