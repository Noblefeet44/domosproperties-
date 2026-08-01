import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.YOUTUBE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "YOUTUBE_CLIENT_ID environment variable is missing." },
      { status: 400 }
    );
  }

  // Construct absolute redirect URL dynamically from request URL
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/youtube/auth/callback`;

  const scope = "https://www.googleapis.com/auth/youtube.upload";
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(authUrl.toString());
}
