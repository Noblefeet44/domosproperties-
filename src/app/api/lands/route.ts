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

    const dbPayload = {
      id: body.id,
      title: body.title,
      description: body.description,
      price: body.price,
      size: body.size,
      title_document: body.titleDocument,
      zoning: body.zoning || "Residential",
      status: body.status || "dry_land",
      location: body.location,
      neighborhood: body.neighborhood,
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
      const { error } = await supabase.from("lands").delete().eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
