import { NextRequest, NextResponse } from "next/server";
import { setTelegramWebhook } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const webhookUrl = `${origin}/api/telegram/webhook`;

    const result = await setTelegramWebhook(webhookUrl);

    return NextResponse.json({
      webhookUrl,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Setup failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
