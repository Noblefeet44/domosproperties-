import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Telegram Media Proxy Route
 * Streams Telegram photos and videos cleanly to web browsers with proper CORS & Range headers.
 * Resolves CORS blocks and expired link issues for Telegram attachments.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get("file_path");

    if (!filePath) {
      return new NextResponse("Missing file_path parameter", { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return new NextResponse("TELEGRAM_BOT_TOKEN environment variable is not configured", { status: 500 });
    }

    // Telegram Bot API Direct File Download URL
    const telegramUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

    const rangeHeader = req.headers.get("range");
    const headers: Record<string, string> = {};
    if (rangeHeader) {
      headers["Range"] = rangeHeader;
    }

    const res = await fetch(telegramUrl, { headers });

    if (!res.ok) {
      return new NextResponse(`Failed to fetch media from Telegram: ${res.statusText}`, { status: res.status });
    }

    const ext = filePath.split(".").pop()?.toLowerCase() || "";
    let contentType = res.headers.get("content-type") || "application/octet-stream";

    if (["mp4", "mov", "avi", "webm", "m4v", "mkv"].includes(ext)) {
      contentType = "video/mp4";
    } else if (["jpg", "jpeg"].includes(ext)) {
      contentType = "image/jpeg";
    } else if (ext === "png") {
      contentType = "image/png";
    } else if (ext === "webp") {
      contentType = "image/webp";
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Cache-Control", "public, max-age=31536000, immutable");

    const contentLength = res.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    const contentRange = res.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
      responseHeaders.set("Accept-Ranges", "bytes");
      return new NextResponse(res.body, {
        status: 206,
        headers: responseHeaders,
      });
    }

    responseHeaders.set("Accept-Ranges", "bytes");
    return new NextResponse(res.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error("Telegram Media Proxy Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
