import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const generatedBkId = body.id || "BK-" + Math.floor(100000 + Math.random() * 900000);
    const bookingDate = body.bookingDate || new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const supabase = await createClient();
    if (supabase) {
      const dbPayload = {
        id: generatedBkId,
        property_id: String(body.propertyId),
        property_name: body.propertyName,
        property_image: body.propertyImage,
        property_location: body.propertyLocation,
        check_in: body.checkIn,
        check_out: body.checkOut,
        guests_count: body.guestsCount || 1,
        total_price: body.totalPrice,
        status: body.status || "confirmed",
        booking_date: bookingDate,
        addons: body.addons || [],
        guest_name: body.guestName || "Student Guest",
        guest_phone: body.guestPhone || "",
      };

      const { error } = await supabase.from("bookings").insert(dbPayload);

      if (error) {
        console.error("Supabase booking insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ id: generatedBkId, bookingDate, success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
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
