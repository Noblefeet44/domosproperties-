import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      whatsapp,
      moveInDate,
      currentCountry,
      budgetRange,
      propertyId,
      propertyTitle,
      propertyLocation,
      propertyPrice,
    } = body;

    if (!name || !email || !whatsapp || !moveInDate || !currentCountry) {
      return NextResponse.json(
        { error: "Missing required inquiry fields (Name, Email, WhatsApp, Move-in Date, Current Country)" },
        { status: 400 }
      );
    }

    // Log Inquiry into Supabase Database & Trigger Telegram Agent Alert
    try {
      const supabase = await createClient();
      if (supabase) {
        let agentId: string | null = null;
        let agentChatId: string | null = null;

        // Try to look up listing agent by propertyId
        if (propertyId) {
          const { data: propData } = await supabase
            .from("properties")
            .select("agent_id")
            .eq("id", String(propertyId))
            .maybeSingle();
          if (propData?.agent_id) {
            agentId = propData.agent_id;
            const { data: agentData } = await supabase
              .from("agent_profiles")
              .select("telegram_chat_id")
              .eq("id", agentId)
              .maybeSingle();
            if (agentData?.telegram_chat_id) {
              agentChatId = agentData.telegram_chat_id;
            }
          }
        }

        // Fallback to super_admin agent if no property-specific agent chat ID
        if (!agentChatId) {
          const { data: adminData } = await supabase
            .from("agent_profiles")
            .select("telegram_chat_id")
            .eq("role", "super_admin")
            .not("telegram_chat_id", "is", null)
            .maybeSingle();
          if (adminData?.telegram_chat_id) {
            agentChatId = adminData.telegram_chat_id;
          }
        }

        await supabase.from("inquiries").insert({
          property_id: propertyId ? String(propertyId) : null,
          property_title: propertyTitle || null,
          property_location: propertyLocation || null,
          property_price: propertyPrice ? Number(propertyPrice) : null,
          name,
          email,
          whatsapp,
          move_in_date: moveInDate,
          current_country: currentCountry,
          budget_range: budgetRange || null,
          agent_id: agentId,
        });

        // Trigger Telegram Lead Notification
        if (agentChatId) {
          const { sendTelegramLeadNotification } = await import("@/lib/telegram");
          await sendTelegramLeadNotification(agentChatId, {
            tenantName: name,
            whatsapp,
            listingTitle: propertyTitle || "Property Inquiry",
            moveInDate,
            budgetRange,
            occupation: currentCountry,
          });
        }
      }
    } catch (dbErr) {
      console.warn("Supabase inquiry insert warning:", dbErr);
    }

    return NextResponse.json({ success: true, message: "Inquiry processed successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("POST /api/inquire error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process inquiry" },
      { status: 500 }
    );
  }
}
