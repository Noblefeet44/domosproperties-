import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json([]);
    }
    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedData = (data || []).map((h: any) => ({
      id: h.id,
      title: h.title,
      description: h.description,
      pricePerNight: Number(h.price_per_night),
      location: h.location,
      neighborhood: h.neighborhood,
      starRating: Number(h.star_rating || 4.5),
      reviewsCount: Number(h.reviews_count || 0),
      images: h.images || [],
      amenities: h.amenities || [],
      rooms: h.rooms || [],
      checkInTime: h.check_in_time,
      checkOutTime: h.check_out_time,
      cancellationPolicy: h.cancellation_policy,
      agentId: h.agent_id,
      agentPhone: h.agent_phone,
      googleMapsUrl: h.google_maps_url,
      featured: h.featured,
    }));

    return NextResponse.json(formattedData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ success: true, localOnly: true });
    }

    const dbPayload = {
      id: body.id,
      title: body.title,
      description: body.description,
      price_per_night: body.pricePerNight,
      location: body.location,
      neighborhood: body.neighborhood,
      star_rating: body.starRating || 4.5,
      reviews_count: body.reviewsCount || 0,
      images: body.images || [],
      amenities: body.amenities || [],
      rooms: body.rooms || [],
      check_in_time: body.checkInTime || "2:00 PM",
      check_out_time: body.checkOutTime || "12:00 PM",
      cancellation_policy: body.cancellationPolicy,
      agent_id: body.agentId || body.agent_id || null,
      agent_phone: body.agentPhone || "07073537007",
      google_maps_url: body.googleMapsUrl,
      featured: body.featured || false,
    };

    const { data, error } = await supabase
      .from("hotels")
      .upsert([dbPayload])
      .select();

    if (error) throw error;
    return NextResponse.json(data ? data[0] : dbPayload);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  return POST(req);
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.from("hotels").delete().eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
