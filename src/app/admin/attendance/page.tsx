"use client";

import React, { useState } from "react";
import { Download, Search, UserPlus } from "lucide-react";
import { useStore, generateCsvData, triggerDownload, processCheckIn } from "@/lib/store";

type Feedback = { tone: "ok" | "warn" | "alert"; text: string };

export default function AdminAttendancePage() {
  const store = useStore();
  const records = store.attendance;
  const confirmedCount = store.registrations.filter(
    (r) => r.payment_status === "success" && r.registration_status === "confirmed",
  ).length;
  const [search, setSearch] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [checking, setChecking] = useState(false);

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) {
      setFeedback({ tone: "warn", text: "Enter a registration ID, or find the student in “Not yet checked in” below." });
      return;
    }
    await checkIn(code);
  };

  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const checkIn = async (code: string) => {
    setChecking(true);
    setFeedback(null);
    try {
      const res = await processCheckIn(code);
      const who = res.participant ? ` ${res.participant.name} (${res.participant.registrationNumber})` : "";
      setFeedback({
        tone: res.status === "verified" ? "ok" : res.status === "already_checked_in" ? "warn" : "alert",
        text: `${res.message}${res.status === "verified" ? who : ""}`,
      });
      if (res.status === "verified") setManualCode("");
    } catch (err) {
      setFeedback({ tone: "alert", text: err instanceof Error ? err.message : "Check-in failed." });
    } finally {
      setChecking(false);
      setRowBusy(null);
    }
  };

  // Paid students who have not been checked in yet (for one-click check-in at the desk).
  const checkedRegs = new Set(records.map((r) => r.registration_number));
  const q = search.toLowerCase();
  const waiting = store.registrations
    .filter((r) => r.payment_status === "success" && r.registration_status === "confirmed" && !checkedRegs.has(r.registration_number))
    .map((r) => ({ reg: r, profile: store.profiles.find((p) => p.id === r.participant_id) }))
    .filter(({ reg, profile }) =>
      !q || reg.registration_number.toLowerCase().includes(q) ||
      (profile?.certificate_name ?? "").toLowerCase().includes(q) || (profile?.roll_number ?? "").toLowerCase().includes(q));

  const handleExport = () => {
    const csv = generateCsvData("attendance");
    triggerDownload(csv, `nbkrist-p2p-attendance-${Date.now()}.csv`);
  };

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.participant_name.toLowerCase().includes(q) ||
      r.registration_number.toLowerCase().includes(q) ||
      r.roll_number.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="frame bg-paper p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title text-ink">Gate Attendance &amp; Check-in Audit</h1>
          <p className="mt-2 text-sm text-ink-2">
            Everyone checked in at the Seminar Hall-1 gate, with time and verifier.
          </p>
        </div>
        <button onClick={handleExport} className="btn self-start sm:self-auto">
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Export Attendance Register (CSV)</span>
        </button>
      </header>

      <div className="planes grid-cols-1 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
        <div className="plane-navy p-5 flex flex-col justify-between gap-3">
          <span className="cell-label">Current hall occupancy</span>
          <p>
            <span className="display num text-5xl">{records.length}</span>
            <span className="num text-lg font-bold text-[rgba(255,255,255,0.7)]"> / {confirmedCount} confirmed</span>
          </p>
        </div>

        <form onSubmit={handleManualCheckIn} className="p-5 space-y-3">
          <label htmlFor="manual-code" className="field-label">
            Manual check-in (paid registrations only)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="manual-code"
              type="text"
              placeholder="Registration ID, e.g. P2P-2026-A8F92X"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              className="field font-mono uppercase flex-1"
            />
            <button type="submit" disabled={checking} aria-busy={checking} className="btn btn-primary">
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              <span>{checking ? "Checking…" : "Check In"}</span>
            </button>
          </div>
          {feedback && (
            <p
              role={feedback.tone === "alert" ? "alert" : "status"}
              className={`frame px-3 py-2 text-sm font-semibold ${
                feedback.tone === "ok" ? "bg-ok-soft text-ok" : feedback.tone === "warn" ? "bg-sun-soft text-ink" : "bg-alert-soft text-alert"
              }`}
            >
              {feedback.text}
            </p>
          )}
        </form>
      </div>

      <div className="frame bg-paper">
        <div className="p-4 rule-b">
          <label htmlFor="attendance-search" className="sr-only">
            Filter attendance logs
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="attendance-search"
              type="text"
              placeholder="Filter by student name, roll number, or reg ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field pl-9"
            />
          </div>
        </div>

        <section aria-labelledby="waiting-heading" className="rule-b">
          <h2 id="waiting-heading" className="px-4 pt-4 pb-2 text-sm font-semibold text-ink">
            Not yet checked in <span className="text-ink-3 font-normal">({waiting.length})</span>
          </h2>
          {waiting.length === 0 ? (
            <p className="px-4 pb-4 text-sm text-ink-3">{q ? "No paid student matches this search." : "Every paid student has been checked in."}</p>
          ) : (
            <ul className="divide-y divide-rule max-h-80 overflow-y-auto">
              {waiting.map(({ reg, profile }) => (
                <li key={reg.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{profile?.certificate_name ?? "—"}</p>
                    <p className="text-xs text-ink-3 font-mono truncate">
                      {reg.registration_number} · {profile?.roll_number ?? "—"} · {profile?.branch ?? ""} {profile?.year ?? ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setRowBusy(reg.id); void checkIn(reg.registration_number); }}
                    disabled={checking}
                    aria-busy={rowBusy === reg.id}
                    className="btn btn-sm shrink-0"
                  >
                    <UserPlus className="w-4 h-4" aria-hidden="true" />
                    {rowBusy === reg.id ? "Checking…" : "Check in"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <h2 className="px-4 pt-4 pb-2 text-sm font-semibold text-ink">
          Checked in <span className="text-ink-3 font-normal">({filtered.length})</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="table-planes">
            <thead>
              <tr>
                <th>Registration ID</th>
                <th>Participant Name</th>
                <th>Roll Number</th>
                <th>Branch</th>
                <th>Year &amp; Sec</th>
                <th>ISTE</th>
                <th>Check-in Time</th>
                <th>Verified By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="font-mono font-bold text-accent whitespace-nowrap">{item.registration_number}</td>
                  <td className="font-bold text-ink whitespace-nowrap">{item.participant_name}</td>
                  <td className="font-mono text-ink-2">{item.roll_number}</td>
                  <td className="text-ink-2">{item.branch}</td>
                  <td className="text-ink-2 whitespace-nowrap">
                    {item.year ? item.year.split(" ")[0] : "—"} - {item.section}
                  </td>
                  <td>
                    <span className={`tag ${item.iste_member ? "tag-info" : ""}`}>
                      {item.iste_member ? "ISTE" : "Regular"}
                    </span>
                  </td>
                  <td className="font-mono num font-bold text-ok whitespace-nowrap">{item.check_in_time}</td>
                  <td className="text-ink-2">{item.checked_in_by}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-ink-2 py-8">
                    {records.length === 0 ? "No one has checked in yet." : "No attendance records match this filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
