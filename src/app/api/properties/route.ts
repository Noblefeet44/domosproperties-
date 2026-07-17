import { NextResponse } from "next/server";

interface AirtableImage {
  url: string;
  thumbnails?: {
    full?: {
      url: string;
    };
  };
}

interface AirtableReviewRecord {
  id: string;
  createdTime: string;
  fields: {
    guestName?: string;
    avatar?: string;
    rating?: number;
    date?: string;
    comment?: string;
    propertyId?: string[] | string;
  };
}

interface AirtablePropertyRecord {
  id: string;
  fields: {
    title?: string;
    description?: string;
    price?: number;
    location?: string;
    neighborhood?: 'Maitama' | 'Asokoro' | 'Wuse II' | 'Jabi' | 'Garki';
    bedrooms?: number;
    bathrooms?: number;
    guests?: number;
    featured?: boolean;
    images?: AirtableImage[] | string;
    amenities?: string[] | string;
  };
}

export async function GET() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return NextResponse.json(
      { error: "Airtable credentials are not configured in environment variables." },
      { status: 500 }
    );
  }

  try {
    // 1. Fetch all records from Properties Table
    const propsRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/Properties`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 10 }, // Cache on CDN for 10 seconds (ISR)
      }
    );

    if (!propsRes.ok) {
      const errText = await propsRes.text();
      throw new Error(`Airtable Properties Fetch Error: ${errText}`);
    }

    const propsData = (await propsRes.json()) as { records: AirtablePropertyRecord[] };

    // 2. Fetch all records from Reviews Table
    const reviewsRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/Reviews`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 10 },
      }
    );

    let reviewsDataList: AirtableReviewRecord[] = [];
    if (reviewsRes.ok) {
      const data = (await reviewsRes.json()) as { records: AirtableReviewRecord[] };
      reviewsDataList = data.records || [];
    }

    // 3. Map properties and attach their corresponding reviews
    const mappedProperties = propsData.records.map((record) => {
      const fields = record.fields;

      // Map Airtable attachments to array of image URLs
      let images: string[] = [];
      if (Array.isArray(fields.images)) {
        images = fields.images.map((img) => img.url || img.thumbnails?.full?.url || "");
      } else if (typeof fields.images === "string") {
        images = [fields.images];
      }
      images = images.filter(Boolean);
      if (images.length === 0) {
        images = ["/images/maitama.png"];
      }

      // Map amenities list
      let amenities: string[] = [];
      if (Array.isArray(fields.amenities)) {
        amenities = fields.amenities;
      } else if (typeof fields.amenities === "string") {
        amenities = fields.amenities.split(",").map((a) => a.trim());
      }

      // Filter and map reviews for this property
      const matchedReviews = reviewsDataList
        .filter((revRec) => {
          const linkedPropIds = revRec.fields.propertyId;
          if (Array.isArray(linkedPropIds)) {
            return linkedPropIds.includes(record.id);
          }
          return linkedPropIds === record.id;
        })
        .map((revRec) => {
          const revFields = revRec.fields;
          return {
            id: revRec.id,
            guestName: revFields.guestName || "Anonymous Guest",
            avatar: revFields.avatar || "G",
            rating: Number(revFields.rating) || 5,
            date: revFields.date || new Date(revRec.createdTime).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            comment: revFields.comment || "",
          };
        });

      // Calculate rating statistics dynamically on the server
      const reviewsCount = matchedReviews.length;
      const sumRating = matchedReviews.reduce((sum, r) => sum + r.rating, 0);
      const rating = reviewsCount > 0 ? parseFloat((sumRating / reviewsCount).toFixed(2)) : 5.0;

      return {
        id: record.id,
        title: fields.title || "Abuja Shortlet",
        description: fields.description || "",
        price: Number(fields.price) || 80000,
        location: fields.location || "",
        neighborhood: fields.neighborhood || "Maitama",
        bedrooms: Number(fields.bedrooms) || 1,
        bathrooms: Number(fields.bathrooms) || 1,
        guests: Number(fields.guests) || 2,
        featured: fields.featured === true,
        images,
        amenities,
        rating,
        reviewsCount,
        reviews: matchedReviews,
      };
    });

    return NextResponse.json(mappedProperties);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("GET /api/properties error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch properties from Airtable" },
      { status: 500 }
    );
  }
}

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
    const { title, description, price, location, neighborhood, bedrooms, bathrooms, guests, images, amenities } = body;

    const newRecord = {
      fields: {
        title,
        description,
        price: Number(price),
        location,
        neighborhood,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        guests: Number(guests),
        featured: false,
        images: Array.isArray(images) ? images.map((url: string) => ({ url })) : [],
        amenities: Array.isArray(amenities) ? amenities : [],
      },
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/Properties`,
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
      throw new Error(`Airtable Properties Create Error: ${errText}`);
    }

    const createdRecord = (await response.json()) as { id: string };
    return NextResponse.json({ id: createdRecord.id, success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("POST /api/properties error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create property in Airtable" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return NextResponse.json(
      { error: "Airtable credentials are not configured in environment variables." },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing record ID" }, { status: 400 });
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/Properties/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Airtable Properties Delete Error: ${errText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("DELETE /api/properties error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete property from Airtable" },
      { status: 500 }
    );
  }
}
