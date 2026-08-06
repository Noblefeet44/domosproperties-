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
      cautionFee: Number(h.caution_fee || 0),
      reservationFee: Number(h.reservation_fee || 0),
      agencyFee: Number(h.agency_fee || 0),
      inspectionFee: Number(h.inspection_fee || 0),
      legalFee: Number(h.legal_fee || 0),
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
      youtubeVideoId: h.youtube_video_id,
      youtubeUrl: h.youtube_url,
      youtubeThumbnail: h.youtube_thumbnail,
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
      caution_fee: body.cautionFee || body.caution_fee || 0,
      reservation_fee: body.reservationFee || body.reservation_fee || 0,
      agency_fee: body.agencyFee || body.agency_fee || 0,
      inspection_fee: body.inspectionFee || body.inspection_fee || 0,
      legal_fee: body.legalFee || body.legal_fee || 0,
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
      youtube_video_id: body.youtubeVideoId || body.youtube_video_id || null,
      youtube_url: body.youtubeUrl || body.youtube_url || null,
      youtube_thumbnail: body.youtubeThumbnail || body.youtube_thumbnail || null,
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
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Hotel ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ success: true, localOnly: true });
    }

    const dbUpdates: Record<string, any> = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.pricePerNight !== undefined) dbUpdates.price_per_night = updates.pricePerNight;
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
    if (updates.checkInTime) dbUpdates.check_in_time = updates.checkInTime;
    if (updates.checkOutTime) dbUpdates.check_out_time = updates.checkOutTime;
    if (updates.cancellationPolicy !== undefined) dbUpdates.cancellation_policy = updates.cancellationPolicy;
    if (updates.agentId !== undefined) dbUpdates.agent_id = updates.agentId;
    if (updates.agentPhone !== undefined) dbUpdates.agent_phone = updates.agentPhone;
    if (updates.youtubeVideoId !== undefined) dbUpdates.youtube_video_id = updates.youtubeVideoId;
    if (updates.youtubeUrl !== undefined) dbUpdates.youtube_url = updates.youtubeUrl;
    if (updates.youtubeThumbnail !== undefined) dbUpdates.youtube_thumbnail = updates.youtubeThumbnail;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
    if (updates.googleMapsUrl !== undefined) dbUpdates.google_maps_url = updates.googleMapsUrl;

    const { error } = await supabase
      .from("hotels")
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
      const { error } = await supabase.from("hotels").delete().eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
