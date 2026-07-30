/**
 * Converts a text string into a clean, SEO-friendly URL slug.
 * Example: "4 Bedroom Self Contain Duplex in Ekpoma!" -> "4-bedroom-self-contain-duplex-in-ekpoma"
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // Split accented characters into base letters and diacritics
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9 -]/g, "") // Remove non-alphanumeric chars except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

export interface SluggedItem {
  id: string;
  title: string;
  location?: string;
  neighborhood?: string;
}

/**
 * Returns a clean SEO-friendly slug for a property.
 * If title is empty, falls back to property ID.
 */
export function getPropertySlug(property: SluggedItem): string {
  const baseSlug = slugify(property.title);
  if (!baseSlug) return property.id;
  return baseSlug;
}

/**
 * Returns the relative canonical URL path for a property.
 * Example: "/properties/4-bedroom-duplex-ekpoma"
 */
export function getPropertyPath(property: SluggedItem): string {
  return `/properties/${getPropertySlug(property)}`;
}

/**
 * Returns the absolute canonical URL for a property.
 * Example: "https://domosproperty.org/properties/4-bedroom-duplex-ekpoma"
 */
export function getPropertyAbsoluteUrl(property: SluggedItem): string {
  return `https://domosproperty.org${getPropertyPath(property)}`;
}
