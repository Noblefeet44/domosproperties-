import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    
    // Support multiple field names: "files", "file", "images"
    let files: File[] = [];
    
    const uploadedFiles = data.getAll("files") as File[];
    if (uploadedFiles && uploadedFiles.length > 0) {
      files = files.concat(uploadedFiles.filter(f => f && f.name));
    }

    const uploadedImages = data.getAll("images") as File[];
    if (uploadedImages && uploadedImages.length > 0) {
      files = files.concat(uploadedImages.filter(f => f && f.name));
    }

    const singleFile = data.get("file") as File | null;
    if (singleFile && singleFile.name) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided for upload" }, { status: 400 });
    }

    // Process up to 30 files in a single batch
    const targetFiles = files.slice(0, 30);
    const supabase = await createClient();

    if (supabase) {
      const uploadPromises = targetFiles.map(async (file) => {
        try {
          const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'avif'].includes(fileExt) ? fileExt : 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${safeExt}`;
          const filePath = `properties/${fileName}`;

          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const { error: uploadError } = await supabase.storage
            .from("property-images")
            .upload(filePath, buffer, {
              contentType: file.type || `image/${safeExt === 'jpg' ? 'jpeg' : safeExt}`,
              upsert: true,
            });

          if (uploadError) {
            console.warn("Supabase Storage upload warning, falling back to compressed base64:", uploadError.message);
            const mimeType = file.type || "image/jpeg";
            const base64 = buffer.toString("base64");
            return `data:${mimeType};base64,${base64}`;
          }

          const { data: publicUrlData } = supabase.storage
            .from("property-images")
            .getPublicUrl(filePath);

          return publicUrlData.publicUrl;
        } catch (e) {
          console.error("Individual file upload error:", e);
          // Fallback to base64 on error
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = file.type || "image/jpeg";
          return `data:${mimeType};base64,${buffer.toString("base64")}`;
        }
      });

      const urls = await Promise.all(uploadPromises);
      return NextResponse.json({ urls, success: true });
    }

    // Base64 Fallback if Supabase client creation returns null
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
