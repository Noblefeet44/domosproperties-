import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, getTelegramFileUrl } from "@/lib/telegram";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

// In-memory conversation state for active Telegram listing wizards
interface AgentWizardSession {
  step:
    | "IDLE"
    | "AWAITING_AUTH"
    | "SELECT_CATEGORY"
    | "TITLE"
    | "PRICE"
    | "LOCATION"
    | "NEIGHBORHOOD"
    | "DESCRIPTION"
    | "MEDIA";
  agentId?: string;
  agentName?: string;
  agentPhone?: string;
  category?: "apartment" | "hotel" | "car" | "land";
  title?: string;
  price?: number;
  location?: string;
  neighborhood?: string;
  description?: string;
  images: string[];
  youtubeVideoId?: string;
  youtubeUrl?: string;
  youtubeThumbnail?: string;
}

const sessionsStore = globalThis as unknown as {
  telegramSessions: Map<string, AgentWizardSession>;
};

if (!sessionsStore.telegramSessions) {
  sessionsStore.telegramSessions = new Map<string, AgentWizardSession>();
}

const getSession = (chatId: string): AgentWizardSession => {
  if (!sessionsStore.telegramSessions.has(chatId)) {
    sessionsStore.telegramSessions.set(chatId, { step: "IDLE", images: [] });
  }
  return sessionsStore.telegramSessions.get(chatId)!;
};

