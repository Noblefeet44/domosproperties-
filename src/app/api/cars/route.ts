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
      cautionFee: Number(c.caution_fee || 0),
      reservationFee: Number(c.reservation_fee || 0),
      agencyFee: Number(c.agency_fee || 0),
      inspectionFee: Number(c.inspection_fee || 0),
      legalFee: Number(c.legal_fee || 0),
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
      caution_fee: body.cautionFee || body.caution_fee || 0,
      reservation_fee: body.reservationFee || body.reservation_fee || 0,
      agency_fee: body.agencyFee || body.agency_fee || 0,
      inspection_fee: body.inspectionFee || body.inspection_fee || 0,
      legal_fee: body.legalFee || body.legal_fee || 0,
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
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Car ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ success: true, localOnly: true });
    }

    const dbUpdates: Record<string, any> = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.listingType) dbUpdates.listing_type = updates.listingType;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.cautionFee !== undefined) dbUpdates.caution_fee = updates.cautionFee;
    if (updates.reservationFee !== undefined) dbUpdates.reservation_fee = updates.reservationFee;
    if (updates.agencyFee !== undefined) dbUpdates.agency_fee = updates.agencyFee;
    if (updates.inspectionFee !== undefined) dbUpdates.inspection_fee = updates.inspectionFee;
    if (updates.legalFee !== undefined) dbUpdates.legal_fee = updates.legalFee;
    if (updates.make) dbUpdates.make = updates.make;
    if (updates.model) dbUpdates.model = updates.model;
    if (updates.year !== undefined) dbUpdates.year = updates.year;
    if (updates.transmission) dbUpdates.transmission = updates.transmission;
    if (updates.fuelType) dbUpdates.fuel_type = updates.fuelType;
    if (updates.seats !== undefined) dbUpdates.seats = updates.seats;
    if (updates.mileage) dbUpdates.mileage = updates.mileage;
    if (updates.condition) dbUpdates.condition = updates.condition;
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.images) dbUpdates.images = updates.images;
    if (updates.features) dbUpdates.features = updates.features;
    if (updates.agentId !== undefined) dbUpdates.agent_id = updates.agentId;
    if (updates.agentPhone !== undefined) dbUpdates.agent_phone = updates.agentPhone;
    if (updates.youtubeVideoId !== undefined) dbUpdates.youtube_video_id = updates.youtubeVideoId;
    if (updates.youtubeUrl !== undefined) dbUpdates.youtube_url = updates.youtubeUrl;
    if (updates.youtubeThumbnail !== undefined) dbUpdates.youtube_thumbnail = updates.youtubeThumbnail;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;

    const { error } = await supabase
      .from("cars")
      .update(dbUpdates)
      .eq("id", String(id));

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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
