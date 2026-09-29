"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, Lock, CheckCircle2, ExternalLink, Download } from "lucide-react";
import { useStore, issueCertificates, revokeCertificate, triggerDownload } from "@/lib/store";
import { Certificate } from "@/lib/types";

const fmtIST = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};

const TYPE_LABEL: Record<Certificate["type"], string> = {
  participation: "Participation",
  winner: "Winner",
  runner_up: "Runner-up",
  merit: "Merit",
};

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export default function AdminCertificatesPage() {
  const store = useStore();
  const cfg = store.eventConfig;
  const [issuing, setIssuing] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<{ issued: number; skipped: { registration: string; reason: string }[] } | null>(null);

  // Clock for the lock state; ticks so the button unlocks without a reload once the event ends.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const endAt = cfg.event_end_at ? new Date(cfg.event_end_at) : null;
  const eventEnded = endAt ? now >= endAt.getTime() : true;

  const summary = useMemo(() => {
    const confirmed = store.registrations.filter((r) => r.payment_status === "success" && r.registration_status === "confirmed");
    const checkedInRegs = new Set(
      store.attendance.filter((a) => a.status === "checked_in").map((a) => a.registration_number.toUpperCase()),
    );
    const eligible = confirmed.filter((r) => checkedInRegs.has(r.registration_number.toUpperCase()));
    return {
      confirmed: confirmed.length,
      checkedIn: checkedInRegs.size,
      eligible: eligible.length,
      issued: store.certificates.filter((c) => c.status === "issued").length,
      revoked: store.certificates.filter((c) => c.status === "revoked").length,
    };
  }, [store]);

  const regNumberOf = (registrationId: string) =>
    store.registrations.find((r) => r.id === registrationId)?.registration_number ?? "";

  const handleIssue = async () => {
    setIssuing(true);
    setError("");
    setNotice("");
    try {
      const r = await issueCertificates();
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not issue certificates.");
    } finally {
      setIssuing(false);
    }
  };

  const handleRevoke = async (c: Certificate) => {
    if (!confirm(`Revoke ${c.certificate_id} (${c.participant_name})? Public verification will show it as revoked.`)) return;
    setRevoking(c.certificate_id);
    setError("");
    setNotice("");
    try {
      await revokeCertificate(c.certificate_id);
      setNotice(`${c.certificate_id} revoked.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not revoke the certificate.");
    } finally {
      setRevoking(null);
    }
  };

  const handleExport = () => {
    const header = ["Certificate ID", "Registration Number", "Name", "Roll Number", "Branch", "Type", "Rank", "Issued", "Status", "Verification URL"];
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const rows = store.certificates.map((c) =>
      [
        c.certificate_id,
        regNumberOf(c.registration_id),
        c.participant_name,
        c.roll_number,
        c.branch,
        TYPE_LABEL[c.type] ?? c.type,
        c.rank ?? "",
        fmtIST(c.issue_date),
        c.status,
        `${origin}${c.verification_url}`,
      ].map(csvCell).join(","),
    );
    triggerDownload("﻿" + [header.map(csvCell).join(","), ...rows].join("\r\n"), `nbkrist-p2p-certificates-${Date.now()}.csv`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="frame bg-paper p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title text-ink">Certificates</h1>
          <p className="mt-2 text-sm text-ink-2">
            Participation certificates go to everyone whose payment is verified and who checked in. Merit certificates go to the
            teams ranked 1st and 2nd. Issuing again only adds missing certificates.
          </p>
        </div>
        <button
          type="button"
          onClick={handleIssue}
          disabled={issuing || !eventEnded}
          aria-busy={issuing}
          aria-describedby={!eventEnded ? "cert-lock" : undefined}
          className="btn btn-primary self-start sm:self-auto"
        >
          {eventEnded ? <Award className="w-4 h-4" aria-hidden="true" /> : <Lock className="w-4 h-4" aria-hidden="true" />}
          <span>{issuing ? "Issuing…" : "Issue certificates"}</span>
        </button>
      </header>

      {/* Eligibility summary */}
      <section aria-label="Eligibility" className="planes grid-cols-2 lg:grid-cols-5">
        <div className={`${eventEnded ? "plane-ok" : "plane-navy"} col-span-2 lg:col-span-1 p-5 flex flex-col justify-between gap-3`}>
          <span className="cell-label">Event status</span>
          <div>
            <span className="block text-xl font-semibold wide leading-tight">{eventEnded ? "Ended" : "Not ended yet"}</span>
            <span className="mt-2 block text-xs opacity-80">
              {endAt ? `Ends ${fmtIST(cfg.event_end_at)} IST` : "No end time set"}
            </span>
          </div>
        </div>
        <div className="p-5 flex flex-col justify-between gap-3">
          <span className="cell-label">Confirmed</span>
          <span className="num block text-2xl sm:text-3xl font-semibold wide leading-none text-ink">{summary.confirmed}</span>
        </div>
        <div className="p-5 flex flex-col justify-between gap-3">
          <span className="cell-label">Checked in</span>
          <span className="num block text-2xl sm:text-3xl font-semibold wide leading-none text-ink">{summary.checkedIn}</span>
        </div>
        <div className="p-5 flex flex-col justify-between gap-3">
          <span className="cell-label">Eligible</span>
          <span className="num block text-2xl sm:text-3xl font-semibold wide leading-none text-ink">{summary.eligible}</span>
        </div>
        <div className="p-5 flex flex-col justify-between gap-3">
          <span className="cell-label">Issued</span>
          <div>
            <span className="num block text-2xl sm:text-3xl font-semibold wide leading-none text-ink">{summary.issued}</span>
            {summary.revoked > 0 && <span className="mt-2 block text-xs text-ink-2">{summary.revoked} revoked</span>}
          </div>
        </div>
      </section>

      {!eventEnded && (
        <div id="cert-lock" role="status" className="frame bg-sun-soft p-4 text-sm text-ink flex items-center gap-2">
          <Lock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>
            Issuing is locked until the event ends at <strong>{fmtIST(cfg.event_end_at)} IST</strong>. Change the end time under{" "}
            <Link href="/admin/event" className="underline underline-offset-4 font-bold">Event Management</Link>.
          </span>
        </div>
      )}

      {error && (
        <div role="alert" className="frame bg-alert-soft p-4 text-sm text-alert font-semibold">{error}</div>
      )}
      {notice && (
        <div role="status" className="frame bg-ok-soft p-4 text-sm text-ink flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-ok flex-shrink-0" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      )}

      {result && (
        <section className="space-y-3" aria-labelledby="issue-result">
          <div role="status" className="frame bg-ok-soft p-4 text-sm text-ink flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-ok flex-shrink-0" aria-hidden="true" />
            <span id="issue-result">
              Issued <strong className="num">{result.issued}</strong> new certificate{result.issued === 1 ? "" : "s"}.
              {" "}
              <span className="num">{result.skipped.length}</span> registration{result.skipped.length === 1 ? "" : "s"} skipped.
            </span>
          </div>
          {result.skipped.length > 0 && (
            <div className="frame bg-paper overflow-x-auto">
              <table className="table-planes">
                <caption className="sr-only">Registrations skipped and why</caption>
                <thead>
                  <tr>
                    <th scope="col">Registration</th>
                    <th scope="col">Name</th>
                    <th scope="col">Reason skipped</th>
                  </tr>
                </thead>
                <tbody>
                  {result.skipped.map((sk, i) => {
                    const reg = store.registrations.find((r) => r.registration_number === sk.registration);
                    const profile = reg ? store.profiles.find((p) => p.id === reg.participant_id) : undefined;
                    return (
                      <tr key={`${sk.registration}-${i}`}>
                        <td className="font-mono text-xs font-bold text-ink whitespace-nowrap">{sk.registration}</td>
                        <td className="text-ink whitespace-nowrap">{profile?.certificate_name ?? "—"}</td>
                        <td><span className="tag tag-pending">{sk.reason}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Issued list */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold wide text-ink">
            Issued certificates <span className="num text-ink-3">({store.certificates.length})</span>
          </h2>
          <button type="button" onClick={handleExport} disabled={store.certificates.length === 0} className="btn btn-sm min-h-11">
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Certificate list CSV</span>
          </button>
        </div>
        <div className="frame bg-paper overflow-x-auto">
          <table className="table-planes">
            <thead>
              <tr>
                <th scope="col">Certificate ID</th>
                <th scope="col">Name</th>
                <th scope="col">Type</th>
                <th scope="col">Issued</th>
                <th scope="col">Status</th>
                <th scope="col">Verify</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {store.certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-ink-2">No certificates issued yet.</td>
                </tr>
              ) : (
                store.certificates.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono text-xs font-bold text-ink whitespace-nowrap">{c.certificate_id}</td>
                    <td className="whitespace-nowrap">
                      <span className="block font-bold text-ink">{c.participant_name}</span>
                      <span className="block font-mono text-xs text-ink-2">{c.roll_number}</span>
                    </td>
                    <td className="whitespace-nowrap">
                      <span className={`tag ${c.type === "participation" ? "tag-info" : "tag-ok"}`}>
                        {TYPE_LABEL[c.type] ?? c.type}
                        {c.rank ? ` • ${c.rank}` : ""}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-ink-2 whitespace-nowrap">{fmtIST(c.issue_date)}</td>
                    <td>
                      <span className={`tag ${c.status === "issued" ? "tag-ok" : "tag-off"}`}>{c.status}</span>
                    </td>
                    <td>
                      <a
                        href={c.verification_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 min-h-11 text-sm font-bold text-ink underline underline-offset-4 decoration-2 decoration-sky hover:decoration-ink"
                      >
                        /verify
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </td>
                    <td>
                      {c.status === "issued" && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(c)}
                          disabled={revoking === c.certificate_id}
                          aria-busy={revoking === c.certificate_id}
                          className="btn btn-sm btn-danger min-h-11"
                        >
                          {revoking === c.certificate_id ? "Revoking…" : "Revoke"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
