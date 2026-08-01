import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, editTelegramMessage, getTelegramFileUrl } from "@/lib/telegram";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from "@/lib/youtube";

// ============================================================================
// CATEGORY-SPECIFIC AMENITIES / FEATURES LISTS
// ============================================================================
const APARTMENT_AMENITIES = [
  "24/7 Industrial Borehole Water",
  "Prepaid Electricity Meter (PHCN)",
  "24/7 Gated Security Guard",
  "Solar Power & Inverter Backup",
  "Standby Generator Backup",
  "PVC Ceiling",
  "Tiled Flooring & POP Ceilings",
  "Fenced Compound & Security Gate",
  "Reading Study Desk & Chair",
  "Daily Waste Management",
  "Ample Car & Bike Parking",
  "Kitchenette with Sink & Cabinets",
  "En-Suite Bathroom & Water Heater",
  "Burglar Proofed Windows",
  "Close to Campus Shuttle Bus Stop",
];

const HOTEL_AMENITIES = [
  "24/7 Air Conditioning",
  "Free High-Speed Fiber Wi-Fi",
  "Swimming Pool & Pool Bar",
  "Complimentary Hot Breakfast",
  "Fitness Gym Center",
  "24/7 Standby Generator Backup",
  "Solar Power Backup",
  "Smart TV with Premium DSTV",
  "Cocktail Lounge & Restaurant",
  "24/7 Gated Security Guard",
  "Free Ample Parking",
  "Airport / Campus Shuttle Service",
  "24-Hour Room Service",
];

const CAR_FEATURES = [
  "Leather Interior",
  "Sunroof / Panoramic Roof",
  "Reverse Camera / Parking Sensors",
  "Cruise Control",
  "Bluetooth / Apple CarPlay / Android Auto",
  "Navigation System / GPS",
  "Keyless Entry & Push Start",
  "Alloy Wheels",
  "LED / Xenon Headlights",
  "Air Conditioning (Dual Zone)",
  "Tinted Windows",
  "Dashcam / Security Tracker",
  "Full Service History / Duty Paid",
  "Low Mileage / Clean Title",
];

const LAND_FEATURES = [
  "Tarred Access Road",
  "Perimeter Fencing",
  "Electricity Nearby (PHCN Pole)",
  "Gated Estate / Security",
  "Commercial Area Frontage",
  "Close to University / School",
  "Survey Plan Available",
  "Drainage / Good Terrain",
  "Borehole Water Nearby",
  "Residential Neighborhood",
];

/** Returns the correct amenities/features list for a given category */
function getAmenitiesForCategory(category: string): string[] {
  switch (category) {
    case "apartment": return APARTMENT_AMENITIES;
    case "hotel": return HOTEL_AMENITIES;
    case "car": return CAR_FEATURES;
    case "land": return LAND_FEATURES;
    default: return APARTMENT_AMENITIES;
  }
}

/** Returns the category label for amenities display */
function getCategoryLabel(category: string): string {
  switch (category) {
    case "apartment": return "🏢 Apartment Amenities";
    case "hotel": return "🏨 Hotel Amenities";
    case "car": return "🚗 Car Features";
    case "land": return "📐 Land Features";
    default: return "✨ Amenities";
  }
}

/** Builds the inline keyboard for amenity toggle buttons */
function buildAmenitiesKeyboard(category: string, selectedIndexes: Set<number>) {
  const amenities = getAmenitiesForCategory(category);
  const rows: { text: string; callback_data: string }[][] = [];

  for (let i = 0; i < amenities.length; i += 2) {
    const row: { text: string; callback_data: string }[] = [];
    const sel1 = selectedIndexes.has(i);
    row.push({
      text: `${sel1 ? "✅" : "⬜"} ${amenities[i]}`,
      callback_data: `amen_${i}`,
    });
    if (i + 1 < amenities.length) {
      const sel2 = selectedIndexes.has(i + 1);
      row.push({
        text: `${sel2 ? "✅" : "⬜"} ${amenities[i + 1]}`,
        callback_data: `amen_${i + 1}`,
      });
    }
    rows.push(row);
  }

  // Add "Done" button at the bottom
  rows.push([{ text: "✅ Done — Continue to Photos", callback_data: "amen_done" }]);

  return { inline_keyboard: rows };
}

