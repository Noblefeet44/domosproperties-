import { NextResponse } from "next/server";
import { INITIAL_PROPERTIES, Property } from "../../data/properties";
import { createClient } from "@/lib/supabase/server";

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
          cautionFee: item.caution_fee ? Number(item.caution_fee) : 0,
          reservationFee: item.reservation_fee ? Number(item.reservation_fee) : 0,
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
        return NextResponse.json(properties);
      }
    }
  } catch (err) {
    console.warn("Supabase properties query fallback to initial static data:", err);
  }

  return NextResponse.json(INITIAL_PROPERTIES);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || "prop-" + Math.random().toString(36).substring(2, 9);

    const supabase = await createClient();
    if (supabase) {
      const dbPayload = {
        id: String(id),
        title: body.title,
        description: body.description,
        price: body.price,
        caution_fee: body.cautionFee || 0,
        reservation_fee: body.reservationFee || 0,
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
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ id: data.id, ...body, success: true });
    }

    return NextResponse.json({ id, ...body, success: true });
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

    const supabase = await createClient();
    if (supabase) {
      const dbUpdates: Record<string, any> = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.cautionFee !== undefined) dbUpdates.caution_fee = updates.cautionFee;
      if (updates.reservationFee !== undefined) dbUpdates.reservation_fee = updates.reservationFee;
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
        return NextResponse.json({ error: error.message }, { status: 500 });
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
