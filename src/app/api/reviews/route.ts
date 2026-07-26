import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId, guestName, avatar, rating, comment } = body;

    const id = body.id || "rev-" + Math.random().toString(36).substring(2, 9);
    const date = body.date || new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.from("reviews").insert({
        id,
        property_id: String(propertyId),
        guest_name: guestName || "Anonymous Guest",
        avatar: avatar || "AG",
        rating: Number(rating) || 5,
        comment: comment || "",
        date,
      });

      if (error) {
        console.error("Supabase review insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ id, date, ...body, success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    const supabase = await createClient();
    if (supabase && propertyId) {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("property_id", String(propertyId))
        .order("created_at", { ascending: false });

      if (!error && data) {
        return NextResponse.json(data);
      }
    }

    return NextResponse.json([]);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
