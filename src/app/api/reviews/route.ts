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
    const { propertyId, guestName, avatar, rating, comment } = body;

    const newRecord = {
      fields: {
        propertyId: [propertyId], // Linked records require array of IDs in Airtable
        guestName,
        avatar,
        rating: Number(rating),
        comment,
        date: new Date().toISOString().split("T")[0], // Store date as YYYY-MM-DD
      },
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/Reviews`,
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
      throw new Error(`Airtable Reviews Create Error: ${errText}`);
    }

    const createdRecord = (await response.json()) as { id: string };
    return NextResponse.json({ id: createdRecord.id, success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("POST /api/reviews error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create review in Airtable" },
      { status: 500 }
    );
  }
}
