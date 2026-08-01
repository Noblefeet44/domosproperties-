import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const uploadUrl = req.headers.get("x-upload-url");
    const contentType = req.headers.get("content-type") || "video/mp4";

    if (!uploadUrl) {
      return NextResponse.json(
        { error: "Missing x-upload-url header" },
        { status: 400 }
      );
    }

    const videoBuffer = await req.arrayBuffer();

    const youtubeRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(videoBuffer.byteLength),
      },
      body: videoBuffer,
    });

    const resText = await youtubeRes.text();

    if (youtubeRes.ok || youtubeRes.status === 308) {
      try {
        const data = JSON.parse(resText);
        return NextResponse.json(data);
      } catch (e) {
        return new NextResponse(resText, { status: youtubeRes.status });
      }
    } else {
      return NextResponse.json(
        { error: `YouTube returned status ${youtubeRes.status}`, details: resText },
        { status: youtubeRes.status }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Proxy upload error" },
      { status: 500 }
    );
  }
}
