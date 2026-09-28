"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { QrCode, Users, Clock, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { loadStore } from "@/lib/store";

export default function CoordinatorOverviewPage() {
  const [stats, setStats] = useState({
    todayCheckins: 82,
    registered: 100,
    pendingVerification: 18,
    openSupportTickets: 3,
  });
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);

  useEffect(() => {
    const store = loadStore();
    const confirmedRegs = store.registrations.filter((r) => r.payment_status === "success");
    const checkinCount = store.attendance.length;
    const pending = Math.max(0, confirmedRegs.length - checkinCount);
    const openTickets = store.supportTickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

    setStats({
      todayCheckins: checkinCount,
      registered: confirmedRegs.length,
      pendingVerification: pending,
      openSupportTickets: openTickets,
    });

    setRecentCheckins(store.attendance.slice(0, 6));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>Venue Gate Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Coordinator Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Prompt to Production – Paytm AI Workshop • Seminar Hall, New CSE Block
          </p>
        </div>

        <Link
          href="/coordinator/checkin"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4" />
          <span>Launch QR Scanner</span>
        </Link>
      </div>

      {/* Exact Section 35 Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl bg-slate-900 border border-purple-500/30 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-purple-400">
              Today's Check-ins
            </span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white">
            {stats.todayCheckins}
          </div>
          <span className="text-[10px] text-slate-400 block">
            {Math.round((stats.todayCheckins / stats.registered) * 100)}% attendance rate
          </span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">
              Registered
            </span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white">
            {stats.registered}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Confirmed capacity (100 Max)
          </span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-amber-400">
              Pending Verification
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white">
            {stats.pendingVerification}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Awaiting entry scan
          </span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-rose-400">
              Open Support
            </span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white">
            {stats.openSupportTickets}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Tickets requiring response
          </span>
        </div>

      </div>

      {/* Quick Check-in Launcher & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Action Box */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Gate Check-in Station
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verify attendee tickets using your phone or laptop camera. Audio feedback announces successful and duplicate scans instantly.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-purple-500/20">
            <Link
              href="/coordinator/checkin"
              className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Open Scanner Station</span>
            </Link>

            <Link
              href="/coordinator/participants"
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium text-xs transition-colors flex items-center justify-center gap-2 border border-slate-800"
            >
              <Users className="w-4 h-4" />
              <span>Search Participant Roster</span>
            </Link>
          </div>
        </div>

        {/* Right: Recent Check-in Feed */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Recent Check-in Activity</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Live Logs</span>
          </div>

          <div className="space-y-2.5">
            {recentCheckins.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-white block">{item.participant_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.registration_number} • {item.roll_number} • {item.branch}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-cyan-300 text-xs block font-bold">
                    {item.check_in_time}
                  </span>
                  <span className="text-[9px] text-slate-500 block">By {item.checked_in_by}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/coordinator/participants"
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
            >
              <span>View all {stats.todayCheckins} checked-in participants</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