// ============================================================================
// IN-MEMORY CONVERSATION STATE
// ============================================================================
interface AgentWizardSession {
  step:
    | "IDLE"
    | "AWAITING_AUTH"
    | "SELECT_CATEGORY"
    | "TITLE"
    | "PRICE"
    | "CAUTION_FEE"
    | "AGENCY_FEE"
    | "INSPECTION_FEE"
    | "LEGAL_FEE"
    | "RESERVATION_FEE"
    | "LOCATION"
    | "NEIGHBORHOOD"
    | "DESCRIPTION"
    | "AMENITIES"
    | "MEDIA";
  agentId?: string;
  agentName?: string;
  agentPhone?: string;
  category?: "apartment" | "hotel" | "car" | "land";
  title?: string;
  price?: number;
  cautionFee?: number;
  agencyFee?: number;
  inspectionFee?: number;
  legalFee?: number;
  reservationFee?: number;
  location?: string;
  neighborhood?: string;
  description?: string;
  images: string[];
  amenities: string[];
  selectedAmenityIndexes: Set<number>;
  amenitiesMessageId?: number;
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
    sessionsStore.telegramSessions.set(chatId, {
      step: "IDLE",
      images: [],
      amenities: [],
      selectedAmenityIndexes: new Set(),
    });
  }
  return sessionsStore.telegramSessions.get(chatId)!;
};

const resetSession = (chatId: string) => {
  const existing = sessionsStore.telegramSessions.get(chatId);
  sessionsStore.telegramSessions.set(chatId, {
    step: "IDLE",
    images: [],
    amenities: [],
    selectedAmenityIndexes: new Set(),
    agentId: existing?.agentId,
    agentName: existing?.agentName,
    agentPhone: existing?.agentPhone,
  });
};

