import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return new NextResponse(`<h1>OAuth Error</h1><p>${error}</p>`, {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (!code) {
    return new NextResponse(`<h1>Missing Authorization Code</h1>`, {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/youtube/auth/callback`;

  if (!clientId || !clientSecret) {
    return new NextResponse(
      `<h1>Configuration Missing</h1><p>Please ensure YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET are set in environment variables.</p>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok || data.error) {
      return new NextResponse(
        `<h1>Token Exchange Failed</h1><pre>${JSON.stringify(data, null, 2)}</pre>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    const refreshToken = data.refresh_token;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>YouTube Authorization Successful - DomosProperty</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 600px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          h1 { color: #38bdf8; font-size: 24px; margin-top: 0; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .token-box { background: #090d16; border: 1px solid #334155; border-radius: 8px; padding: 14px; font-family: monospace; font-size: 13px; color: #4ade80; word-break: break-all; margin: 16px 0; }
          .btn { display: inline-block; background: #0284c7; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 12px; }
          .btn:hover { background: #0369a1; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✅ YouTube Channel Connected Successfully!</h1>
          <p>Your DomosProperty YouTube account has been authorized for video uploads.</p>
          
          ${
            refreshToken
              ? `
                <p><strong>Copy your Refresh Token:</strong> Add this to your <code>.env.local</code> file or Vercel Environment Variables as <code>YOUTUBE_REFRESH_TOKEN</code>:</p>
                <div class="token-box">${refreshToken}</div>
              `
              : `
                <p>⚡ Access token generated successfully. (If you need a new refresh token, revoke app access in your Google Account security settings and re-authenticate).</p>
              `
          }

          <a href="/admin/youtube-setup" class="btn">Return to YouTube Admin Setup</a>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (err: any) {
    return new NextResponse(`<h1>Server Error</h1><p>${err?.message || err}</p>`, {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}
