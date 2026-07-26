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
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const properties: Property[] = data.map((item: any) => ({
          id: String(item.id),
          title: item.title,
          description: item.description || "",
          price: Number(item.price),
          cautionFee: item.caution_fee ? Number(item.caution_fee) : undefined,
          reservationFee: item.reservation_fee ? Number(item.reservation_fee) : undefined,
          agencyFee: item.agency_fee ? Number(item.agency_fee) : undefined,
          inspectionFee: item.inspection_fee ? Number(item.inspection_fee) : undefined,
          legalFee: item.legal_fee ? Number(item.legal_fee) : undefined,
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
          googleMapsUrl: item.google_maps_url,
          rooms: item.rooms || [],
          reviews: [],
        }));
        setMemoryProperties(properties);
        return NextResponse.json(properties);
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
      const dbPayload = {
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
        console.error("Supabase property insert error:", error);
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

      await supabase
        .from("properties")
        .update(dbUpdates)
        .eq("id", String(id));
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