// ============================================================================
// HELPER: START NEW LISTING WIZARD
// ============================================================================
async function startNewListing(chatId: string, session: AgentWizardSession) {
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
      `🔑 <b>Agent Account Required</b>\n\nPlease link your agent account first by entering your registered <b>email address</b> or <b>WhatsApp phone number</b>:`
    );
    return;
  }

  session.step = "SELECT_CATEGORY";
  session.category = undefined;
  session.title = undefined;
  session.price = undefined;
  session.cautionFee = undefined;
  session.agencyFee = undefined;
  session.inspectionFee = undefined;
  session.legalFee = undefined;
  session.reservationFee = undefined;
  session.location = undefined;
  session.neighborhood = undefined;
  session.description = undefined;
  session.images = [];
  session.amenities = [];
  session.selectedAmenityIndexes = new Set();
  session.youtubeVideoId = undefined;
  session.youtubeUrl = undefined;
  session.youtubeThumbnail = undefined;

  await sendTelegramMessage(
    chatId,
    `🏡 <b>New Listing Wizard</b>\n\nWelcome <b>${session.agentName || "Agent"}</b>! Select the category of the property you want to publish:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🏢 Apartment / Hostel", callback_data: "cat_apartment" }],
          [{ text: "🏨 Hotel / Suite", callback_data: "cat_hotel" }],
          [{ text: "🚗 Car Rental", callback_data: "cat_car" }],
          [{ text: "📐 Land Plot", callback_data: "cat_land" }],
        ],
      },
    }
  );
}

// ============================================================================
// HELPER: SHOW ACCOUNT STATUS
// ============================================================================
async function showAccountStatus(chatId: string, session: AgentWizardSession) {
  const supabase = await createClient();
  let agent: any = null;

  if (supabase) {
    const { data } = await supabase
      .from("agent_profiles")
      .select("*")
      .eq("telegram_chat_id", chatId)
      .maybeSingle();
    agent = data;
  }

  if (agent) {
    session.agentId = agent.id;
    session.agentName = agent.name;
    session.agentPhone = agent.whatsapp;

    await sendTelegramMessage(
      chatId,
      `🟢 <b>Account Status: CONNECTED</b>\n\n👤 <b>Agent Name:</b> ${agent.name}\n🆔 <b>Agent ID:</b> <code>${agent.id}</code>\n📱 <b>WhatsApp:</b> ${agent.whatsapp}\n✉️ <b>Email:</b> ${agent.email}\n\nDomosProperty Agent Bot is ready for action!`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "➕ Publish New Listing", callback_data: "new_listing" }],
          ],
        },
      }
    );
  } else {
    session.step = "AWAITING_AUTH";
    await sendTelegramMessage(
      chatId,
      `🔴 <b>Account Status: NOT LINKED</b>\n\nTo link your agent account, please enter your registered <b>email address</b> or <b>WhatsApp phone number</b>:`
    );
  }
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Handle Inline Keyboard Callback Queries
    if (update.callback_query) {
      const callback = update.callback_query;
      const chatId = String(callback.message.chat.id);
      const messageId = callback.message.message_id;
      const data = callback.data;
      const session = getSession(chatId);

      // START NEW LISTING
      if (data === "new_listing" || data === "start_new") {
        await startNewListing(chatId, session);
      }

      // ACCOUNT STATUS
      else if (data === "account_status") {
        await showAccountStatus(chatId, session);
      }

      // CANCEL WIZARD
      else if (data === "cancel_wizard") {
        resetSession(chatId);
        await sendTelegramMessage(
          chatId,
          "🚫 <b>Listing creation cancelled.</b>",
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "➕ Start New Listing", callback_data: "new_listing" }],
              ],
            },
          }
        );
      }

      // SKIP ALL EXTRA FEES AT ONCE
      else if (data === "skip_all_fees") {
        session.cautionFee = 0;
        session.agencyFee = 0;
        session.inspectionFee = 0;
        session.legalFee = 0;
        session.reservationFee = 0;
        session.step = "LOCATION";
        await sendTelegramMessage(
          chatId,
          `⏩ <b>Extra fees skipped!</b>\n\nWhat is the <b>Location Address</b>?\n<i>(e.g., AAU Main Gate Area, Ekpoma)</i>`
        );
      }

      // INDIVIDUAL FEE SKIP CALLBACKS
      else if (data === "skip_caution" && session.step === "CAUTION_FEE") {
        session.cautionFee = 0;
        session.step = "AGENCY_FEE";
        await sendTelegramMessage(
          chatId,
          `Caution Fee set: <b>₦0</b>\n\n🤝 What is the <b>Agency Fee</b> in Naira (₦)?\n<i>(e.g., 35000 or tap Skip)</i>`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "⏭️ Skip Agency Fee (₦0)", callback_data: "skip_agency" }],
                [{ text: "⏩ Skip All Remaining Fees", callback_data: "skip_all_fees" }],
              ],
            },
          }
        );
      } else if (data === "skip_agency" && session.step === "AGENCY_FEE") {
        session.agencyFee = 0;
        session.step = "INSPECTION_FEE";
        await sendTelegramMessage(
          chatId,
          `Agency Fee set: <b>₦0</b>\n\n🔎 What is the <b>Inspection Fee</b> in Naira (₦)?\n<i>(e.g., 5000 or tap Skip)</i>`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "⏭️ Skip Inspection Fee (₦0)", callback_data: "skip_inspection" }],
                [{ text: "⏩ Skip All Remaining Fees", callback_data: "skip_all_fees" }],
              ],
            },
          }
        );
      } else if (data === "skip_inspection" && session.step === "INSPECTION_FEE") {
        session.inspectionFee = 0;
        session.step = "LEGAL_FEE";
        await sendTelegramMessage(
          chatId,
          `Inspection Fee set: <b>₦0</b>\n\n📜 What is the <b>Legal / Agreement Fee</b> in Naira (₦)?\n<i>(e.g., 15000 or tap Skip)</i>`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "⏭️ Skip Legal Fee (₦0)", callback_data: "skip_legal" }],
                [{ text: "⏩ Skip All Remaining Fees", callback_data: "skip_all_fees" }],
              ],
            },
          }
        );
      } else if (data === "skip_legal" && session.step === "LEGAL_FEE") {
        session.legalFee = 0;
        session.step = "RESERVATION_FEE";
        await sendTelegramMessage(
          chatId,
          `Legal Fee set: <b>₦0</b>\n\n📌 What is the <b>Reservation Deposit Fee</b> in Naira (₦)?\n<i>(e.g., 20000 or tap Skip)</i>`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "⏭️ Skip Reservation Deposit (₦0)", callback_data: "skip_reservation" }],
              ],
            },
          }
        );
      } else if (data === "skip_reservation" && session.step === "RESERVATION_FEE") {
        session.reservationFee = 0;
        session.step = "LOCATION";
        await sendTelegramMessage(
          chatId,
          `Reservation Deposit set: <b>₦0</b>\n\nWhat is the <b>Location Address</b>?\n<i>(e.g., AAU Main Gate Area, Ekpoma)</i>`
        );
      }

      // CATEGORY SELECTION
      else if (data.startsWith("cat_")) {
        const cat = data.replace("cat_", "") as "apartment" | "hotel" | "car" | "land";
        session.category = cat;
        session.step = "TITLE";
        await sendTelegramMessage(
          chatId,
          `Selected Category: <b>${cat.toUpperCase()}</b>\n\nWhat is the <b>title</b> of the listing?\n<i>(e.g., Ehis Executive Lodge & Student Apartments)</i>`
        );
      }

      // AMENITY TOGGLE (tap to select/deselect)
      else if (data.startsWith("amen_") && data !== "amen_done" && session.step === "AMENITIES") {
        const index = parseInt(data.replace("amen_", ""));
        if (!isNaN(index)) {
          if (session.selectedAmenityIndexes.has(index)) {
            session.selectedAmenityIndexes.delete(index);
          } else {
            session.selectedAmenityIndexes.add(index);
          }

          // Re-render the keyboard with updated toggle states
          const category = session.category || "apartment";
          const selectedCount = session.selectedAmenityIndexes.size;
          const label = getCategoryLabel(category);

          await editTelegramMessage(
            chatId,
            messageId,
            `${label}\n\nTap to select/deselect. <b>${selectedCount}</b> selected.\nTap <b>"Done"</b> when finished:`,
            {
              reply_markup: buildAmenitiesKeyboard(category, session.selectedAmenityIndexes),
            }
          );
        }
      }

      // AMENITY DONE — resolve selected amenities and proceed to MEDIA
      else if (data === "amen_done" && session.step === "AMENITIES") {
        const category = session.category || "apartment";
        const amenitiesList = getAmenitiesForCategory(category);

        // Convert selected indexes to amenity strings
        session.amenities = Array.from(session.selectedAmenityIndexes)
          .sort((a, b) => a - b)
          .map((i) => amenitiesList[i])
          .filter(Boolean);

        session.step = "MEDIA";

        const selectedSummary =
          session.amenities.length > 0
            ? session.amenities.map((a) => `• ${a}`).join("\n")
            : "<i>None selected</i>";

        await sendTelegramMessage(
          chatId,
          `✅ <b>Amenities saved!</b> (${session.amenities.length} selected)\n${selectedSummary}\n\n📷 <b>Now send photos or a video tour!</b>\nYou can send photo attachments, video files (MP4/MOV), or paste a YouTube video link.\n\nWhen ready, tap the button below to publish:`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "🚀 Publish Listing Now", callback_data: "publish_now" }],
                [{ text: "❌ Cancel", callback_data: "cancel_wizard" }],
              ],
            },
          }
        );
      }

      // PUBLISH
      else if (data === "publish_now") {
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
    if (text === "/cancel" || text.toLowerCase() === "cancel") {
      resetSession(chatId);
      await sendTelegramMessage(
        chatId,
        "🚫 <b>Listing wizard cancelled.</b>",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "➕ Start New Listing", callback_data: "new_listing" }],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    // 2. COMMAND: /start or /help
    if (text === "/start" || text === "/help" || text.toLowerCase() === "help") {
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
          `👋 Welcome back, <b>${linkedAgent.name}</b>!\n\nDomosProperty Agent Bot is active.\n\nTap the button below to start publishing a new property, or use commands:\n• /newlisting - Add a new property\n• /status - Check account connection`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "➕ Publish New Listing", callback_data: "new_listing" }],
                [{ text: "📋 Check Account Status", callback_data: "account_status" }],
              ],
            },
          }
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

    // 3. COMMAND: /status
    if (text === "/status" || text.toLowerCase() === "status") {
      await showAccountStatus(chatId, session);
      return NextResponse.json({ ok: true });
    }

    // 4. STEP: AWAITING_AUTH (Linking account)
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
          `✅ <b>Account Linked Successfully!</b>\n\nWelcome <b>${agentMatch.name}</b>!\n\nTap the button below to publish your first property directly from Telegram.`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "➕ Start Publishing New Listing", callback_data: "new_listing" }],
              ],
            },
          }
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `❌ Could not find an agent profile with email/phone <code>${text}</code>.\n\nPlease check your email/phone or contact DomosProperty support.`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // 5. COMMAND or TEXT TRIGGER: /newlisting or "publish" or "new listing"
    const isNewListingTrigger =
      text === "/newlisting" ||
      text.toLowerCase().includes("publish another") ||
      text.toLowerCase().includes("new listing") ||
      text.toLowerCase() === "new listing" ||
      (session.step === "IDLE" && text.toLowerCase() === "publish");

    if (isNewListingTrigger) {
      await startNewListing(chatId, session);
      return NextResponse.json({ ok: true });
    }

    // 6. STEP: SELECT_CATEGORY (Enforce step selection button)
    if (session.step === "SELECT_CATEGORY") {
      await sendTelegramMessage(
        chatId,
        `⚠️ Please select a category by tapping one of the buttons below:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🏢 Apartment / Hostel", callback_data: "cat_apartment" }],
              [{ text: "🏨 Hotel / Suite", callback_data: "cat_hotel" }],
              [{ text: "🚗 Car Rental", callback_data: "cat_car" }],
              [{ text: "📐 Land Plot", callback_data: "cat_land" }],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    // 7. STEP: TITLE
    if (session.step === "TITLE") {
      if (!text) {
        await sendTelegramMessage(chatId, "⚠️ Please enter a title for your property listing.");
        return NextResponse.json({ ok: true });
      }
      session.title = text;
      session.step = "PRICE";
      await sendTelegramMessage(
        chatId,
        `Title saved: <b>${text}</b>\n\nWhat is the <b>Rent / Price</b> in Naira (₦)?\n<i>(e.g., 350000)</i>`
      );
      return NextResponse.json({ ok: true });
    }

    // 8. STEP: PRICE -> moves to CAUTION_FEE
    if (session.step === "PRICE") {
      const cleanNum = text.replace(/[^0-9]/g, "");
      const num = parseInt(cleanNum);

      if (isNaN(num) || num <= 0) {
        await sendTelegramMessage(chatId, "⚠️ Please enter a valid price in numbers (e.g. 350000).");
        return NextResponse.json({ ok: true });
      }

      session.price = num;
      session.step = "CAUTION_FEE";
      await sendTelegramMessage(
        chatId,
        `Price saved: <b>₦${num.toLocaleString()}</b>\n\n🛡️ What is the <b>Caution Fee / Security Deposit</b> in Naira (₦)?\n<i>(e.g., 30000 or tap Skip below)</i>`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "⏭️ Skip Caution Fee (₦0)", callback_data: "skip_caution" }],
              [{ text: "⏩ Skip All Extra Fees", callback_data: "skip_all_fees" }],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    // 9. STEP: CAUTION_FEE -> moves to AGENCY_FEE
    if (session.step === "CAUTION_FEE") {
      const cleanNum = text.replace(/[^0-9]/g, "");
      const num = parseInt(cleanNum);
      session.cautionFee = !isNaN(num) && num >= 0 ? num : 0;
      session.step = "AGENCY_FEE";
      await sendTelegramMessage(
        chatId,
        `Caution Fee saved: <b>₦${session.cautionFee.toLocaleString()}</b>\n\n🤝 What is the <b>Agency Fee</b> in Naira (₦)?\n<i>(e.g., 35000 or tap Skip below)</i>`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "⏭️ Skip Agency Fee (₦0)", callback_data: "skip_agency" }],
              [{ text: "⏩ Skip All Remaining Fees", callback_data: "skip_all_fees" }],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    // 10. STEP: AGENCY_FEE -> moves to INSPECTION_FEE
    if (session.step === "AGENCY_FEE") {
      const cleanNum = text.replace(/[^0-9]/g, "");
      const num = parseInt(cleanNum);
      session.agencyFee = !isNaN(num) && num >= 0 ? num : 0;
      session.step = "INSPECTION_FEE";
      await sendTelegramMessage(
        chatId,
        `Agency Fee saved: <b>₦${session.agencyFee.toLocaleString()}</b>\n\n🔎 What is the <b>Inspection Fee</b> in Naira (₦)?\n<i>(e.g., 5000 or tap Skip below)</i>`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "⏭️ Skip Inspection Fee (₦0)", callback_data: "skip_inspection" }],
              [{ text: "⏩ Skip All Remaining Fees", callback_data: "skip_all_fees" }],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    // 11. STEP: INSPECTION_FEE -> moves to LEGAL_FEE
    if (session.step === "INSPECTION_FEE") {
      const cleanNum = text.replace(/[^0-9]/g, "");
      const num = parseInt(cleanNum);
      session.inspectionFee = !isNaN(num) && num >= 0 ? num : 0;
      session.step = "LEGAL_FEE";
      await sendTelegramMessage(
        chatId,
        `Inspection Fee saved: <b>₦${session.inspectionFee.toLocaleString()}</b>\n\n📜 What is the <b>Legal / Agreement Fee</b> in Naira (₦)?\n<i>(e.g., 15000 or tap Skip below)</i>`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "⏭️ Skip Legal Fee (₦0)", callback_data: "skip_legal" }],
              [{ text: "⏩ Skip All Remaining Fees", callback_data: "skip_all_fees" }],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    // 12. STEP: LEGAL_FEE -> moves to RESERVATION_FEE
    if (session.step === "LEGAL_FEE") {
      const cleanNum = text.replace(/[^0-9]/g, "");
      const num = parseInt(cleanNum);
      session.legalFee = !isNaN(num) && num >= 0 ? num : 0;
      session.step = "RESERVATION_FEE";
      await sendTelegramMessage(
        chatId,
        `Legal Fee saved: <b>₦${session.legalFee.toLocaleString()}</b>\n\n📌 What is the <b>Reservation Deposit Fee</b> in Naira (₦)?\n<i>(e.g., 20000 or tap Skip below)</i>`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "⏭️ Skip Reservation Deposit (₦0)", callback_data: "skip_reservation" }],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    // 13. STEP: RESERVATION_FEE -> moves to LOCATION
    if (session.step === "RESERVATION_FEE") {
      const cleanNum = text.replace(/[^0-9]/g, "");
      const num = parseInt(cleanNum);
      session.reservationFee = !isNaN(num) && num >= 0 ? num : 0;
      session.step = "LOCATION";
      await sendTelegramMessage(
        chatId,
        `Reservation Deposit saved: <b>₦${session.reservationFee.toLocaleString()}</b>\n\nWhat is the <b>Location Address</b>?\n<i>(e.g., AAU Main Gate Area, Ekpoma)</i>`
      );
      return NextResponse.json({ ok: true });
    }

    // 14. STEP: LOCATION
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

    // 15. STEP: DESCRIPTION -> moves to AMENITIES
    if (session.step === "DESCRIPTION") {
      session.description = text;
      session.step = "AMENITIES";
      session.selectedAmenityIndexes = new Set();

      const category = session.category || "apartment";
      const label = getCategoryLabel(category);

      await sendTelegramMessage(
        chatId,
        `Description saved!\n\n${label}\n\nTap to select/deselect features. Tap <b>"Done"</b> when finished:`,
        {
          reply_markup: buildAmenitiesKeyboard(category, new Set()),
        }
      );
      return NextResponse.json({ ok: true });
    }

    // 16. STEP: AMENITIES (Enforce checklist buttons)
    if (session.step === "AMENITIES") {
      const category = session.category || "apartment";
      const label = getCategoryLabel(category);
      await sendTelegramMessage(
        chatId,
        `👇 Please select features by tapping the buttons below, then tap <b>"Done — Continue to Photos"</b>:\n\n${label}`,
        {
          reply_markup: buildAmenitiesKeyboard(category, session.selectedAmenityIndexes),
        }
      );
      return NextResponse.json({ ok: true });
    }

    // 17. MEDIA HANDLING (Photos, Video Files & YouTube Links sent during MEDIA step)
    if (session.step === "MEDIA") {
      // 17a. Check if text message is a YouTube URL or contains a YouTube link
      const ytVideoId = extractYouTubeVideoId(text);
      if (ytVideoId) {
        const ytThumbnail = getYouTubeThumbnailUrl(ytVideoId);
        session.youtubeVideoId = ytVideoId;
        session.youtubeUrl = text.startsWith("http") ? text : `https://www.youtube.com/watch?v=${ytVideoId}`;
        session.youtubeThumbnail = ytThumbnail || undefined;

        if (ytThumbnail) {
          session.images.push(ytThumbnail);
        }

        await sendTelegramMessage(
          chatId,
          `🎬 <b>YouTube Video Attached!</b>\nVideo ID: <code>${ytVideoId}</code>\n\nThumbnail generated automatically! Send more photos or tap [ 🚀 Publish Listing Now ].`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "🚀 Publish Listing Now", callback_data: "publish_now" }],
                [{ text: "❌ Cancel", callback_data: "cancel_wizard" }],
              ],
            },
          }
        );
        return NextResponse.json({ ok: true });
      }

      // 17b. Check if user sent a VIDEO file (Telegram Video, Animation, Video Note, or Video Document)
      const videoObj =
        message.video ||
        message.animation ||
        message.video_note ||
        (message.document && message.document.mime_type?.startsWith("video/") ? message.document : null);

      if (videoObj) {
        const fileUrl = await getTelegramFileUrl(videoObj.file_id);
        if (fileUrl) {
          session.youtubeUrl = fileUrl;

          // Check if Telegram generated a thumbnail for this video
          const thumbObj = videoObj.thumbnail || videoObj.thumb;
          let thumbUrl: string | null = null;
          if (thumbObj?.file_id) {
            thumbUrl = await getTelegramFileUrl(thumbObj.file_id);
          }

          if (thumbUrl) {
            session.youtubeThumbnail = thumbUrl;
            session.images.unshift(thumbUrl); // Make thumbnail the main image
          } else {
            session.images.unshift(fileUrl);
          }

          await sendTelegramMessage(
            chatId,
            `🎥 <b>Video File Attached!</b> (${session.images.length} media item(s) total).\n\nVideo saved successfully! Send photos or tap [ 🚀 Publish Listing Now ].`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🚀 Publish Listing Now", callback_data: "publish_now" }],
                  [{ text: "❌ Cancel", callback_data: "cancel_wizard" }],
                ],
              },
            }
          );
        }
        return NextResponse.json({ ok: true });
      }

      // 17c. Check if user sent a PHOTO attachment
      if (message.photo) {
        // Highest resolution photo is last element in array
        const photoArr = message.photo;
        const highestRes = photoArr[photoArr.length - 1];
        const fileUrl = await getTelegramFileUrl(highestRes.file_id);

        if (fileUrl) {
          session.images.push(fileUrl);
          await sendTelegramMessage(
            chatId,
            `✅ Photo attached! (${session.images.length} item(s) total).\nSend more photos, video files, or paste a YouTube link, or tap [ Publish Listing Now ].`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🚀 Publish Listing Now", callback_data: "publish_now" }],
                  [{ text: "❌ Cancel", callback_data: "cancel_wizard" }],
                ],
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

      // Step enforcement fallback for text messages sent during MEDIA step
      await sendTelegramMessage(
        chatId,
        `📷 Send photos or video attachments for your listing, or tap <b>"Publish Listing Now"</b> below:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🚀 Publish Listing Now", callback_data: "publish_now" }],
              [{ text: "❌ Cancel", callback_data: "cancel_wizard" }],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    // Default fallback when session step is IDLE and unrecognized message sent
    if (session.step === "IDLE") {
      await sendTelegramMessage(
        chatId,
        `🤖 <b>DomosProperty Agent Bot</b>\n\nTap below to start a new listing or check account status:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "➕ Start New Listing", callback_data: "new_listing" }],
              [{ text: "📋 Check Account Status", callback_data: "account_status" }],
            ],
          },
        }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// ============================================================================
