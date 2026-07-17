import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const files = data.getAll("files") as File[];

    // Fallback if client sent single "file" field
    if (files.length === 0) {
      const file = data.get("file") as File | null;
      if (file) {
        files.push(file);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Limit to 10 files max
    const targetFiles = files.slice(0, 10);

    const uploadPromises = targetFiles.map(async (file) => {
      const catboxForm = new FormData();
      catboxForm.append("reqtype", "fileupload");
      catboxForm.append("fileToUpload", file);

      const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: catboxForm,
      });

      if (!response.ok) {
        throw new Error(`Upload failed for ${file.name}`);
      }

      const fileUrl = await response.text();
      return fileUrl.trim();
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