const resetSession = (chatId: string) => {
  sessionsStore.telegramSessions.set(chatId, { step: "IDLE", images: [] });
};

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Handle Inline Keyboard Callback Queries
    if (update.callback_query) {
      const callback = update.callback_query;
      const chatId = String(callback.message.chat.id);
      const data = callback.data;
      const session = getSession(chatId);

      if (data.startsWith("cat_")) {
        const cat = data.replace("cat_", "") as "apartment" | "hotel" | "car" | "land";
        session.category = cat;
        session.step = "TITLE";
        await sendTelegramMessage(
          chatId,
          `Selected Category: <b>${cat.toUpperCase()}</b>\n\nWhat is the <b>title</b> of the listing?\n<i>(e.g., Ehis Executive Lodge & Student Apartments)</i>`
        );
      } else if (data === "publish_now") {
        await finalizeAndPublishListing(chatId, session);
      }

      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const text = message.text?.trim() || "";
    const session = getSession(chatId);

    // 1. COMMAND: /cancel
    if (text === "/cancel") {
      resetSession(chatId);
      await sendTelegramMessage(chatId, "🚫 Current listing wizard cancelled. Send /newlisting to start over.");
      return NextResponse.json({ ok: true });
    }

    // 2. COMMAND: /start or /help
    if (text === "/start" || text === "/help") {
      // Check if agent is already linked in Supabase
      const supabase = await createClient();
      let linkedAgent: any = null;

      if (supabase) {
        const { data } = await supabase
          .from("agent_profiles")
          .select("*")
          .eq("telegram_chat_id", chatId)
          .maybeSingle();
        linkedAgent = data;
      }

      if (linkedAgent) {
        session.agentId = linkedAgent.id;
        session.agentName = linkedAgent.name;
        session.agentPhone = linkedAgent.whatsapp;

        await sendTelegramMessage(
          chatId,
          `👋 Welcome back, <b>${linkedAgent.name}</b>!\n\nDomosProperty Agent Bot is active.\n\nCommands:\n• /newlisting - Add a new property\n• /status - Check account connection`
        );
      } else {
        session.step = "AWAITING_AUTH";
        await sendTelegramMessage(
          chatId,
          `👋 Welcome to <b>DomosProperty Agent Bot</b>!\n\nTo link your agent account, please enter your registered <b>email address</b> or <b>WhatsApp phone number</b>:`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // 3. STEP: AWAITING_AUTH (Linking account)
    if (session.step === "AWAITING_AUTH") {
      const input = text.toLowerCase();
      const supabase = await createClient();
      let agentMatch: any = null;

      if (supabase) {
        const { data } = await supabase
          .from("agent_profiles")
          .select("*")
          .or(`email.ilike.${input},whatsapp.eq.${input}`);
        if (data && data.length > 0) agentMatch = data[0];
      }

      if (agentMatch) {
        // Link telegram_chat_id in Supabase
        if (supabase) {
          await supabase
            .from("agent_profiles")
            .update({ telegram_chat_id: chatId })
            .eq("id", agentMatch.id);
        }

        session.agentId = agentMatch.id;
        session.agentName = agentMatch.name;
        session.agentPhone = agentMatch.whatsapp;
        session.step = "IDLE";

        await sendTelegramMessage(
          chatId,
          `✅ <b>Account Linked Successfully!</b>\n\nWelcome <b>${agentMatch.name}</b>!\n\nSend /newlisting to publish a new property directly from Telegram.`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `❌ Could not find an agent profile with email/phone <code>${text}</code>.\n\nPlease check your email or contact DomosProperty support.`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // 4. COMMAND: /newlisting
    if (text === "/newlisting") {
      if (!session.agentId) {
        // Re-check DB for link
        const supabase = await createClient();
        if (supabase) {
          const { data } = await supabase
            .from("agent_profiles")
            .select("*")
            .eq("telegram_chat_id", chatId)
            .maybeSingle();
          if (data) {
            session.agentId = data.id;
            session.agentName = data.name;
            session.agentPhone = data.whatsapp;
          }
        }
      }

      if (!session.agentId) {
        session.step = "AWAITING_AUTH";
        await sendTelegramMessage(
          chatId,
          `🔑 Please link your agent account first by entering your registered email address:`
        );
        return NextResponse.json({ ok: true });
      }

      session.step = "SELECT_CATEGORY";
      session.images = [];

      await sendTelegramMessage(chatId, "Select the listing category you want to publish:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🏢 Apartment / Hostel", callback_data: "cat_apartment" }],
            [{ text: "🏨 Hotel / Suite", callback_data: "cat_hotel" }],
            [{ text: "🚗 Car Rental", callback_data: "cat_car" }],
            [{ text: "📐 Land Plot", callback_data: "cat_land" }],
          ],
        },
      });
      return NextResponse.json({ ok: true });
    }

    // 5. STEP: TITLE
    if (session.step === "TITLE") {
      session.title = text;
      session.step = "PRICE";
      await sendTelegramMessage(
        chatId,
        `Title saved: <b>${text}</b>\n\nWhat is the <b>Rent / Price</b> in Naira (₦)?\n<i>(e.g., 350000)</i>`
      );
      return NextResponse.json({ ok: true });
    }

    // 6. STEP: PRICE
    if (session.step === "PRICE") {
      const cleanNum = text.replace(/[^0-9]/g, "");
      const num = parseInt(cleanNum);

      if (isNaN(num) || num <= 0) {
        await sendTelegramMessage(chatId, "⚠️ Please enter a valid price in numbers (e.g. 350000).");
        return NextResponse.json({ ok: true });
      }

      session.price = num;
      session.step = "LOCATION";
      await sendTelegramMessage(
        chatId,
        `Price saved: <b>₦${num.toLocaleString()}</b>\n\nWhat is the <b>Location Address</b>?\n<i>(e.g., AAU Main Gate Area, Ekpoma)</i>`
      );
      return NextResponse.json({ ok: true });
    }

    // 7. STEP: LOCATION
    if (session.step === "LOCATION") {
      session.location = text;
      session.neighborhood = "AAU Main Gate Area";
      session.step = "DESCRIPTION";
      await sendTelegramMessage(
        chatId,
        `Location saved: <b>${text}</b>\n\nProvide a brief <b>Description</b> for this listing:`
      );
      return NextResponse.json({ ok: true });
    }

    // 8. STEP: DESCRIPTION
    if (session.step === "DESCRIPTION") {
      session.description = text;
      session.step = "MEDIA";

      await sendTelegramMessage(
        chatId,
        `Description saved!\n\n📷 <b>Now send photos or a video tour!</b>\nSimply send photos/videos as media attachments in this chat.\n\nWhen ready, tap the button below to publish:`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: "🚀 Publish Listing Now", callback_data: "publish_now" }]],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    // 9. MEDIA HANDLING (Photos & Videos sent during MEDIA step)
    if (session.step === "MEDIA") {
      if (message.photo) {
        // Highest resolution photo is last element in array
        const photoArr = message.photo;
        const highestRes = photoArr[photoArr.length - 1];
        const fileUrl = await getTelegramFileUrl(highestRes.file_id);

        if (fileUrl) {
          session.images.push(fileUrl);
          await sendTelegramMessage(
            chatId,
            `✅ Photo attached! (${session.images.length} photo(s) total).\nSend more photos or tap [ Publish Listing Now ].`,
            {
              reply_markup: {
                inline_keyboard: [[{ text: "🚀 Publish Listing Now", callback_data: "publish_now" }]],
              },
            }
          );
        }
        return NextResponse.json({ ok: true });
      }

      if (text === "/publish" || text.toLowerCase() === "publish") {
        await finalizeAndPublishListing(chatId, session);
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

async function finalizeAndPublishListing(chatId: string, session: AgentWizardSession) {
  if (!session.title || !session.price || !session.location) {
    await sendTelegramMessage(chatId, "⚠️ Missing details. Please run /newlisting to start again.");
    return;
  }

  const supabase = await createClient();
  const category = session.category || "apartment";
  const id = `${category.slice(0, 4)}-` + Math.random().toString(36).substring(2, 9);
  const images = session.images.length > 0 ? session.images : ["/images/ehis_hostel.png"];
  const cleanSlug = slugify(session.title);

  const payload: Record<string, any> = {
    id,
    title: session.title,
    description: session.description || session.title,
    location: session.location,
    neighborhood: session.neighborhood || "AAU Main Gate Area",
    images,
    agent_id: session.agentId,
    agent_phone: session.agentPhone || "07073537007",
  };

  let publicUrl = `https://domosproperty.org/properties/${cleanSlug}`;

  if (category === "apartment") {
    payload.price = session.price;
    payload.bedrooms = 1;
    payload.bathrooms = 1;
    payload.guests = 2;
    if (supabase) await supabase.from("properties").insert(payload);
  } else if (category === "hotel") {
    payload.price_per_night = session.price;
    if (supabase) await supabase.from("hotels").insert(payload);
  } else if (category === "car") {
    payload.price = session.price;
    payload.make = "Toyota";
    payload.model = "Camry";
    payload.listing_type = "rent";
    if (supabase) await supabase.from("cars").insert(payload);
  } else if (category === "land") {
    payload.price = session.price;
    payload.size = "1 Plot (600 sqm)";
    if (supabase) await supabase.from("lands").insert(payload);
  }

  resetSession(chatId);

  await sendTelegramMessage(
    chatId,
    `🎉 <b>LISTING PUBLISHED SUCCESSFULLY!</b>\n\n🏢 <b>Title:</b> ${session.title}\n💰 <b>Price:</b> ₦${session.price.toLocaleString()}\n📍 <b>Location:</b> ${session.location}\n\n🔗 <b>Live Link:</b>\n${publicUrl}`
  );
}
