import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const files = data.getAll("files") as File[];

    if (files.length === 0) {
      const file = data.get("file") as File | null;
      if (file) {
        files.push(file);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const targetFiles = files.slice(0, 10);
    const supabase = await createClient();

    if (supabase) {
      const uploadPromises = targetFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `properties/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(filePath, buffer, {
            contentType: file.type || "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          console.warn("Supabase Storage upload warning, using base64 fallback:", uploadError);
          const mimeType = file.type || "image/jpeg";
          const base64 = buffer.toString("base64");
          return `data:${mimeType};base64,${base64}`;
        }

        const { data: publicUrlData } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      return NextResponse.json({ urls, success: true });
    }

    // Base64 Fallback if Supabase credentials are missing
    const uploadPromises = targetFiles.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/jpeg";
      const base64 = buffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    });

    const urls = await Promise.all(uploadPromises);
    return NextResponse.json({ urls, success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Upload API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
