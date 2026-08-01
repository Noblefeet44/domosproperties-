/**
 * Utility functions for YouTube video URL parsing, thumbnail extraction, and card media helpers.
 */

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
  if (customThumbnailUrl && customThumbnailUrl.trim().length > 0) {
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
]);

interface ListingMediaItem {
  images?: string[];
  youtubeVideoId?: string;
  youtubeUrl?: string;
  youtubeThumbnail?: string;
}

interface CardMediaResult {
  imageUrl: string;
  hasVideo: boolean;
  videoId: string | null;
  youtubeUrl: string | null;
  isYouTubeThumbnail: boolean;
}

/**
 * Determines the primary image to display on a listing card.
 * If a YouTube video exists and the item has no custom photos (or only default placeholders),
 * it uses the YouTube video's thumbnail image with a video badge/play overlay.
 */
export function getListingCardMedia(
  item: ListingMediaItem,
  defaultFallbackImage: string = "/images/ehis_hostel.png"
): CardMediaResult {
  const videoId =
    extractYouTubeVideoId(item.youtubeVideoId) || extractYouTubeVideoId(item.youtubeUrl);
  const hasVideo = Boolean(videoId || item.youtubeUrl || item.youtubeThumbnail);

  const ytThumbnail = getYouTubeThumbnailUrl(videoId || item.youtubeUrl, item.youtubeThumbnail);

  const images = item.images && item.images.length > 0 ? item.images : [];
  const firstImage = images[0] || "";
  const isFirstImagePlaceholder = !firstImage || DEFAULT_FALLBACK_IMAGES.has(firstImage);

  // If there's a YouTube video available, and either no custom images or first image is default fallback,
  // use YouTube thumbnail!
  if (hasVideo && ytThumbnail && (images.length === 0 || isFirstImagePlaceholder)) {
    return {
      imageUrl: ytThumbnail,
      hasVideo: true,
      videoId,
      youtubeUrl: item.youtubeUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null),
      isYouTubeThumbnail: true,
    };
  }

  // If custom images exist, use first custom image
  if (firstImage && !isFirstImagePlaceholder) {
    return {
      imageUrl: firstImage,
      hasVideo,
      videoId,
      youtubeUrl: item.youtubeUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null),
      isYouTubeThumbnail: false,
    };
  }

  // Fallback to YouTube thumbnail if available, else default fallback image
  const finalImageUrl = ytThumbnail || firstImage || defaultFallbackImage;

  return {
    imageUrl: finalImageUrl,
    hasVideo,
    videoId,
    youtubeUrl: item.youtubeUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null),
    isYouTubeThumbnail: Boolean(ytThumbnail && finalImageUrl === ytThumbnail),
  };
}
