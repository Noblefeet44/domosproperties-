import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Prepare FormData for tmpfiles.org
    const forwardFormData = new FormData();
    forwardFormData.append("file", file);

    const uploadRes = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: forwardFormData,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Upload server error: ${errText}`);
    }

    const uploadData = (await uploadRes.json()) as {
      status: string;
      data?: {
        url?: string;
      };
    };

    if (uploadData.status !== "success" || !uploadData.data?.url) {
      throw new Error("Invalid upload response from host");
    }

    const originalUrl = uploadData.data.url;
    // tmpfiles.org URL format: https://tmpfiles.org/12345/filename.ext
    // Direct link format: https://tmpfiles.org/dl/12345/filename.ext
    const directUrl = originalUrl.replace("https://tmpfiles.org/", "https://tmpfiles.org/dl/");

    return NextResponse.json({ url: directUrl, success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Upload API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
