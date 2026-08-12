import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json([]);
    }
    const { data, error } = await supabase
      .from("lands")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedData = (data || []).map((l: any) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      price: Number(l.price),
      cautionFee: Number(l.caution_fee || 0),
      reservationFee: Number(l.reservation_fee || 0),
      agencyFee: Number(l.agency_fee || 0),
      inspectionFee: Number(l.inspection_fee || 0),
      legalFee: Number(l.legal_fee || 0),
      size: l.size,
      titleDocument: l.title_document,
      zoning: l.zoning,
      status: l.status,
      location: l.location,
      neighborhood: l.neighborhood,
      images: l.images || [],
      features: l.features || [],
      googleMapsUrl: l.google_maps_url,
      agentId: l.agent_id,
      agentPhone: l.agent_phone,
      youtubeVideoId: l.youtube_video_id,
      youtubeUrl: l.youtube_url,
      youtubeThumbnail: l.youtube_thumbnail,
      featured: l.featured,
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

    const dbPayload: Record<string, any> = {
      id: body.id,
      title: body.title,
      description: body.description,
      price: body.price,
      size: body.size || "1 Plot (600 sqm)",
      title_document: body.titleDocument || "C of O",
      zoning: body.zoning || "Residential",
      status: body.status || "dry_land",
      location: body.location || "AAU Main Gate Area, Ekpoma",
      neighborhood: body.neighborhood || "AAU Main Gate",
      images: body.images || [],
      features: body.features || [],
      google_maps_url: body.googleMapsUrl,
      agent_id: body.agentId || body.agent_id || null,
      agent_phone: body.agentPhone || "07073537007",
      youtube_video_id: body.youtubeVideoId || body.youtube_video_id || null,
      youtube_url: body.youtubeUrl || body.youtube_url || null,
      youtube_thumbnail: body.youtubeThumbnail || body.youtube_thumbnail || null,
      featured: body.featured || false,
    };

    const { data, error } = await supabase
      .from("lands")
      .upsert([dbPayload])
      .select();

    if (error) {
      console.error("Lands API upsert error:", error);
      throw error;
    }
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
      return NextResponse.json({ error: "Land ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ success: true, localOnly: true });
    }

    const dbUpdates: Record<string, any> = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.size) dbUpdates.size = updates.size;
    if (updates.titleDocument) dbUpdates.title_document = updates.titleDocument;
    if (updates.zoning) dbUpdates.zoning = updates.zoning;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.neighborhood) dbUpdates.neighborhood = updates.neighborhood;
    if (updates.images) dbUpdates.images = updates.images;
    if (updates.features) dbUpdates.features = updates.features;
    if (updates.googleMapsUrl !== undefined) dbUpdates.google_maps_url = updates.googleMapsUrl;
    if (updates.agentId !== undefined) dbUpdates.agent_id = updates.agentId;
    if (updates.agentPhone !== undefined) dbUpdates.agent_phone = updates.agentPhone;
    if (updates.youtubeVideoId !== undefined) dbUpdates.youtube_video_id = updates.youtubeVideoId;
    if (updates.youtubeUrl !== undefined) dbUpdates.youtube_url = updates.youtubeUrl;
    if (updates.youtubeThumbnail !== undefined) dbUpdates.youtube_thumbnail = updates.youtubeThumbnail;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;

    const { error } = await supabase
      .from("lands")
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
      const { error } = await supabase.from("lands").delete().eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
