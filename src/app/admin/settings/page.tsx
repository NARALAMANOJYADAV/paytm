"use client";

import React, { useState } from "react";
import { Settings, Database, Key, Server, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";
import { resetStore } from "@/lib/store";

export default function AdminSettingsPage() {
  const [resetNotice, setResetNotice] = useState(false);

  const handleResetData = () => {
    if (confirm("Reset local store to initial workshop seed data (100 participants, 82 checked in)?")) {
      resetStore();
      setResetNotice(true);
      setTimeout(() => setResetNotice(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-red-400" />
          <span>Platform & Integration Settings</span>
        </h1>
        <p className="text-xs text-slate-400">
          Environment configuration, PostgreSQL / Supabase connection strings, Razorpay keys, and Resend email setup.
        </p>
      </div>

      {resetNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Store successfully reset to initial seed data!</span>
        </div>
      )}

      <div className="space-y-6">
        
        {/* Supabase PostgreSQL Configuration Box */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Database (PostgreSQL / Supabase)</h2>
              <p className="text-xs text-slate-400">Production relational database connection & RLS policies</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">NEXT_PUBLIC_SUPABASE_URL</label>
              <input
                type="text"
                readOnly
                value="https://nbkrist-p2p-workshop.supabase.co"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</label>
              <input
                type="password"
                readOnly
                value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.nbkrist-anon-production-ready"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Razorpay Gateway Box */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Payment Gateway (Razorpay)</h2>
              <p className="text-xs text-slate-400">Server-side signature verification & order settlement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">RAZORPAY_KEY_ID</label>
              <input
                type="text"
                readOnly
                value="rzp_live_nbkrist_p2p_ai"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">RAZORPAY_KEY_SECRET</label>
              <input
                type="password"
                readOnly
                value="••••••••••••••••••••••••"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Resend Email Box */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Email Service (Resend)</h2>
              <p className="text-xs text-slate-400">Registration receipts, QR ticket links, and reminder triggers</p>
            </div>
          </div>

          <div className="text-xs space-y-2">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">RESEND_API_KEY</label>
              <input
                type="password"
                readOnly
                value="re_12345678_nbkrist_resend_api_live"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Sender domain: <code>tickets@nbkrist.org</code> (Verified DKIM/SPF)
            </p>
          </div>
        </div>

        {/* Maintenance / Demo Reset Box */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Store Maintenance & Seed Reset</h3>
              <p className="text-xs text-slate-400">
                Restore the initial 100 participants, 82 checked in, sample teams, and jury scores.
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Database Seed</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
