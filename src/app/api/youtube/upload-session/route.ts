import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, description, fileSize, fileType } = await req.json();

    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json(
        {
          error:
            "YouTube API credentials are incomplete. Please set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, and YOUTUBE_REFRESH_TOKEN in environment variables.",
        },
        { status: 500 }
      );
    }

    // 1. Refresh OAuth Access Token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.json(
        {
          error: "Failed to obtain access token using YouTube refresh token.",
          details: tokenData,
        },
        { status: 401 }
      );
    }

    const accessToken = tokenData.access_token;

    // 2. Initiate Resumable Upload Session with YouTube Data API v3
    const metadata = {
      snippet: {
        title: title || "DomosProperty Listing Video Tour",
        description:
          description ||
          "Official property video tour hosted on DomosProperty YouTube channel.",
        categoryId: "22", // People & Blogs
      },
      status: {
        privacyStatus: "unlisted", // Embeddable, hidden from YouTube search feed
        embeddable: true,
      },
    };

    const requestOrigin = req.headers.get("origin") || req.nextUrl.origin;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=utf-8",
      "X-Upload-Content-Length": String(fileSize || 0),
      "X-Upload-Content-Type": fileType || "video/mp4",
      Origin: requestOrigin,
    };

    const youtubeRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers,
        body: JSON.stringify(metadata),
      }
    );

    const uploadUrl = youtubeRes.headers.get("Location");

    if (!youtubeRes.ok || !uploadUrl) {
      const errText = await youtubeRes.text();
      return NextResponse.json(
        {
          error: "Failed to initiate YouTube resumable upload session.",
          details: errText,
        },
        { status: youtubeRes.status }
      );
    }

    return NextResponse.json({
      uploadUrl,
      accessToken,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
