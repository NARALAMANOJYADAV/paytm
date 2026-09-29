"use client";

import React from "react";
import Link from "next/link";
import { QrCode, Users, Clock, AlertCircle, CheckCircle2, ArrowRight, SearchCheck, HelpCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/context/AuthContext";
import type { CoordinatorPermission } from "@/lib/types";

export default function CoordinatorOverviewPage() {
  const store = useStore();
  const { role, permissions } = useAuth();
  const can = (p: CoordinatorPermission) => role === "admin" || permissions.includes(p);

  const canCheckin = can("CHECKIN_VIEW") || can("CHECKIN_MANAGE");
  const canRoster = can("PARTICIPANT_VIEW");
  const canVerify = can("REGISTRATION_VERIFY");
  const canSupport = can("SUPPORT_VIEW") || can("SUPPORT_REPLY");
  const canSeeRegistrations = canRoster || canVerify || can("CHECKIN_VIEW");

  const confirmed = store.registrations.filter((r) => r.registration_status === "confirmed").length;
  const checkedIn = store.attendance.length;
  const stats = {
    todayCheckins: checkedIn,
    registered: confirmed,
    awaitingEntry: Math.max(0, confirmed - checkedIn),
    pendingPayments: store.registrations.filter((r) => r.payment_status === "pending").length,
    openSupportTickets: store.supportTickets.filter((t) => t.status === "open" || t.status === "in_progress").length,
  };
  const recentCheckins = store.attendance.slice(0, 6);
  const { eventConfig } = store;
  const dash = "–";

  const attendanceRate = stats.registered
    ? Math.round((stats.todayCheckins / stats.registered) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header plane */}
      <header className="frame bg-paper p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="page-title">Coordinator Dashboard</h1>
          <p className="text-sm text-ink-2">
            {eventConfig.name}
            {eventConfig.venue ? ` · ${eventConfig.venue}` : ""}
          </p>
        </div>
        {can("CHECKIN_MANAGE") && (
          <Link href="/coordinator/checkin" className="btn self-start sm:self-auto">
            <QrCode className="w-4 h-4" aria-hidden="true" />
            <span>Launch QR Scanner</span>
          </Link>
        )}
      </header>

      {/* Metrics */}
      <div className="planes grid-cols-2 lg:grid-cols-4">
        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="cell-label">Checked in</span>
            <CheckCircle2 className="w-4 h-4 text-ok" aria-hidden="true" />
          </div>
          <div className="display num text-4xl sm:text-5xl">{canCheckin ? stats.todayCheckins : dash}</div>
          <span className="text-xs text-ink-2 block num">
            {canCheckin && canSeeRegistrations ? `${attendanceRate}% attendance rate` : "Needs check-in access"}
          </span>
        </div>

        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="cell-label">Confirmed</span>
            <Users className="w-4 h-4 text-ink-2" aria-hidden="true" />
          </div>
          <div className="display num text-4xl sm:text-5xl">{canSeeRegistrations ? stats.registered : dash}</div>
          <span className="text-xs text-ink-2 block num">
            Payment verified · capacity {eventConfig.capacity}
          </span>
        </div>

        {canVerify ? (
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="cell-label">Payments to review</span>
              <Clock className={`w-4 h-4 ${stats.pendingPayments > 0 ? "text-alert" : "text-ink-2"}`} aria-hidden="true" />
            </div>
            <div className="display num text-4xl sm:text-5xl">{stats.pendingPayments}</div>
            <span className="text-xs text-ink-2 block">UTR + screenshot awaiting check</span>
          </div>
        ) : (
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="cell-label">Awaiting entry</span>
              <Clock className="w-4 h-4 text-ink-2" aria-hidden="true" />
            </div>
            <div className="display num text-4xl sm:text-5xl">
              {canCheckin && canSeeRegistrations ? stats.awaitingEntry : dash}
            </div>
            <span className="text-xs text-ink-2 block">Confirmed, not yet scanned</span>
          </div>
        )}

        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="cell-label">Open Support</span>
            <AlertCircle
              className={`w-4 h-4 ${canSupport && stats.openSupportTickets > 0 ? "text-alert" : "text-ink-2"}`}
              aria-hidden="true"
            />
          </div>
          <div className="display num text-4xl sm:text-5xl">{canSupport ? stats.openSupportTickets : dash}</div>
          <span className="text-xs text-ink-2 block">
            {canSupport ? "Tickets requiring response" : "Needs support access"}
          </span>
        </div>
      </div>

      {/* Quick actions + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Quick action planes */}
        <div className="lg:col-span-5 planes grid-cols-1">
          {canCheckin && (
            <Link
              href="/coordinator/checkin"
              className="plane-sky p-6 flex flex-col gap-4 group transition-colors hover:bg-[#f8d9a8]"
            >
              <QrCode className="w-8 h-8" aria-hidden="true" />
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold wide">Open Scanner Station</h2>
                <p className="text-sm leading-relaxed">
                  Verify attendee tickets using your phone or laptop camera. Audio feedback announces successful and duplicate scans instantly.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 font-bold text-sm">
                Gate Check-in Station
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          )}

          {canRoster && (
            <Link
              href="/coordinator/participants"
              className="p-5 flex items-center justify-between gap-3 min-h-[44px] hover:bg-paper-2 transition-colors"
            >
              <span className="flex items-center gap-3 font-bold">
                <Users className="w-5 h-5 text-ink-2" aria-hidden="true" />
                Search Participant Roster
              </span>
              <ArrowRight className="w-4 h-4 text-ink-2" aria-hidden="true" />
            </Link>
          )}

          {canVerify && (
            <Link
              href="/coordinator/verify"
              className="p-5 flex items-center justify-between gap-3 min-h-[44px] hover:bg-paper-2 transition-colors"
            >
              <span className="flex items-center gap-3 font-bold">
                <SearchCheck className="w-5 h-5 text-ink-2" aria-hidden="true" />
                Verify Payments
              </span>
              <span className="flex items-center gap-2">
                {stats.pendingPayments > 0 && (
                  <span className="tag tag-pending num">{stats.pendingPayments} pending</span>
                )}
                <ArrowRight className="w-4 h-4 text-ink-2" aria-hidden="true" />
              </span>
            </Link>
          )}

          {canSupport && (
            <Link
              href="/coordinator/support"
              className="p-5 flex items-center justify-between gap-3 min-h-[44px] hover:bg-paper-2 transition-colors"
            >
              <span className="flex items-center gap-3 font-bold">
                <HelpCircle className="w-5 h-5 text-ink-2" aria-hidden="true" />
                Support Desk
              </span>
              <span className="flex items-center gap-2">
                {stats.openSupportTickets > 0 && (
                  <span className="tag tag-alert num">{stats.openSupportTickets} open</span>
                )}
                <ArrowRight className="w-4 h-4 text-ink-2" aria-hidden="true" />
              </span>
            </Link>
          )}

          {!canCheckin && !canRoster && !canVerify && !canSupport && (
            <p className="p-5 text-sm text-ink-2">
              No desk sections are enabled for your account yet. Ask the event admin to grant permissions.
            </p>
          )}
        </div>

        {/* Recent check-in feed */}
        {canCheckin && (
          <section className="lg:col-span-7 frame bg-paper">
            <div className="flex items-center justify-between gap-3 p-5 rule-b">
              <h2 className="text-xl font-semibold wide">Recent Check-in Activity</h2>
              <span className="tag tag-ok">Live Logs</span>
            </div>

            {recentCheckins.length === 0 ? (
              <p className="p-6 text-sm text-ink-2">No check-ins recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-planes">
                  <thead>
                    <tr>
                      <th scope="col">Participant</th>
                      <th scope="col">Registration</th>
                      <th scope="col" className="text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCheckins.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className="font-bold text-ink block">{item.participant_name}</span>
                          <span className="text-xs text-ink-2">
                            {item.roll_number} · {item.branch}
                          </span>
                        </td>
                        <td className="font-mono text-xs text-ink-2 whitespace-nowrap">
                          {item.registration_number}
                        </td>
                        <td className="text-right whitespace-nowrap">
                          <span className="font-mono text-sm font-bold text-ink block">{item.check_in_time}</span>
                          <span className="text-xs text-ink-2 block">By {item.checked_in_by}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {canRoster && (
              <div className="p-5 rule-t">
                <Link
                  href="/coordinator/participants"
                  className="inline-flex items-center gap-2 min-h-[44px] font-bold text-accent hover:underline"
                >
                  <span className="num">View all {stats.todayCheckins} checked-in participants</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
