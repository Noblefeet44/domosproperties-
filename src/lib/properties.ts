import { createPublicClient } from "./supabase/public";
import { INITIAL_PROPERTIES, Property } from "@/app/data/properties";
import { getPropertySlug, slugify } from "./slug";

// In-memory property cache fallback for server-side evaluation
const globalForProperties = globalThis as unknown as {
  serverPropertiesStore: Property[];
};

if (!globalForProperties.serverPropertiesStore || globalForProperties.serverPropertiesStore.length === 0) {
  globalForProperties.serverPropertiesStore = [...INITIAL_PROPERTIES];
}

export function getMemoryProperties(): Property[] {
  return globalForProperties.serverPropertiesStore;
}

export function setMemoryProperties(props: Property[]): void {
  globalForProperties.serverPropertiesStore = props;
}

/**
 * Fetches all properties from Supabase DB, merged with memory fallback store.
 */
export async function getAllProperties(): Promise<Property[]> {
  try {
    const supabase = createPublicClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const memory = getMemoryProperties();
        const fetchedIds = new Set(data.map((item: any) => String(item.id)));

        const propertiesFromDb: Property[] = data.map((item: any) => {
          const memProp = memory.find((p) => p.id === String(item.id));
          return {
            id: String(item.id),
            title: item.title,
            description: item.description || "",
            price: Number(item.price),
            cautionFee: item.caution_fee !== undefined && item.caution_fee !== null ? Number(item.caution_fee) : memProp?.cautionFee,
            reservationFee: item.reservation_fee !== undefined && item.reservation_fee !== null ? Number(item.reservation_fee) : memProp?.reservationFee,
            agencyFee: item.agency_fee !== undefined && item.agency_fee !== null ? Number(item.agency_fee) : memProp?.agencyFee,
            inspectionFee: item.inspection_fee !== undefined && item.inspection_fee !== null ? Number(item.inspection_fee) : memProp?.inspectionFee,
            legalFee: item.legal_fee !== undefined && item.legal_fee !== null ? Number(item.legal_fee) : memProp?.legalFee,
            location: item.location,
            neighborhood: item.neighborhood,
            bedrooms: item.bedrooms || 1,
            bathrooms: item.bathrooms || 1,
            guests: item.guests || 2,
            rating: item.rating ? Number(item.rating) : 5.0,
            reviewsCount: item.reviews_count || 0,
            images: item.images || [],
            amenities: item.amenities || [],
            featured: Boolean(item.featured),
            agentPhone: item.agent_phone || "07073537007",
            agentId: item.agent_id || memProp?.agentId,
            googleMapsUrl: item.google_maps_url,
            rooms: item.rooms || [],
            reviews: memProp?.reviews || [],
            createdAt: item.created_at,
          };
        });

        // Retain any memory-only properties
        const memoryOnly = memory.filter((p) => !fetchedIds.has(p.id));
        const merged = [...propertiesFromDb, ...memoryOnly];
        setMemoryProperties(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn("Supabase server query fallback to local memory properties:", err);
  }

  return getMemoryProperties();
}

/**
 * Looks up a property by ID, title slug, or composite slug.
 */
export async function getPropertyBySlugOrId(identifier: string): Promise<Property | null> {
  if (!identifier) return null;

  const allProps = await getAllProperties();

  // 1. Direct ID match
  const directMatch = allProps.find((p) => p.id === identifier);
  if (directMatch) return directMatch;

  // 2. Slug match: slugify(p.title) === identifier
  const cleanId = decodeURIComponent(identifier).toLowerCase();
  const slugMatch = allProps.find((p) => getPropertySlug(p).toLowerCase() === cleanId);
  if (slugMatch) return slugMatch;

  // 3. Partial or composite match (e.g. slug-id)
  const compositeMatch = allProps.find((p) => {
    const slug = getPropertySlug(p).toLowerCase();
    return cleanId.startsWith(slug) || cleanId.endsWith(p.id.toLowerCase());
  });
  if (compositeMatch) return compositeMatch;

  return null;
}
