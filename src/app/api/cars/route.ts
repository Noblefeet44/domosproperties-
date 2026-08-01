import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json([]);
    }
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedData = (data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      listingType: c.listing_type === "buy" ? "sale" : c.listing_type || "rent",
      price: Number(c.price),
      make: c.make,
      model: c.model,
      year: Number(c.year),
      transmission: c.transmission,
      fuelType: c.fuel_type,
      seats: Number(c.seats || 5),
      mileage: c.mileage,
      condition: c.condition,
      location: c.location,
      images: c.images || [],
      features: c.features || [],
      agentId: c.agent_id,
      agentPhone: c.agent_phone,
      youtubeVideoId: c.youtube_video_id,
      youtubeUrl: c.youtube_url,
      youtubeThumbnail: c.youtube_thumbnail,
      featured: c.featured,
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
      listing_type: body.listingType === "sale" ? "sale" : body.listingType || "rent",
      price: body.price,
      make: body.make,
      model: body.model,
      year: body.year,
      transmission: body.transmission,
      fuel_type: body.fuelType || "Petrol",
      seats: body.seats || 5,
      mileage: body.mileage || "Low Mileage",
      condition: body.condition,
      location: body.location,
      images: body.images || [],
      features: body.features || [],
      agent_id: body.agentId || body.agent_id || null,
      agent_phone: body.agentPhone || "07073537007",
      youtube_video_id: body.youtubeVideoId || body.youtube_video_id || null,
      youtube_url: body.youtubeUrl || body.youtube_url || null,
      youtube_thumbnail: body.youtubeThumbnail || body.youtube_thumbnail || null,
      featured: body.featured || false,
    };

    const { data, error } = await supabase
      .from("cars")
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
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
