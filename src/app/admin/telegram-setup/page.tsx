"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function TelegramSetupPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    success: boolean;
    webhookUrl?: string;
    description?: string;
  } | null>(null);

  const activateWebhook = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/telegram/setup", { method: "POST" });
      const data = await res.json();
      setStatus({
        success: Boolean(data.success),
        webhookUrl: data.webhookUrl,
        description: data.description || data.error,
      });
    } catch (e: any) {
      setStatus({
        success: false,
        description: e?.message || "Failed to activate webhook.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xl font-bold">
                ✈️
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">Telegram Agent Bot Setup</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Enable your Telegram Agent Bot (@DomosPropertyBot) for conversational property publishing and real-time lead push notifications.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-lg border border-slate-700 transition w-fit"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>

        {/* Action Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>🚀</span> 1-Click Telegram Webhook Activation
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Clicking the button below registers your live website endpoint (<code>/api/telegram/webhook</code>) with Telegram servers so your bot responds to agents instantly in real-time.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={activateWebhook}
              disabled={loading}
              className="inline-flex items-center gap-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-sky-900/30 transition transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Activating..." : "⚡ Activate Telegram Webhook"}</span>
            </button>
          </div>

          {/* Status Alert */}
          {status && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                status.success
                  ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                  : "bg-red-950/60 border-red-800 text-red-300"
              }`}
            >
              <div className="font-bold flex items-center gap-2">
                <span>{status.success ? "✅ Webhook Activated Successfully!" : "❌ Webhook Setup Issue"}</span>
              </div>
              {status.webhookUrl && (
                <div>
                  Registered URL: <code className="bg-black/40 px-2 py-0.5 rounded text-sky-300">{status.webhookUrl}</code>
                </div>
              )}
              {status.description && <div>Details: {status.description}</div>}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
          <h3 className="text-md font-semibold text-slate-200">How to Create Your Telegram Bot (Checklist)</h3>
          <ol className="list-decimal list-inside text-xs text-slate-400 space-y-2.5 leading-relaxed">
            <li>Open Telegram on your phone or desktop and search for <strong>@BotFather</strong>.</li>
            <li>Send command <code className="text-sky-300 bg-slate-800 px-1.5 py-0.5 rounded">/newbot</code>.</li>
            <li>Set Name to: <strong className="text-slate-200">DomosProperty Agent Bot</strong>.</li>
            <li>Set Username to: <strong className="text-slate-200">DomosPropertyBot</strong> (or your custom username ending in <em>bot</em>).</li>
            <li>Copy the API Token provided by @BotFather and save it in Vercel as <code className="text-emerald-400 font-bold bg-slate-800 px-1.5 py-0.5 rounded">TELEGRAM_BOT_TOKEN</code>.</li>
            <li>Click the <strong>Activate Telegram Webhook</strong> button above. Done!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
