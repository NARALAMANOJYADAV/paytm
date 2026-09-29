"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Printer,
  Image as ImageIcon,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useStore, triggerDownload, reviewPayment, paymentProofUrl } from "@/lib/store";
import type { AttendanceRecord, ParticipantProfile, PaymentStatus, Registration, User } from "@/lib/types";

// ------------------------------------------------------------------ helpers

const fmtIST = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const payLabel = (s: PaymentStatus) =>
  s === "success" ? "Approved" : s === "failed" ? "Rejected" : s === "refunded" ? "Refunded" : "Pending";
const payTag = (s: PaymentStatus) => (s === "success" ? "tag-ok" : s === "failed" ? "tag-alert" : "tag-pending");

/** Neutralise spreadsheet formula injection without mangling phone numbers like +91 98…. */
const safeCell = (v: unknown) => {
  const s = String(v ?? "");
  return /^[=@\t\r]/.test(s) || /^[+-][^\d\s]/.test(s) ? `'${s}` : s;
};

const toCsv = (header: string[], rows: (string | number)[][]) =>
  "﻿" +
  [header, ...rows].map((r) => r.map((c) => `"${safeCell(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");

const escapeHtml = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

/** Excel-compatible .xls (HTML table). Every cell is text so UTRs / phone numbers keep all digits. */
const toXls = (title: string, header: string[], rows: (string | number)[][]) => `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${escapeHtml(title.slice(0, 31))}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>td,th{mso-number-format:"\\@";border:0.5pt solid #999;padding:2pt 4pt;font-family:Calibri,Arial,sans-serif;font-size:11pt;vertical-align:top}th{background:#eceae4;font-weight:bold}</style></head>
<body><table><thead><tr>${header.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows
  .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
  .join("")}</tbody></table></body></html>`;

type Row = {
  reg: Registration;
  profile?: ParticipantProfile;
  user?: User;
  att?: AttendanceRecord;
  team: string;
  name: string;
  verifiedBy: string;
};

type Format = "csv" | "xls";
type Dataset = "directory" | "attendance" | "ledger" | "certificates";

const DATASETS: { value: Dataset; label: string; hint: string }[] = [
  { value: "directory", label: "Participant directory", hint: "Every column, current filters" },
  { value: "attendance", label: "Attendance sheet", hint: "Confirmed only, with a blank signature column" },
  { value: "ledger", label: "Payments ledger", hint: "UTR, fee, status and verification" },
  { value: "certificates", label: "Certificate list", hint: "Issued certificates for the filtered participants" },
];

// ------------------------------------------------------------------ page

export default function AdminParticipantsPage() {
  const store = useStore();
  const cfg = store.eventConfig;

  // Filters
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState<"all" | "pending" | "success" | "failed">("all");
  const [checkinFilter, setCheckinFilter] = useState<"all" | "yes" | "no">("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [isteFilter, setIsteFilter] = useState<"all" | "yes" | "no">("all");

  // Export menu
  const [exportOpen, setExportOpen] = useState(false);
  const [format, setFormat] = useState<Format>("xls");
  const [exportError, setExportError] = useState("");

  // Drawer
  const [openId, setOpenId] = useState<string | null>(null);

  const rows: Row[] = useMemo(() => {
    const teamOf = new Map<string, string>();
    store.teams.forEach((t) => t.members.forEach((m) => teamOf.set(m.participant_id, t.name)));
    const attOf = new Map(store.attendance.map((a) => [a.registration_number.toUpperCase(), a]));
    return [...store.registrations]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((reg) => {
        const profile = store.profiles.find((p) => p.id === reg.participant_id);
        const user = store.users.find((u) => u.id === profile?.user_id);
        return {
          reg,
          profile,
          user,
          att: attOf.get(reg.registration_number.toUpperCase()),
          team: teamOf.get(reg.participant_id) ?? "",
          name: profile?.certificate_name || user?.name || "—",
          // Not exposed by /api/state yet; renders automatically once the server adds it.
          verifiedBy: (reg as Registration & { verified_by_name?: string }).verified_by_name ?? "",
        };
      });
  }, [store]);

  const branches = useMemo(() => Array.from(new Set(rows.map((r) => r.profile?.branch).filter(Boolean))).sort() as string[], [rows]);
  const years = useMemo(() => Array.from(new Set(rows.map((r) => r.profile?.year).filter(Boolean))).sort() as string[], [rows]);

  const filtered = rows.filter((r) => {
    if (payFilter !== "all" && r.reg.payment_status !== payFilter) return false;
    if (checkinFilter === "yes" && !r.att) return false;
    if (checkinFilter === "no" && r.att) return false;
    if (branchFilter !== "all" && r.profile?.branch !== branchFilter) return false;
    if (yearFilter !== "all" && r.profile?.year !== yearFilter) return false;
    if (isteFilter === "yes" && !r.profile?.iste_member) return false;
    if (isteFilter === "no" && r.profile?.iste_member) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [
      r.name,
      r.profile?.roll_number,
      r.user?.email,
      r.profile?.mobile,
      r.reg.registration_number,
      r.reg.utr_number,
      r.team,
      r.profile?.iste_sm_number,
    ].some((v) => (v ?? "").toLowerCase().includes(q));
  });

  const filtersActive =
    !!search.trim() || payFilter !== "all" || checkinFilter !== "all" || branchFilter !== "all" || yearFilter !== "all" || isteFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setPayFilter("all");
    setCheckinFilter("all");
    setBranchFilter("all");
    setYearFilter("all");
    setIsteFilter("all");
  };

  const counts = {
    pending: rows.filter((r) => r.reg.payment_status === "pending").length,
    approved: rows.filter((r) => r.reg.payment_status === "success").length,
    checkedIn: rows.filter((r) => r.att).length,
  };

  // ---------------------------------------------------------------- exports
  const attendanceRows = () =>
    filtered
      .filter((r) => r.reg.payment_status === "success" && r.reg.registration_status === "confirmed")
      .sort((a, b) => (a.profile?.roll_number ?? "").localeCompare(b.profile?.roll_number ?? ""));

  const buildDataset = (ds: Dataset): { title: string; header: string[]; rows: (string | number)[][] } => {
    if (ds === "attendance") {
      return {
        title: "Attendance sheet",
        header: ["S.No", "Name", "Roll Number", "Branch", "Year", "Section", "Signature"],
        rows: attendanceRows().map((r, i) => [
          i + 1,
          r.name,
          r.profile?.roll_number ?? "",
          r.profile?.branch ?? "",
          r.profile?.year ?? "",
          r.profile?.section ?? "",
          "",
        ]),
      };
    }
    if (ds === "ledger") {
      return {
        title: "Payments ledger",
        header: ["Registration Number", "Name", "UTR", "Fee (INR)", "Status", "Submitted At", "Verified At", "Verified By", "Rejection Reason"],
        rows: filtered.map((r) => [
          r.reg.registration_number,
          r.name,
          r.reg.utr_number ?? "",
          r.reg.fee,
          payLabel(r.reg.payment_status),
          fmtIST(r.reg.created_at),
          fmtIST(r.reg.verified_at),
          r.verifiedBy,
          r.reg.rejection_reason ?? "",
        ]),
      };
    }
    if (ds === "certificates") {
      const ids = new Set(filtered.map((r) => r.reg.id));
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return {
        title: "Certificate list",
        header: ["Certificate ID", "Registration Number", "Name", "Roll Number", "Branch", "Type", "Rank", "Issued", "Status", "Verification URL"],
        rows: store.certificates
          .filter((c) => ids.has(c.registration_id))
          .map((c) => [
            c.certificate_id,
            rows.find((r) => r.reg.id === c.registration_id)?.reg.registration_number ?? "",
            c.participant_name,
            c.roll_number,
            c.branch,
            c.type,
            c.rank ?? "",
            fmtIST(c.issue_date),
            c.status,
            `${origin}${c.verification_url}`,
          ]),
      };
    }
    return {
      title: "Participants",
      header: [
        "Registration Number", "Name", "Roll Number", "Email", "Mobile", "Year", "Branch", "Section", "ISTE Member", "ISTE SM Number",
        "Has Laptop", "Fee (INR)", "UTR", "Payment Status", "Registration Status", "Submitted At", "Verified At", "Rejection Reason",
        "Checked In", "Check-in Time", "Checked In By", "Team",
      ],
      rows: filtered.map((r) => [
        r.reg.registration_number,
        r.name,
        r.profile?.roll_number ?? "",
        r.user?.email ?? "",
        r.profile?.mobile ?? "",
        r.profile?.year ?? "",
        r.profile?.branch ?? "",
        r.profile?.section ?? "",
        r.profile?.iste_member ? "Yes" : "No",
        r.profile?.iste_sm_number ?? "",
        r.profile?.has_laptop ? "Yes" : "No",
        r.reg.fee,
        r.reg.utr_number ?? "",
        payLabel(r.reg.payment_status),
        r.reg.registration_status,
        fmtIST(r.reg.created_at),
        fmtIST(r.reg.verified_at),
        r.reg.rejection_reason ?? "",
        r.att ? "Yes" : "No",
        r.att ? r.att.check_in_time : "",
        r.att?.checked_in_by ?? "",
        r.team,
      ]),
    };
  };

  const runExport = (ds: Dataset) => {
    setExportError("");
    const data = buildDataset(ds);
    if (data.rows.length === 0) {
      setExportError(`Nothing to export for "${data.title}" with the current filters.`);
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    const base = `nbkrist-p2p-${data.title.toLowerCase().replace(/\s+/g, "-")}-${stamp}`;
    if (format === "csv") {
      triggerDownload(toCsv(data.header, data.rows), `${base}.csv`);
    } else {
      triggerDownload(toXls(data.title, data.header, data.rows), `${base}.xls`, "application/vnd.ms-excel;charset=utf-8");
    }
    setExportOpen(false);
  };

  const printAttendance = () => {
    setExportError("");
    const list = attendanceRows();
    if (list.length === 0) {
      setExportError("No confirmed participants match the current filters, so there is nothing to print.");
      return;
    }
    const w = window.open("", "_blank");
    if (!w) {
      setExportError("The print window was blocked. Allow pop-ups for this site and try again.");
      return;
    }
    const filterNote = filtersActive ? "Filtered list" : "All confirmed participants";
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Attendance sheet – ${escapeHtml(cfg.name)}</title>
<style>
  @page { size: A4 portrait; margin: 14mm 12mm; }
  body { font-family: system-ui, -apple-system, "Segoe UI", Arial, sans-serif; color: #111; margin: 0; }
  h1 { font-size: 16pt; margin: 0 0 2pt; }
  p.meta { font-size: 10pt; margin: 0 0 10pt; color: #333; }
  table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  th, td { border: 1px solid #555; padding: 5pt 6pt; text-align: left; }
  th { background: #eee; }
  td.sno { width: 28pt; text-align: right; }
  td.sig { width: 120pt; }
  tr { page-break-inside: avoid; height: 22pt; }
  thead { display: table-header-group; }
  .foot { margin-top: 18pt; font-size: 10pt; display: flex; justify-content: space-between; }
</style></head><body>
<h1>${escapeHtml(cfg.name)} – Attendance sheet</h1>
<p class="meta">${escapeHtml(cfg.date_formatted)} • ${escapeHtml(cfg.venue)} • ${escapeHtml(filterNote)} • ${list.length} participants</p>
<table><thead><tr><th>S.No</th><th>Name</th><th>Roll Number</th><th>Branch</th><th>Year</th><th>Section</th><th>Signature</th></tr></thead><tbody>
${list
  .map(
    (r, i) =>
      `<tr><td class="sno">${i + 1}</td><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.profile?.roll_number)}</td><td>${escapeHtml(
        r.profile?.branch,
      )}</td><td>${escapeHtml(r.profile?.year)}</td><td>${escapeHtml(r.profile?.section)}</td><td class="sig"></td></tr>`,
  )
  .join("")}
</tbody></table>
<div class="foot"><span>Coordinator signature: ____________________</span><span>Printed ${escapeHtml(fmtIST(new Date().toISOString()))}</span></div>
<script>window.onload = function () { window.focus(); window.print(); };</script>
</body></html>`);
    w.document.close();
  };

  const openRow = rows.find((r) => r.reg.id === openId) ?? null;
  const closeDrawer = useCallback(() => setOpenId(null), []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="frame bg-paper p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title text-ink">Master Participant Directory</h1>
          <p className="mt-2 text-sm text-ink-2">
            <span className="num font-bold text-ink">{rows.length}</span> registrations •{" "}
            <span className="num font-bold text-ink">{counts.approved}</span> approved •{" "}
            <span className="num font-bold text-ink">{counts.pending}</span> pending •{" "}
            <span className="num font-bold text-ink">{counts.checkedIn}</span> checked in. Select a row for full details and payment review.
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-2 self-start lg:self-auto">
          <button type="button" onClick={printAttendance} className="btn min-h-11">
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Print attendance sheet</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((o) => !o)}
              aria-expanded={exportOpen}
              aria-controls="export-menu"
              className="btn btn-primary min-h-11"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Export</span>
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </button>
            {exportOpen && (
              <div
                id="export-menu"
                className="absolute right-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] frame bg-paper shadow-lg"
                onKeyDown={(e) => e.key === "Escape" && setExportOpen(false)}
              >
                <div className="p-4 rule-b">
                  <span className="field-label" id="export-format-label">Format</span>
                  <div role="radiogroup" aria-labelledby="export-format-label" className="flex gap-1">
                    {(["xls", "csv"] as Format[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        role="radio"
                        aria-checked={format === f}
                        onClick={() => setFormat(f)}
                        className={`btn btn-sm min-h-11 flex-1 ${format === f ? "btn-ink" : ""}`}
                      >
                        {f === "xls" ? "Excel (.xls)" : "CSV (UTF-8)"}
                      </button>
                    ))}
                  </div>
                </div>
                <ul>
                  {DATASETS.map((d) => (
                    <li key={d.value}>
                      <button
                        type="button"
                        onClick={() => runExport(d.value)}
                        className="w-full text-left px-4 py-3 min-h-11 hover:bg-paper-2 rule-b"
                      >
                        <span className="block text-sm font-bold text-ink">{d.label}</span>
                        <span className="block text-xs text-ink-2">{d.hint}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="px-4 py-3 text-xs text-ink-3">
                  Exports use the filters below ({filtered.length} of {rows.length} rows).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {exportError && (
        <div role="alert" className="frame bg-alert-soft p-4 text-sm text-alert font-semibold">{exportError}</div>
      )}

      {/* Filters */}
      <div className="frame bg-paper p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 min-w-0">
            <label htmlFor="participant-search" className="field-label">Search participants</label>
            <div className="relative">
              <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                id="participant-search"
                type="search"
                placeholder="Name, roll number, email, mobile, registration ID, UTR, team…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="field pl-9"
              />
            </div>
          </div>
          <p className="text-sm text-ink-2 sm:pb-3" aria-live="polite">
            Showing <span className="num font-bold text-ink">{filtered.length}</span> of <span className="num">{rows.length}</span>
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          <div>
            <label htmlFor="f-pay" className="field-label">Payment</label>
            <select id="f-pay" value={payFilter} onChange={(e) => setPayFilter(e.target.value as typeof payFilter)} className="field">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="success">Approved</option>
              <option value="failed">Rejected</option>
            </select>
          </div>
          <div>
            <label htmlFor="f-checkin" className="field-label">Checked in</label>
            <select id="f-checkin" value={checkinFilter} onChange={(e) => setCheckinFilter(e.target.value as typeof checkinFilter)} className="field">
              <option value="all">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label htmlFor="f-branch" className="field-label">Branch</label>
            <select id="f-branch" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="field">
              <option value="all">All</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-year" className="field-label">Year</label>
            <select id="f-year" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="field">
              <option value="all">All</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-iste" className="field-label">ISTE</label>
            <select id="f-iste" value={isteFilter} onChange={(e) => setIsteFilter(e.target.value as typeof isteFilter)} className="field">
              <option value="all">All</option>
              <option value="yes">Members</option>
              <option value="no">Non-members</option>
            </select>
          </div>
          <button type="button" onClick={clearFilters} disabled={!filtersActive} className="btn min-h-11">
            Clear filters
          </button>
        </div>
      </div>

      {/* Directory table */}
      <div className="frame bg-paper overflow-x-auto">
        <table className="table-planes">
          <caption className="sr-only">Participants. Select a registration number to open the full record.</caption>
          <thead>
            <tr>
              <th scope="col">Reg ID</th>
              <th scope="col">Name</th>
              <th scope="col">Roll</th>
              <th scope="col">Email</th>
              <th scope="col">Mobile</th>
              <th scope="col">Year / Branch / Sec</th>
              <th scope="col">ISTE</th>
              <th scope="col">Fee</th>
              <th scope="col">UTR</th>
              <th scope="col">Payment</th>
              <th scope="col">Registration</th>
              <th scope="col">Submitted</th>
              <th scope="col">Verified</th>
              <th scope="col">Check-in</th>
              <th scope="col">Team</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={15} className="text-ink-2">
                  {rows.length === 0 ? "No registrations yet." : "No participants match these filters."}
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.reg.id} onClick={() => setOpenId(r.reg.id)} className="cursor-pointer">
                  <td className="whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenId(r.reg.id);
                      }}
                      className="font-mono text-xs font-bold text-ink underline underline-offset-4 decoration-sky decoration-2 min-h-11"
                    >
                      {r.reg.registration_number}
                    </button>
                  </td>
                  <td className="font-bold text-ink whitespace-nowrap">{r.name}</td>
                  <td className="font-mono text-xs text-ink-2 whitespace-nowrap">{r.profile?.roll_number}</td>
                  <td className="text-ink-2 text-xs whitespace-nowrap">{r.user?.email}</td>
                  <td className="font-mono text-xs text-ink-2 whitespace-nowrap">{r.profile?.mobile}</td>
                  <td className="text-ink-2 whitespace-nowrap text-xs">
                    {r.profile ? `${r.profile.year} • ${r.profile.branch} • ${r.profile.section}` : "—"}
                  </td>
                  <td className="whitespace-nowrap">
                    <span className={`tag ${r.profile?.iste_member ? "tag-info" : ""}`}>
                      {r.profile?.iste_member ? "ISTE" : "Regular"}
                    </span>
                    {r.profile?.iste_member && r.profile.iste_sm_number && (
                      <span className="block font-mono text-[11px] text-ink-3 mt-1">{r.profile.iste_sm_number}</span>
                    )}
                  </td>
                  <td className="num font-bold text-ink whitespace-nowrap">₹{r.reg.fee}</td>
                  <td className="font-mono text-xs text-ink whitespace-nowrap">{r.reg.utr_number || "—"}</td>
                  <td>
                    <span className={`tag ${payTag(r.reg.payment_status)}`}>{payLabel(r.reg.payment_status)}</span>
                  </td>
                  <td className="text-xs text-ink-2 whitespace-nowrap">{r.reg.registration_status}</td>
                  <td className="font-mono text-xs text-ink-2 whitespace-nowrap">{fmtIST(r.reg.created_at)}</td>
                  <td className="font-mono text-xs text-ink-2 whitespace-nowrap">{fmtIST(r.reg.verified_at) || "—"}</td>
                  <td className="whitespace-nowrap">
                    {r.att ? (
                      <span className="tag tag-ok">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{r.att.check_in_time}</span>
                      </span>
                    ) : (
                      <span className="tag">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Not yet</span>
                      </span>
                    )}
                  </td>
                  <td className="text-ink-2 text-xs whitespace-nowrap">{r.team || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {openRow && <ParticipantDrawer key={openRow.reg.id} row={openRow} onClose={closeDrawer} />}
    </div>
  );
}

// ------------------------------------------------------------------ drawer

function ParticipantDrawer({ row, onClose }: { row: Row; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState<"approve" | "reject" | "proof" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [proof, setProof] = useState<{ url: string; isPdf: boolean } | null>(null);

  const { reg, profile, user, att } = row;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleProof = async () => {
    setBusy("proof");
    setNotice(null);
    try {
      const { url } = await paymentProofUrl(reg.id);
      setProof({ url, isPdf: (reg.payment_proof_path ?? "").toLowerCase().endsWith(".pdf") });
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : "Could not load the screenshot." });
    } finally {
      setBusy(null);
    }
  };

  const decide = async (decision: "approve" | "reject") => {
    if (decision === "reject" && !reason.trim()) {
      setNotice({ ok: false, text: "Enter a rejection reason. The participant will see it." });
      return;
    }
    setBusy(decision);
    setNotice(null);
    try {
      const res = await reviewPayment(reg.id, decision, decision === "reject" ? reason.trim() : undefined);
      setRejecting(false);
      setReason("");
      setNotice({
        ok: true,
        text:
          decision === "approve"
            ? `Payment approved. Ticket ${res.ticketNumber ?? reg.registration_number} issued.`
            : "Payment rejected. The participant can resubmit.",
      });
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : "Could not record the decision." });
    } finally {
      setBusy(null);
    }
  };

  const fields: [string, React.ReactNode][] = [
    ["Registration number", <span key="rn" className="font-mono font-bold">{reg.registration_number}</span>],
    ["Registration status", reg.registration_status],
    ["Name on certificate", profile?.certificate_name || "—"],
    ["Account name", user?.name || "—"],
    ["Roll number", <span key="roll" className="font-mono">{profile?.roll_number || "—"}</span>],
    ["Email", user?.email || "—"],
    ["Mobile", profile?.mobile || "—"],
    ["Year", profile?.year || "—"],
    ["Branch", profile?.branch || "—"],
    ["Section", profile?.section || "—"],
    ["ISTE member", profile?.iste_member ? `Yes • ${profile.iste_sm_number || "no SM number"}` : "No"],
    ["Has laptop", profile?.has_laptop ? "Yes" : "No"],
    ["LinkedIn / portfolio", profile?.linkedin_portfolio ? (
      <a key="li" href={profile.linkedin_portfolio} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 break-all">
        {profile.linkedin_portfolio}
      </a>
    ) : "—"],
    ["Team", row.team || "—"],
    ["Fee", <span key="fee" className="num font-bold">₹{reg.fee} ({reg.registration_type === "iste" ? "ISTE" : "Non-ISTE"})</span>],
    ["UTR", <span key="utr" className="font-mono font-bold">{reg.utr_number || "—"}</span>],
    ["Submitted", fmtIST(reg.created_at) || "—"],
    ["Verified", fmtIST(reg.verified_at) || "—"],
    ...(row.verifiedBy ? ([["Verified by", row.verifiedBy]] as [string, React.ReactNode][]) : []),
    ["Check-in", att ? `${att.check_in_time} by ${att.checked_in_by}` : "Not checked in"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close details" onClick={onClose} className="absolute inset-0 bg-[rgba(17,17,19,0.4)] cursor-default" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="relative w-full max-w-xl h-full bg-paper border-l border-line overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-paper px-5 sm:px-6 py-4 rule-b flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`tag ${payTag(reg.payment_status)}`}>{payLabel(reg.payment_status)}</span>
              {att && <span className="tag tag-ok">Checked in</span>}
            </div>
            <h2 id="drawer-title" className="text-xl font-semibold wide text-ink mt-2 leading-tight">{row.name}</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="btn btn-sm min-h-11" aria-label="Close">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <dl className="p-5 sm:p-6 rule-b grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {fields.map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="cell-label">{k}</dt>
              <dd className="text-ink break-words">{v}</dd>
            </div>
          ))}
          {reg.rejection_reason && (
            <div className="sm:col-span-2">
              <dt className="cell-label">Rejection reason</dt>
              <dd className="text-alert font-semibold">{reg.rejection_reason}</dd>
            </div>
          )}
        </dl>

        <div className="p-5 sm:p-6 rule-b space-y-3">
          <button
            type="button"
            onClick={handleProof}
            disabled={busy === "proof" || !reg.payment_proof_path}
            aria-busy={busy === "proof"}
            className="btn btn-sm min-h-11"
          >
            <ImageIcon className="w-4 h-4" aria-hidden="true" />
            <span>
              {!reg.payment_proof_path ? "No screenshot uploaded" : busy === "proof" ? "Loading…" : "View payment screenshot"}
            </span>
          </button>
          {proof && (
            <div className="space-y-2">
              {proof.isPdf ? (
                <p className="text-sm text-ink-2">The proof is a PDF.</p>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={proof.url}
                  alt={`Payment screenshot for ${reg.registration_number}`}
                  className="frame max-h-[60vh] w-auto max-w-full object-contain bg-field-2"
                />
              )}
              <a
                href={proof.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 min-h-11 text-sm font-bold text-ink underline underline-offset-4 decoration-2 decoration-sky"
              >
                Open in new tab (link expires in 5 minutes)
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-3">
          {notice && (
            <p
              role={notice.ok ? "status" : "alert"}
              className={`frame px-3 py-2 text-sm font-semibold flex items-center gap-2 ${notice.ok ? "bg-ok-soft text-ok" : "bg-alert-soft text-alert"}`}
            >
              {notice.ok && <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
              <span>{notice.text}</span>
            </p>
          )}

          {reg.payment_status === "pending" ? (
            <>
              <p className="text-sm text-ink-2">
                Match the UTR and amount (<span className="num font-bold text-ink">₹{reg.fee}</span>) against the bank statement
                before approving. Approving issues the ticket and QR.
              </p>
              {rejecting && (
                <div>
                  <label htmlFor="drawer-reason" className="field-label">Rejection reason (shown to the participant) *</label>
                  <textarea
                    id="drawer-reason"
                    rows={2}
                    maxLength={300}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="field"
                    placeholder="e.g. UTR not found in the bank statement"
                  />
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                {!rejecting ? (
                  <>
                    <button type="button" onClick={() => decide("approve")} disabled={busy !== null} aria-busy={busy === "approve"} className="btn btn-primary">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span>{busy === "approve" ? "Approving…" : "Approve payment"}</span>
                    </button>
                    <button type="button" onClick={() => setRejecting(true)} disabled={busy !== null} className="btn btn-danger">
                      <XCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Reject…</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => decide("reject")}
                      disabled={busy !== null || !reason.trim()}
                      aria-busy={busy === "reject"}
                      className="btn btn-danger"
                    >
                      <XCircle className="w-4 h-4" aria-hidden="true" />
                      <span>{busy === "reject" ? "Rejecting…" : "Confirm rejection"}</span>
                    </button>
                    <button type="button" onClick={() => setRejecting(false)} disabled={busy !== null} className="btn">
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-2">
              {reg.payment_status === "success"
                ? "Payment verified. The ticket and QR are issued."
                : "Payment rejected. The record returns to the queue when the participant resubmits."}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
