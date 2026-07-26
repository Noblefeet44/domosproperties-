import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      whatsapp,
      moveInDate,
      currentCountry,
      budgetRange,
      propertyId,
      propertyTitle,
      propertyLocation,
      propertyPrice,
    } = body;

    if (!name || !email || !whatsapp || !moveInDate || !currentCountry) {
      return NextResponse.json(
        { error: "Missing required inquiry fields (Name, Email, WhatsApp, Move-in Date, Current Country)" },
        { status: 400 }
      );
    }

    // Log Inquiry into Supabase Database
    try {
      const supabase = await createClient();
      if (supabase) {
        await supabase.from("inquiries").insert({
          property_id: propertyId ? String(propertyId) : null,
          property_title: propertyTitle || null,
          property_location: propertyLocation || null,
          property_price: propertyPrice ? Number(propertyPrice) : null,
          name,
          email,
          whatsapp,
          move_in_date: moveInDate,
          current_country: currentCountry,
          budget_range: budgetRange || null,
        });
      }
    } catch (dbErr) {
      console.warn("Supabase inquiry insert warning:", dbErr);
    }

    return NextResponse.json({ success: true, message: "Inquiry processed successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("POST /api/inquire error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process inquiry" },
      { status: 500 }
    );
  }
}
