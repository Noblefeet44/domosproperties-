"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function YouTubeSetupPage() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<{
    configured: boolean;
    hasClientId: boolean;
    hasClientSecret: boolean;
    hasRefreshToken: boolean;
  } | null>(null);

  const checkStatus = async () => {
    setChecking(true);
    try {
      // Test dummy session request to see which env vars are loaded
      const res = await fetch("/api/youtube/upload-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Test", fileSize: 100, fileType: "video/mp4" }),
      });
      const data = await res.json();
      
      const errStr = data.error || "";
      setStatus({
        configured: res.ok,
        hasClientId: !errStr.includes("YOUTUBE_CLIENT_ID"),
        hasClientSecret: !errStr.includes("YOUTUBE_CLIENT_SECRET"),
        hasRefreshToken: !errStr.includes("YOUTUBE_REFRESH_TOKEN"),
      });
    } catch (e) {
      setStatus({
        configured: false,
        hasClientId: false,
        hasClientSecret: false,
        hasRefreshToken: false,
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">DomosProperty YouTube Connection</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Connect your YouTube channel to enable direct video uploads for all property agents.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-lg border border-slate-700 transition w-fit"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>

        {/* Action Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>🔐</span> 1-Click YouTube Authorization
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Clicking the button below will redirect you to Google to log in with your official DomosProperty YouTube account.
            Once authorized, Google will issue a secure <strong>Refresh Token</strong> for your website backend.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="/api/youtube/auth/init"
              className="inline-flex items-center gap-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-red-900/30 transition transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Authorize DomosProperty YouTube Account
            </a>

            <button
              onClick={checkStatus}
              disabled={checking}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-5 py-3 rounded-xl border border-slate-700 transition"
            >
              {checking ? "Checking Status..." : "Test Connection Status"}
            </button>
          </div>

          {/* Status Results */}
          {status && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="font-semibold text-slate-200">Environment Configuration Status:</div>
              <div className="flex items-center gap-2">
                <span>{status.hasClientId ? "✅" : "❌"}</span>
                <code className="text-slate-300">YOUTUBE_CLIENT_ID</code>
              </div>
              <div className="flex items-center gap-2">
                <span>{status.hasClientSecret ? "✅" : "❌"}</span>
                <code className="text-slate-300">YOUTUBE_CLIENT_SECRET</code>
              </div>
              <div className="flex items-center gap-2">
                <span>{status.hasRefreshToken ? "✅" : "❌"}</span>
                <code className="text-slate-300">YOUTUBE_REFRESH_TOKEN</code>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Guide */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
          <h3 className="text-md font-semibold text-slate-200">Google Cloud Console Setup Checklist</h3>
          <ol className="list-decimal list-inside text-xs text-slate-400 space-y-2.5 leading-relaxed">
            <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-sky-400 underline">Google Cloud Console</a> and create or select your project.</li>
            <li>Enable the <strong>YouTube Data API v3</strong> under <em>APIs & Services ➔ Library</em>.</li>
            <li>Go to <em>APIs & Services ➔ OAuth consent screen</em>, choose <strong>External</strong>, and set App Name to <em>DomosProperty</em>. Add your email as Test User.</li>
            <li>Go to <em>APIs & Services ➔ Credentials</em> ➔ Create <strong>OAuth 2.0 Client ID</strong> (Web application).</li>
            <li>Set Authorized Redirect URI to: <code className="bg-slate-800 text-sky-300 px-2 py-0.5 rounded">https://your-domain.com/api/youtube/auth/callback</code> (or <code className="bg-slate-800 text-sky-300 px-2 py-0.5 rounded">http://localhost:3000/api/youtube/auth/callback</code> for testing).</li>
            <li>Add your <code className="text-emerald-400">YOUTUBE_CLIENT_ID</code> and <code className="text-emerald-400">YOUTUBE_CLIENT_SECRET</code> to your <code className="text-slate-200">.env.local</code> / Vercel Environment Variables.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
