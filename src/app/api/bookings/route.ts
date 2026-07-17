import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return NextResponse.json(
      { error: "Airtable credentials are not configured in environment variables." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { id, propertyId, guestName, guestWhatsApp, checkIn, checkOut, guestsCount, totalPrice, addons, status } = body;

    const newRecord = {
      fields: {
        id, // Using the BK-XXXXXX reference as the Airtable record ID
        propertyId: [propertyId], // Linked records require array of IDs in Airtable
        guestName,
        guestWhatsApp,
        checkIn,
        checkOut,
        guestsCount: Number(guestsCount),
        totalPrice: Number(totalPrice),
        addons: addons || "None",
        status: status || "confirmed",
      },
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/Bookings`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRecord),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Airtable Bookings Create Error: ${errText}`);
    }

    const createdRecord = (await response.json()) as { id: string };
    return NextResponse.json({ id: createdRecord.id, success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create booking in Airtable" },
      { status: 500 }
    );
  }
}
