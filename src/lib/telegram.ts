/**
 * DomosProperty Telegram Bot API Helper Library
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface TelegramResponse<T = any> {
  ok: boolean;
  result?: T;
  description?: string;
}

/**
 * Sends a text message to a specific Telegram chat ID.
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  extraOptions: Record<string, any> = {}
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN environment variable is not set.");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
        ...extraOptions,
      }),
    });

    const data: TelegramResponse = await res.json();
    if (!res.ok || !data.ok) {
      console.warn("Telegram sendMessage error:", data.description || res.statusText);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
    return false;
  }
}

/**
 * Edits an existing Telegram message (text + inline keyboard).
 * Used for toggling inline buttons in-place without sending new messages.
 */
export async function editTelegramMessage(
  chatId: string | number,
  messageId: number,
  text: string,
  extraOptions: Record<string, any> = {}
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        ...extraOptions,
      }),
    });

    const data: TelegramResponse = await res.json();
    if (!res.ok || !data.ok) {
      console.warn("Telegram editMessageText error:", data.description || res.statusText);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to edit Telegram message:", err);
    return false;
  }
}

/**
 * Gets direct download URL for a file sent to the Telegram bot (photos/videos).
 * Wraps file_path inside CORS-friendly media proxy endpoint for reliable browser playback.
 */
export async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
    const data: TelegramResponse<{ file_path: string }> = await res.json();

    if (data.ok && data.result?.file_path) {
      const filePath = data.result.file_path;
      return `/api/telegram/media?file_path=${encodeURIComponent(filePath)}`;
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch Telegram file URL:", err);
    return null;
  }
}

/**
 * Registers the Telegram webhook endpoint URL with Telegram servers.
 */
export async function setTelegramWebhook(webhookUrl: string): Promise<{ success: boolean; description?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { success: false, description: "TELEGRAM_BOT_TOKEN is missing in environment variables." };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    });

    const data: TelegramResponse = await res.json();
    return {
      success: Boolean(data.ok),
      description: data.description || (data.ok ? "Webhook set successfully" : "Failed to set webhook"),
    };
  } catch (err: any) {
    return { success: false, description: err?.message || "Network error" };
  }
}

/**
 * Sends a real-time lead notification to an agent's Telegram app when a tenant makes an inquiry on their listing.
 */
export async function sendTelegramLeadNotification(
  agentChatId: string,
  lead: {
    tenantName: string;
    whatsapp: string;
    listingTitle: string;
    moveInDate?: string;
    budgetRange?: string;
    occupation?: string;
  }
): Promise<boolean> {
  if (!agentChatId) return false;

  const cleanPhone = lead.whatsapp.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("234")
    ? cleanPhone
    : cleanPhone.startsWith("0")
    ? "234" + cleanPhone.slice(1)
    : "234" + cleanPhone;

  const message = `
🔔 <b>New Tenant Lead Received on DomosProperty!</b>

👤 <b>Tenant Name:</b> ${lead.tenantName}
💬 <b>WhatsApp Phone:</b> ${lead.whatsapp}
🏢 <b>Property/Listing:</b> ${lead.listingTitle}
${lead.moveInDate ? `📅 <b>Move-In Date:</b> ${lead.moveInDate}\n` : ""}${lead.occupation ? `💼 <b>Occupation:</b> ${lead.occupation}\n` : ""}${lead.budgetRange ? `💰 <b>Budget:</b> ${lead.budgetRange}\n` : ""}
👉 <a href="https://wa.me/${formattedPhone}?text=Hello%20${encodeURIComponent(lead.tenantName)},%20I%20saw%20your%20inquiry%20on%20DomosProperty%20for%20${encodeURIComponent(lead.listingTitle)}.">Click Here to Chat with Tenant on WhatsApp</a>
`;

  return sendTelegramMessage(agentChatId, message);
}
