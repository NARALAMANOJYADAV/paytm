"use client";

import React, { useMemo, useState } from "react";
import { Search, CheckCircle2, Clock } from "lucide-react";
import { processCheckIn, useStore } from "@/lib/store";
import { useAuth } from "@/lib/context/AuthContext";
import type { CoordinatorPermission } from "@/lib/types";

export default function CoordinatorParticipantsPage() {
  const { role, permissions } = useAuth();
  const can = (p: CoordinatorPermission) => role === "admin" || permissions.includes(p);
  const canCheckIn = can("CHECKIN_MANAGE");
  const canSeeAttendance = can("CHECKIN_VIEW") || canCheckIn;

  const store = useStore();
  const { eventConfig } = store;
  const [searchTerm, setSearchTerm] = useState("");
  const [busyReg, setBusyReg] = useState<string | null>(null);
  const [rowMessage, setRowMessage] = useState<{ reg: string; kind: "ok" | "warn" | "error"; text: string } | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all"); // all, checked_in, not_checked_in
  const [isteFilter, setIsteFilter] = useState("all"); // all, iste, non-iste
  const [branchFilter, setBranchFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const participants = useMemo(
    () =>
      store.registrations.map((reg) => {
        const profile = store.profiles.find((p) => p.id === reg.participant_id);
        const user = profile ? store.users.find((u) => u.id === profile.user_id) : undefined;
        const att = store.attendance.find(
          (a) => a.registration_number.toUpperCase() === reg.registration_number.toUpperCase()
        );
        return {
          id: reg.id,
          registrationNumber: reg.registration_number,
          name: profile?.certificate_name || user?.name || "Participant",
          rollNumber: profile?.roll_number || "—",
          year: profile?.year || "—",
          branch: profile?.branch || "—",
          section: profile?.section || "—",
          isteMember: profile?.iste_member ?? false,
          paymentStatus: reg.payment_status,
          confirmed: reg.registration_status === "confirmed" && reg.payment_status === "success",
          isCheckedIn: !!att,
          checkInTime: att?.check_in_time,
        };
      }),
    [store]
  );

  const handleManualCheckin = async (regNumber: string) => {
    setBusyReg(regNumber);
    setRowMessage(null);
    try {
      const res = await processCheckIn(regNumber);
      setRowMessage({
        reg: regNumber,
        kind: res.status === "verified" ? "ok" : res.status === "already_checked_in" ? "warn" : "error",
        text: res.message,
      });
    } catch (err) {
      setRowMessage({ reg: regNumber, kind: "error", text: err instanceof Error ? err.message : "Check-in failed." });
    } finally {
      setBusyReg(null);
    }
  };

  const filtered = participants.filter((p) => {
    // Search filter: name, roll number, registration ID
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      p.rollNumber.toLowerCase().includes(query) ||
      p.registrationNumber.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (statusFilter === "checked_in" && !p.isCheckedIn) return false;
    if (statusFilter === "not_checked_in" && p.isCheckedIn) return false;

    if (isteFilter === "iste" && !p.isteMember) return false;
    if (isteFilter === "non-iste" && p.isteMember) return false;

    if (branchFilter !== "all" && p.branch !== branchFilter) return false;
    if (yearFilter !== "all" && p.year !== yearFilter) return false;

    return true;
  });

  const selects = [
    {
      id: "filter-status",
      label: "Attendance",
      value: statusFilter,
      set: setStatusFilter,
      options: [
        ["all", "All Status"],
        ["checked_in", "Checked In"],
        ["not_checked_in", "Not Checked In"],
      ],
    },
    {
      id: "filter-iste",
      label: "ISTE Status",
      value: isteFilter,
      set: setIsteFilter,
      options: [
        ["all", "All Memberships"],
        ["iste", `ISTE Member (₹${eventConfig.iste_fee})`],
        ["non-iste", `Non-ISTE (₹${eventConfig.non_iste_fee})`],
      ],
    },
    {
      id: "filter-branch",
      label: "Branch",
      value: branchFilter,
      set: setBranchFilter,
      options: [
        ["all", "All Branches"],
        ["AI & DS", "AI & DS"],
        ["IT", "IT"],
        ["CSE", "CSE"],
        ["ECE", "ECE"],
        ["EEE", "EEE"],
        ["Mechanical", "Mechanical"],
        ["Civil", "Civil"],
      ],
    },
    {
      id: "filter-year",
      label: "Year of Study",
      value: yearFilter,
      set: setYearFilter,
      options: [
        ["all", "All Years"],
        ["4th Year", "4th Year"],
        ["3rd Year", "3rd Year"],
        ["2nd Year", "2nd Year"],
        ["1st Year", "1st Year"],
      ],
    },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header plane */}
      <header className="frame bg-paper p-5 sm:p-6 space-y-1">
        <h1 className="page-title">Participant Roster</h1>
        <p className="text-sm text-ink-2 num" aria-live="polite">
          Showing {filtered.length} of {participants.length} registered students.
        </p>
      </header>

      {/* Search & filter controls */}
      <div className="frame bg-paper p-5 space-y-4">
        <div>
          <label htmlFor="roster-search" className="field-label">
            Search participants
          </label>
          <div className="relative">
            <Search
              className="w-5 h-5 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="roster-search"
              type="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="Name, roll number, or registration ID (e.g. P2P-2026-A8F92X)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="field pl-11 text-base min-h-[52px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3">
          {selects.filter((f) => f.id !== "filter-status" || canSeeAttendance).map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="field-label">
                {f.label}
              </label>
              <select
                id={f.id}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                className="field"
              >
                {f.options.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Participants table */}
      <div className="frame bg-paper overflow-x-auto">
        <table className="table-planes">
          <thead>
            <tr>
              <th scope="col">Registration ID</th>
              <th scope="col">Participant Name</th>
              <th scope="col">Roll Number</th>
              <th scope="col">Branch &amp; Year</th>
              <th scope="col">Sec</th>
              <th scope="col">ISTE</th>
              <th scope="col">Payment</th>
              <th scope="col">Attendance</th>
              <th scope="col" className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-ink-2 py-8 text-center">
                  No participants match these filters.
                </td>
              </tr>
            )}
            {filtered.map((item) => (
              <tr key={item.id}>
                <td className="font-mono text-xs font-bold whitespace-nowrap">
                  {item.registrationNumber}
                </td>
                <td className="font-bold whitespace-nowrap">{item.name}</td>
                <td className="font-mono text-xs text-ink-2 whitespace-nowrap">{item.rollNumber}</td>
                <td className="whitespace-nowrap">
                  {item.branch} · {item.year.split(" ")[0]}
                </td>
                <td className="font-bold text-center">{item.section}</td>
                <td>
                  <span className={`tag ${item.isteMember ? "tag-info" : ""}`}>
                    {item.isteMember ? "ISTE" : "Regular"}
                  </span>
                </td>
                <td>
                  <span
                    className={`tag ${
                      item.paymentStatus === "success"
                        ? "tag-ok"
                        : item.paymentStatus === "failed"
                        ? "tag-alert"
                        : "tag-pending"
                    }`}
                  >
                    {item.paymentStatus}
                  </span>
                </td>
                <td>
                  {!canSeeAttendance ? (
                    <span className="text-xs text-ink-2">—</span>
                  ) : item.isCheckedIn ? (
                    <span className="tag tag-ok">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="font-mono normal-case">{item.checkInTime || "In"}</span>
                    </span>
                  ) : (
                    <span className="tag tag-pending">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Pending</span>
                    </span>
                  )}
                </td>
                <td className="text-right">
                  {item.isCheckedIn ? (
                    <span className="text-xs text-ink-2">Verified</span>
                  ) : !canCheckIn ? (
                    <span className="text-xs text-ink-2">—</span>
                  ) : !item.confirmed ? (
                    <span className="text-xs text-ink-2">Payment not verified</span>
                  ) : (
                    <button
                      onClick={() => handleManualCheckin(item.registrationNumber)}
                      disabled={busyReg !== null}
                      aria-busy={busyReg === item.registrationNumber}
                      className="btn btn-sm min-h-[44px]"
                    >
                      {busyReg === item.registrationNumber ? "Checking in…" : "Check In"}
                    </button>
                  )}
                  {rowMessage?.reg === item.registrationNumber && (
                    <span
                      role={rowMessage.kind === "error" ? "alert" : "status"}
                      className={`block text-xs mt-1 max-w-[16rem] ml-auto text-left ${
                        rowMessage.kind === "ok" ? "text-ok" : rowMessage.kind === "warn" ? "text-ink" : "text-alert"
                      }`}
                    >
                      {rowMessage.text}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
