import { NextResponse } from "next/server";
import { INITIAL_PROPERTIES, Property } from "../../data/properties";
import { createClient } from "@/lib/supabase/server";

// Server-side memory store for properties fallback across devices
const globalForProperties = globalThis as unknown as {
  serverPropertiesStore: Property[];
};

if (!globalForProperties.serverPropertiesStore) {
  globalForProperties.serverPropertiesStore = [...INITIAL_PROPERTIES];
}

const getMemoryProperties = (): Property[] => {
  return globalForProperties.serverPropertiesStore;
};

const setMemoryProperties = (props: Property[]) => {
  globalForProperties.serverPropertiesStore = props;
};

export async function GET() {
  try {
    const currentMemory = getMemoryProperties();
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const fetchedIds = new Set(data.map((item: any) => String(item.id)));
        
        const propertiesFromDb: Property[] = data.map((item: any) => {
          const memProp = currentMemory.find((p) => p.id === String(item.id));
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
          };
        });

        // Retain any memory-only properties created during runtime
        const memoryOnlyProperties = currentMemory.filter((p) => !fetchedIds.has(p.id));
        const mergedProperties = [...propertiesFromDb, ...memoryOnlyProperties];
        
        setMemoryProperties(mergedProperties);
        return NextResponse.json(mergedProperties);
      }
    }
  } catch (err) {
    console.warn("Supabase query fallback to server memory properties:", err);
  }

  return NextResponse.json(getMemoryProperties());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || "prop-" + Math.random().toString(36).substring(2, 9);
    
    const newProperty: Property = {
      ...body,
      id: String(id),
      cautionFee: body.cautionFee !== undefined ? Number(body.cautionFee) : undefined,
      reservationFee: body.reservationFee !== undefined ? Number(body.reservationFee) : undefined,
      agencyFee: body.agencyFee !== undefined ? Number(body.agencyFee) : undefined,
      inspectionFee: body.inspectionFee !== undefined ? Number(body.inspectionFee) : undefined,
      legalFee: body.legalFee !== undefined ? Number(body.legalFee) : undefined,
      rating: body.rating || 5.0,
      reviewsCount: body.reviewsCount || 0,
      featured: body.featured || false,
      reviews: body.reviews || [],
    };

    // Update server memory store immediately
    const currentMemory = getMemoryProperties();
    const updatedMemory = [newProperty, ...currentMemory.filter(p => p.id !== newProperty.id)];
    setMemoryProperties(updatedMemory);

    const supabase = await createClient();
    if (supabase) {
      const dbPayload: Record<string, any> = {
        id: String(id),
        title: body.title,
        description: body.description,
        price: body.price,
        caution_fee: body.cautionFee || 0,
        reservation_fee: body.reservationFee || 0,
        agency_fee: body.agencyFee || 0,
        inspection_fee: body.inspectionFee || 0,
        legal_fee: body.legalFee || 0,
        location: body.location,
        neighborhood: body.neighborhood,
        bedrooms: body.bedrooms || 1,
        bathrooms: body.bathrooms || 1,
        guests: body.guests || 2,
        images: body.images || [],
        amenities: body.amenities || [],
        featured: body.featured || false,
        agent_id: body.agentId || body.agent_id || null,
        agent_phone: body.agentPhone || "07073537007",
        google_maps_url: body.googleMapsUrl || "",
        rooms: body.rooms || [],
      };

      const { data, error } = await supabase
        .from("properties")
        .insert(dbPayload)
        .select()
        .single();

      if (error) {
        console.warn("Supabase insert initial payload error (retrying standard fields):", error.message);
        // Fallback insert without extra fee columns if DB schema doesn't have them yet
        delete dbPayload.agency_fee;
        delete dbPayload.inspection_fee;
        delete dbPayload.legal_fee;

        const { data: fallbackData } = await supabase
          .from("properties")
          .insert(dbPayload)
          .select()
          .single();

        if (fallbackData) {
          return NextResponse.json({ ...newProperty, id: String(fallbackData.id), success: true });
        }
      } else if (data) {
        return NextResponse.json({ ...newProperty, id: String(data.id), success: true });
      }
    }

    return NextResponse.json({ ...newProperty, success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    // Update server memory store
    const currentMemory = getMemoryProperties();
    const updatedMemory = currentMemory.map(p => p.id === String(id) ? { ...p, ...updates } : p);
    setMemoryProperties(updatedMemory);

    const supabase = await createClient();
    if (supabase) {
      const dbUpdates: Record<string, any> = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.cautionFee !== undefined) dbUpdates.caution_fee = updates.cautionFee;
      if (updates.reservationFee !== undefined) dbUpdates.reservation_fee = updates.reservationFee;
      if (updates.agencyFee !== undefined) dbUpdates.agency_fee = updates.agencyFee;
      if (updates.inspectionFee !== undefined) dbUpdates.inspection_fee = updates.inspectionFee;
      if (updates.legalFee !== undefined) dbUpdates.legal_fee = updates.legalFee;
      if (updates.location) dbUpdates.location = updates.location;
      if (updates.neighborhood) dbUpdates.neighborhood = updates.neighborhood;
      if (updates.images) dbUpdates.images = updates.images;
      if (updates.amenities) dbUpdates.amenities = updates.amenities;
      if (updates.rooms) dbUpdates.rooms = updates.rooms;

      const { error } = await supabase
        .from("properties")
        .update(dbUpdates)
        .eq("id", String(id));

      if (error) {
        console.warn("Supabase update error (retrying standard fields):", error.message);
        // Fallback update without custom fee columns if DB schema cache is missing them
        delete dbUpdates.agency_fee;
        delete dbUpdates.inspection_fee;
        delete dbUpdates.legal_fee;

        await supabase
          .from("properties")
          .update(dbUpdates)
          .eq("id", String(id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Update server memory store
      const currentMemory = getMemoryProperties();
      setMemoryProperties(currentMemory.filter(p => p.id !== String(id)));

      const supabase = await createClient();
      if (supabase) {
        await supabase.from("properties").delete().eq("id", String(id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