// FINALIZE & PUBLISH LISTING TO SUPABASE
// ============================================================================
async function finalizeAndPublishListing(chatId: string, session: AgentWizardSession) {
  if (!session.title || !session.price || !session.location) {
    await sendTelegramMessage(
      chatId,
      "⚠️ Missing listing details. Please tap below to start a new listing.",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "➕ Start New Listing", callback_data: "new_listing" }],
          ],
        },
      }
    );
    return;
  }

  const supabase = await createClient();
  const category = session.category || "apartment";
  const id = `${category.slice(0, 4)}-` + Math.random().toString(36).substring(2, 9);
  
  // If video thumbnail/video exists and no images were attached, use video thumbnail/URL as main image
  let images = session.images.length > 0 ? session.images : [];
  if (images.length === 0 && session.youtubeThumbnail) {
    images = [session.youtubeThumbnail];
  }
  if (images.length === 0 && session.youtubeUrl) {
    images = [session.youtubeUrl];
  }
  if (images.length === 0) {
    images = ["/images/ehis_hostel.png"];
  }

  const cleanSlug = slugify(session.title);

  const cautionFee = session.cautionFee || 0;
  const agencyFee = session.agencyFee || 0;
  const inspectionFee = session.inspectionFee || 0;
  const legalFee = session.legalFee || 0;
  const reservationFee = session.reservationFee || 0;
  const totalPackage = session.price + cautionFee + agencyFee + inspectionFee + legalFee + reservationFee;

  const payload: Record<string, any> = {
    id,
    title: session.title,
    description: session.description || session.title,
    location: session.location,
    neighborhood: session.neighborhood || "AAU Main Gate Area",
    images,
    agent_id: session.agentId,
    agent_phone: session.agentPhone || "07073537007",
    caution_fee: cautionFee,
    agency_fee: agencyFee,
    inspection_fee: inspectionFee,
    legal_fee: legalFee,
    reservation_fee: reservationFee,
    youtube_video_id: session.youtubeVideoId || null,
    youtube_url: session.youtubeUrl || null,
    youtube_thumbnail: session.youtubeThumbnail || null,
  };

  let publicUrl = `https://domosproperty.org/properties/${cleanSlug}`;

  if (category === "apartment") {
    payload.price = session.price;
    payload.bedrooms = 1;
    payload.bathrooms = 1;
    payload.guests = 2;
    payload.amenities = session.amenities || [];
    if (supabase) await supabase.from("properties").insert(payload);
  } else if (category === "hotel") {
    payload.price_per_night = session.price;
    payload.amenities = session.amenities || [];
    if (supabase) await supabase.from("hotels").insert(payload);
  } else if (category === "car") {
    payload.price = session.price;
    payload.make = "Toyota";
    payload.model = "Camry";
    payload.listing_type = "rent";
    payload.features = session.amenities || [];
    if (supabase) await supabase.from("cars").insert(payload);
  } else if (category === "land") {
    payload.price = session.price;
    payload.size = "1 Plot (600 sqm)";
    payload.features = session.amenities || [];
    if (supabase) await supabase.from("lands").insert(payload);
  }

  // Build comprehensive itemized fee breakdown text summary
  let feeSummary = "";
  if (cautionFee > 0) feeSummary += `\n🛡️ <b>Caution Deposit:</b> ₦${cautionFee.toLocaleString()}`;
  if (agencyFee > 0) feeSummary += `\n🤝 <b>Agency Fee:</b> ₦${agencyFee.toLocaleString()}`;
  if (inspectionFee > 0) feeSummary += `\n🔎 <b>Inspection Fee:</b> ₦${inspectionFee.toLocaleString()}`;
  if (legalFee > 0) feeSummary += `\n📜 <b>Legal Fee:</b> ₦${legalFee.toLocaleString()}`;
  if (reservationFee > 0) feeSummary += `\n📌 <b>Reservation Deposit:</b> ₦${reservationFee.toLocaleString()}`;
  if (totalPackage > session.price) feeSummary += `\n💳 <b>Total Package Amount:</b> ₦${totalPackage.toLocaleString()}`;

  const amenitiesSummary =
    session.amenities && session.amenities.length > 0
      ? `\n✨ <b>Amenities:</b> ${session.amenities.join(", ")}`
      : "\n✨ <b>Amenities:</b> Standard features";

  const videoSummary = session.youtubeUrl ? `\n🎥 <b>Video Tour:</b> Attached` : "";

  resetSession(chatId);

  await sendTelegramMessage(
    chatId,
    `🎉 <b>LISTING PUBLISHED SUCCESSFULLY!</b>\n\n🏢 <b>Title:</b> ${payload.title}\n🆔 <b>Ref ID:</b> <code>${id}</code>\n💰 <b>Base Price:</b> ₦${payload.price?.toLocaleString() || payload.price_per_night?.toLocaleString()}${feeSummary}\n📍 <b>Location:</b> ${payload.location}${amenitiesSummary}${videoSummary}\n📷 <b>Media Attached:</b> ${images.length} item(s)\n👤 <b>Agent:</b> ${session.agentName || "Domos Agent"}\n\n🔗 <b>Live Link:</b>\n${publicUrl}\n\n👇 <b>What would you like to do next?</b>`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "➕ Start New Listing", callback_data: "new_listing" }],
          [{ text: "📋 Check Account Status", callback_data: "account_status" }],
        ],
      },
    }
  );
}
