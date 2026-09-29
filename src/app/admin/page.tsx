"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Download,
  Calendar,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { useStore, generateCsvData, triggerDownload } from "@/lib/store";

const formatTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminOverviewPage() {
  const store = useStore();
  const config = store.eventConfig;
  const capacity = config.capacity || 0;

  const stats = useMemo(() => {
    const regs = store.registrations;
    const confirmed = regs.filter((r) => r.payment_status === "success" && r.registration_status === "confirmed");
    const submitted = store.submissions.filter((s) => s.status !== "draft" && s.status !== "not_started");
    return {
      totalRegistrations: regs.length,
      isteParticipants: regs.filter((r) => r.registration_type === "iste").length,
      nonIsteParticipants: regs.filter((r) => r.registration_type === "non-iste").length,
      confirmed: confirmed.length,
      pendingVerification: regs.filter((r) => r.payment_status === "pending").length,
      rejected: regs.filter((r) => r.payment_status === "failed").length,
      checkedIn: store.attendance.filter((a) => a.status === "checked_in").length,
      teams: store.teams.length,
      submissions: submitted.length,
      drafts: store.submissions.length - submitted.length,
      certificates: store.certificates.filter((c) => c.status === "issued").length,
      openSupportTickets: store.supportTickets.filter((t) => t.status === "open" || t.status === "in_progress").length,
      totalRevenue: confirmed.reduce((acc, r) => acc + (r.fee || 0), 0),
    };
  }, [store]);

  const recentRegs = useMemo(
    () =>
      [...store.registrations]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6)
        .map((reg) => {
          const profile = store.profiles.find((p) => p.id === reg.participant_id);
          const user = store.users.find((u) => u.id === profile?.user_id);
          return {
            id: reg.id,
            regNum: reg.registration_number,
            name: profile?.certificate_name || user?.name || "—",
            type: reg.registration_type === "iste" ? "ISTE" : "Regular",
            fee: reg.fee,
            status: reg.payment_status,
            createdAt: reg.created_at,
          };
        }),
    [store],
  );

  const recentCheckIns = useMemo(
    () =>
      [...store.attendance]
        .sort((a, b) => new Date(b.check_in_at ?? 0).getTime() - new Date(a.check_in_at ?? 0).getTime())
        .slice(0, 6)
        .map((a) => ({
          id: a.id,
          regNum: a.registration_number,
          name: a.participant_name,
          branch: a.branch,
          by: a.checked_in_by,
          time: a.check_in_at ? formatTime(a.check_in_at) : a.check_in_time,
        })),
    [store],
  );

  const handleExport = (type: "participants" | "attendance" | "payments" | "submissions") => {
    const csv = generateCsvData(type);
    triggerDownload(csv, `nbkrist-p2p-${type}-${Date.now()}.csv`);
  };

  const fillPct = capacity > 0 ? Math.min(100, Math.round((stats.totalRegistrations / capacity) * 100)) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header plane */}
      <div className="frame bg-paper p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title text-ink">Event Executive Summary</h1>
          <p className="mt-2 text-sm text-ink-2">
            {config.name} – {config.subtitle} • {config.date_formatted}
          </p>
        </div>

        {/* Quick CSV Export Suite */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => handleExport("participants")} className="btn btn-sm min-h-11">
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Participants CSV</span>
          </button>
          <button onClick={() => handleExport("attendance")} className="btn btn-sm min-h-11">
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Attendance CSV</span>
          </button>
          <button onClick={() => handleExport("payments")} className="btn btn-sm min-h-11">
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Payments CSV</span>
          </button>
          <button onClick={() => handleExport("submissions")} className="btn btn-sm min-h-11">
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Submissions CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI row */}
      <section aria-label="Key figures" className="planes grid-cols-2 lg:grid-cols-6">
        <div className="plane-navy col-span-2 lg:col-span-1 p-5 flex flex-col justify-between gap-3">
          <span className="cell-label">Registrations</span>
          <div>
            <span className="num block text-4xl font-semibold wide leading-none">
              {stats.totalRegistrations}
              <span className="text-lg font-bold text-[rgba(255,255,255,0.7)]"> / {capacity}</span>
            </span>
            <span className="mt-2 block text-xs text-[rgba(255,255,255,0.7)]">{fillPct}% of seats filled</span>
          </div>
        </div>

        <Link href="/admin/payments" className="p-5 flex flex-col justify-between gap-3 hover:bg-paper-2">
          <span className="cell-label">Pending verification</span>
          <div>
            <span className={`num block text-2xl sm:text-3xl font-semibold wide leading-none break-words ${stats.pendingVerification > 0 ? "text-accent" : "text-ink"}`}>
              {stats.pendingVerification}
            </span>
            <span className="mt-2 block text-xs text-ink-2">Open the queue</span>
          </div>
        </Link>

        <div className="p-5 flex flex-col justify-between gap-3">
          <span className="cell-label">Confirmed</span>
          <div>
            <span className="num block text-2xl sm:text-3xl font-semibold wide leading-none break-words text-ink">{stats.confirmed}</span>
            <span className="mt-2 block text-xs text-ink-2">{stats.rejected} rejected</span>
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between gap-3">
          <span className="cell-label">Checked in</span>
          <div>
            <span className="num block text-2xl sm:text-3xl font-semibold wide leading-none break-words text-ink">{stats.checkedIn}</span>
            <span className="mt-2 block text-xs text-ink-2">
              {Math.max(0, stats.confirmed - stats.checkedIn)} confirmed not yet at gate
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between gap-3">
          <span className="cell-label">Submissions</span>
          <div>
            <span className="num block text-2xl sm:text-3xl font-semibold wide leading-none break-words text-ink">{stats.submissions}</span>
            <span className="mt-2 block text-xs text-ink-2">{stats.drafts} drafts • {stats.teams} teams</span>
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between gap-3">
          <span className="cell-label">Revenue</span>
          <div>
            <span className="num block text-2xl sm:text-3xl font-semibold wide leading-none break-words text-ink">
              ₹{stats.totalRevenue.toLocaleString()}
            </span>
            <span className="mt-2 block text-xs text-ink-2">Confirmed registration fees</span>
          </div>
        </div>
      </section>

      {/* Secondary figures */}
      <section aria-label="Breakdown" className="planes grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <div className="px-4 py-3">
          <span className="cell-label block">ISTE</span>
          <span className="num block text-xl font-semibold text-ink">{stats.isteParticipants}</span>
          <span className="block text-xs text-ink-2">Subsidized (₹{config.iste_fee})</span>
        </div>
        <div className="px-4 py-3">
          <span className="cell-label block">Non-ISTE</span>
          <span className="num block text-xl font-semibold text-ink">{stats.nonIsteParticipants}</span>
          <span className="block text-xs text-ink-2">Standard (₹{config.non_iste_fee})</span>
        </div>
        <div className="px-4 py-3">
          <span className="cell-label block">Teams</span>
          <span className="num block text-xl font-semibold text-ink">{stats.teams}</span>
          <span className="block text-xs text-ink-2">Max {config.max_team_size} per team</span>
        </div>
        <div className="px-4 py-3">
          <span className="cell-label block">Certificates</span>
          <span className="num block text-xl font-semibold text-ink">{stats.certificates}</span>
          <span className="block text-xs text-ink-2">Issued</span>
        </div>
        <div className="px-4 py-3">
          <span className="cell-label block">Open support</span>
          <span className={`num block text-xl font-semibold ${stats.openSupportTickets > 0 ? "text-alert" : "text-ink"}`}>
            {stats.openSupportTickets}
          </span>
          <span className="block text-xs text-ink-2">Tickets in queue</span>
        </div>
        <div className="px-4 py-3">
          <span className="cell-label block">Rejected payments</span>
          <span className="num block text-xl font-semibold text-ink">{stats.rejected}</span>
          <span className="block text-xs text-ink-2">Awaiting resubmission</span>
        </div>
      </section>

      {/* Recent activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="space-y-3 min-w-0">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold wide text-ink">Latest registrations</h2>
            <Link href="/admin/participants" className="inline-flex items-center gap-1 min-h-11 text-sm font-bold text-ink underline underline-offset-4 decoration-2 decoration-sky hover:decoration-ink">
              All participants
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="frame bg-paper overflow-x-auto">
            <table className="table-planes">
              <thead>
                <tr>
                  <th scope="col">Reg ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">Payment</th>
                  <th scope="col">Registered</th>
                </tr>
              </thead>
              <tbody>
                {recentRegs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-ink-2">No registrations yet.</td>
                  </tr>
                ) : (
                  recentRegs.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono text-xs font-bold text-ink whitespace-nowrap">{r.regNum}</td>
                      <td className="font-bold text-ink whitespace-nowrap">{r.name}</td>
                      <td className="text-ink-2 whitespace-nowrap">
                        {r.type} <span className="num">₹{r.fee}</span>
                      </td>
                      <td>
                        <span className={`tag ${r.status === "success" ? "tag-ok" : r.status === "failed" ? "tag-alert" : "tag-pending"}`}>
                          {r.status === "success" ? "Verified" : r.status === "failed" ? "Rejected" : "Under verification"}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-ink-2 whitespace-nowrap">{formatTime(r.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3 min-w-0">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold wide text-ink">Latest gate check-ins</h2>
            <Link href="/admin/attendance" className="inline-flex items-center gap-1 min-h-11 text-sm font-bold text-ink underline underline-offset-4 decoration-2 decoration-sky hover:decoration-ink">
              Gate attendance
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="frame bg-paper overflow-x-auto">
            <table className="table-planes">
              <thead>
                <tr>
                  <th scope="col">Reg ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Branch</th>
                  <th scope="col">Checked in by</th>
                  <th scope="col">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentCheckIns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-ink-2">No check-ins recorded yet.</td>
                  </tr>
                ) : (
                  recentCheckIns.map((c) => (
                    <tr key={c.id}>
                      <td className="font-mono text-xs font-bold text-ink whitespace-nowrap">{c.regNum}</td>
                      <td className="font-bold text-ink whitespace-nowrap">{c.name}</td>
                      <td className="text-ink-2 whitespace-nowrap">{c.branch}</td>
                      <td className="text-ink-2 whitespace-nowrap">{c.by}</td>
                      <td className="font-mono text-xs text-ink-2 whitespace-nowrap">{c.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Quick Admin Action Modules */}
      <section aria-label="Admin shortcuts" className="planes grid-cols-1 md:grid-cols-3">

        {/* Module 1: Build Challenge Judging Console */}
        <div className="p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-semibold text-ink text-base">
              <Award className="w-5 h-5 text-ink-2" aria-hidden="true" />
              Jury Judging Console
            </h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              Score team submissions across Innovation, AI Prompting, Tech Execution, and Presentation (100 total pts) and update live Leaderboard.
            </p>
          </div>
          <Link href="/admin/submissions" className="btn btn-sm min-h-11 self-start">
            <span>Open Judging Console</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Module 2: Coordinator Permission Management */}
        <div className="p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-semibold text-ink text-base">
              <ShieldCheck className="w-5 h-5 text-ink-2" aria-hidden="true" />
              Coordinator Access Control
            </h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              Manage event coordinators and toggle granular permission switches (<span className="font-mono text-xs">CHECKIN_VIEW</span>, <span className="font-mono text-xs">PARTICIPANT_VIEW</span>, <span className="font-mono text-xs">SUPPORT_REPLY</span>).
            </p>
          </div>
          <Link href="/admin/coordinators" className="btn btn-sm min-h-11 self-start">
            <span>Manage Permissions</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Module 3: Event Settings & Fees */}
        <div className="p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-semibold text-ink text-base">
              <Calendar className="w-5 h-5 text-ink-2" aria-hidden="true" />
              Event & Pricing Config
            </h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              Adjust venue, timing, capacity cap ({capacity}), registration toggle (currently {config.registration_open ? "open" : "closed"}), and fees (ISTE ₹{config.iste_fee} / Non-ISTE ₹{config.non_iste_fee}).
            </p>
          </div>
          <Link href="/admin/event" className="btn btn-sm min-h-11 self-start">
            <span>Configure Settings</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

      </section>

    </div>
  );
}
