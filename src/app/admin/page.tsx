"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  CreditCard,
  UserCheck,
  Layers,
  Award,
  HelpCircle,
  Download,
  Calendar,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowRight
} from "lucide-react";
import { loadStore, generateCsvData, triggerDownload } from "@/lib/store";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalRegistrations: 100,
    isteParticipants: 68,
    nonIsteParticipants: 32,
    paid: 100,
    pendingPayment: 0,
    checkedIn: 82,
    teams: 25,
    submissions: 22,
    certificates: 2,
    openSupportTickets: 3,
    totalRevenue: 6600,
  });

  useEffect(() => {
    const store = loadStore();
    const regs = store.registrations;
    const paidRegs = regs.filter((r) => r.payment_status === "success");
    const isteCount = regs.filter((r) => r.registration_type === "iste").length;
    const nonIsteCount = regs.filter((r) => r.registration_type === "non-iste").length;
    const revenue = store.payments.reduce((acc, p) => acc + (p.status === "success" ? p.amount : 0), 0);
    const checkedInCount = store.attendance.length;
    const openTickets = store.supportTickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

    setStats({
      totalRegistrations: regs.length,
      isteParticipants: isteCount,
      nonIsteParticipants: nonIsteCount,
      paid: paidRegs.length,
      pendingPayment: regs.length - paidRegs.length,
      checkedIn: checkedInCount,
      teams: store.teams.length,
      submissions: store.submissions.length,
      certificates: store.certificates.length,
      openSupportTickets: openTickets,
      totalRevenue: revenue,
    });
  }, []);

  const handleExport = (type: "participants" | "attendance" | "payments" | "submissions") => {
    const csv = generateCsvData(type);
    triggerDownload(csv, `nbkrist-p2p-${type}-${Date.now()}.csv`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Event Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Event Executive Summary
          </h1>
          <p className="text-xs text-slate-400">
            Prompt to Production – Paytm AI Workshop • 30 September 2026
          </p>
        </div>

        {/* Quick CSV Export Suite */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExport("participants")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Participants CSV</span>
          </button>
          <button
            onClick={() => handleExport("attendance")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Attendance CSV</span>
          </button>
          <button
            onClick={() => handleExport("payments")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Payments CSV</span>
          </button>
        </div>
      </div>

      {/* Section 41 Required Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Registrations</span>
          <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalRegistrations}</span>
          <span className="text-[10px] text-cyan-400 block">100% capacity reached</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">ISTE Participants</span>
          <span className="text-2xl sm:text-3xl font-black text-cyan-300">{stats.isteParticipants}</span>
          <span className="text-[10px] text-slate-400 block">Subsidized (₹50)</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Non-ISTE Participants</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-300">{stats.nonIsteParticipants}</span>
          <span className="text-[10px] text-slate-400 block">Standard (₹100)</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-emerald-500/30 p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Paid Registrations</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-300">{stats.paid}</span>
          <span className="text-[10px] text-slate-400 block">0 Pending</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-emerald-500/30 p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Total Revenue</span>
          <span className="text-2xl sm:text-3xl font-black text-white">₹{stats.totalRevenue.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-400 block">Via Razorpay Gateway</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-purple-500/30 p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-purple-400 block">Checked In (Gate)</span>
          <span className="text-2xl sm:text-3xl font-black text-purple-300">{stats.checkedIn}</span>
          <span className="text-[10px] text-slate-400 block">{stats.totalRegistrations - stats.checkedIn} Pending</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Hackathon Teams</span>
          <span className="text-2xl sm:text-3xl font-black text-white">{stats.teams}</span>
          <span className="text-[10px] text-slate-400 block">Max 4 per team</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Submissions</span>
          <span className="text-2xl sm:text-3xl font-black text-white">{stats.submissions}</span>
          <span className="text-[10px] text-cyan-400 block">Evaluated by Jury</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Certificates Issued</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-300">{stats.certificates}</span>
          <span className="text-[10px] text-slate-400 block">Tamper-evident QR</span>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-rose-400 block">Open Support</span>
          <span className="text-2xl sm:text-3xl font-black text-rose-300">{stats.openSupportTickets}</span>
          <span className="text-[10px] text-slate-400 block">Tickets in queue</span>
        </div>

      </div>

      {/* Quick Admin Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1: Build Challenge Judging Console */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Jury Judging Console</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Score team submissions across Innovation, AI Prompting, Tech Execution, and Presentation (100 total pts) and update live Leaderboard.
            </p>
          </div>

          <Link
            href="/admin/submissions"
            className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 pt-2"
          >
            <span>Open Judging Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 2: Coordinator Permission Management */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 hover:border-purple-500/40 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Coordinator Access Control</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage event coordinators and toggle granular permission switches (CHECKIN_VIEW, PARTICIPANT_VIEW, SUPPORT_REPLY).
            </p>
          </div>

          <Link
            href="/admin/coordinators"
            className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 pt-2"
          >
            <span>Manage Permissions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Module 3: Event Settings & Fees */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 hover:border-red-500/40 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Event & Pricing Config</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adjust venue, timing, capacity cap (100), registration toggle (Open/Close), and fees (ISTE ₹50 / Non-ISTE ₹100).
            </p>
          </div>

          <Link
            href="/admin/event"
            className="inline-flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 pt-2"
          >
            <span>Configure Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
