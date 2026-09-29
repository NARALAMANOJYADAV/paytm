"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SearchCheck,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";
import { paymentProofUrl, refreshStore, reviewPayment, useStore } from "@/lib/store";
import type { PaymentStatus } from "@/lib/types";

type Filter = "pending" | "success" | "failed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "success", label: "Approved" },
  { value: "failed", label: "Rejected" },
];

const REJECT_REASONS = [
  "UTR not found in bank statement",
  "Amount mismatch",
  "Screenshot unreadable",
  "Screenshot does not match the UTR",
  "Duplicate or reused payment",
];
const CUSTOM_REASON = "__custom__";

const fmtTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "—";

type Flash = { kind: "ok" | "error"; text: string } | null;

export default function PaymentVerificationPage() {
  const store = useStore();
  const [filter, setFilter] = useState<Filter>("pending");
  const [query, setQuery] = useState("");
  const [flash, setFlash] = useState<Flash>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reasonChoice, setReasonChoice] = useState(REJECT_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [proofBusyId, setProofBusyId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; title: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const rows = useMemo(() => {
    return store.registrations.map((reg) => {
      const profile = store.profiles.find((p) => p.id === reg.participant_id);
      const user = profile ? store.users.find((u) => u.id === profile.user_id) : undefined;
      // Admins also receive payment rows: the newest pending one marks a resubmission time.
      const latestPending = store.payments
        .filter((p) => p.registration_id === reg.id && p.status === "pending")
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
      return {
        reg,
        name: profile?.certificate_name || user?.name || "Participant",
        rollNumber: profile?.roll_number || "—",
        branch: profile?.branch || "—",
        year: profile?.year || "—",
        section: profile?.section,
        isteMember: profile?.iste_member ?? false,
        submittedAt: latestPending?.created_at || reg.created_at,
      };
    });
  }, [store]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { pending: 0, success: 0, failed: 0 };
    for (const r of rows) if (r.reg.payment_status in c) c[r.reg.payment_status as Filter] += 1;
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => r.reg.payment_status === (filter as PaymentStatus))
      .filter(
        (r) =>
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.rollNumber.toLowerCase().includes(q) ||
          r.reg.registration_number.toLowerCase().includes(q) ||
          (r.reg.utr_number || "").toLowerCase().includes(q)
      )
      .sort((a, b) =>
        filter === "pending"
          ? a.submittedAt.localeCompare(b.submittedAt) // oldest first: first come, first verified
          : (b.reg.verified_at || b.submittedAt).localeCompare(a.reg.verified_at || a.submittedAt)
      );
  }, [rows, filter, query]);

  const copyUtr = async (id: string, utr: string) => {
    try {
      await navigator.clipboard.writeText(utr);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
    } catch {
      setFlash({ kind: "error", text: "Could not copy to the clipboard. Select the UTR and copy it manually." });
    }
  };

  const viewProof = async (id: string, regNo: string, proofPath?: string) => {
    setProofBusyId(id);
    try {
      const { url } = await paymentProofUrl(id);
      if (proofPath?.toLowerCase().endsWith(".pdf")) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setLightbox({ url, title: `Payment screenshot · ${regNo}` });
      }
    } catch (err) {
      setFlash({ kind: "error", text: err instanceof Error ? err.message : "Could not load the screenshot." });
    } finally {
      setProofBusyId(null);
    }
  };

  const approve = async (id: string, regNo: string, name: string) => {
    setBusyId(id);
    setFlash(null);
    try {
      const res = await reviewPayment(id, "approve");
      setFlash({
        kind: "ok",
        text: `Approved ${name} (${regNo}). Ticket ${res.ticketNumber || regNo} issued.`,
      });
      if (rejectingId === id) setRejectingId(null);
    } catch (err) {
      setFlash({ kind: "error", text: err instanceof Error ? err.message : "Approval failed." });
    } finally {
      setBusyId(null);
    }
  };

  const openReject = (id: string) => {
    setRejectingId(id);
    setReasonChoice(REJECT_REASONS[0]);
    setCustomReason("");
  };

  const reject = async (e: React.FormEvent, id: string, regNo: string, name: string) => {
    e.preventDefault();
    const reason = (reasonChoice === CUSTOM_REASON ? customReason : reasonChoice).trim();
    if (!reason) return;
    setBusyId(id);
    setFlash(null);
    try {
      await reviewPayment(id, "reject", reason);
      setFlash({ kind: "ok", text: `Rejected ${name} (${regNo}): ${reason}. The participant can resubmit.` });
      setRejectingId(null);
    } catch (err) {
      setFlash({ kind: "error", text: err instanceof Error ? err.message : "Rejection failed." });
    } finally {
      setBusyId(null);
    }
  };

  const manualRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshStore();
    } catch (err) {
      setFlash({ kind: "error", text: err instanceof Error ? err.message : "Could not refresh the queue." });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header plane */}
      <header className="frame bg-paper p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="page-title">Payment Verification</h1>
          <p className="text-sm text-ink-2">
            Match each UTR and screenshot against the bank statement, then approve to issue the ticket.
          </p>
        </div>
        <button onClick={manualRefresh} disabled={refreshing} aria-busy={refreshing} className="btn self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {/* Filters + search */}
      <div className="frame bg-paper p-5 space-y-4">
        <div role="group" aria-label="Payment status" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`btn btn-sm ${filter === f.value ? "btn-ink" : ""}`}
            >
              {f.label} <span className="num">({counts[f.value]})</span>
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="verify-search" className="field-label">
            Search
          </label>
          <div className="relative">
            <Search
              className="w-5 h-5 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="verify-search"
              type="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="Name, roll number, registration ID or UTR"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="field pl-11 text-base min-h-[52px]"
            />
          </div>
        </div>
      </div>

      <div aria-live="polite">
        {flash && (
          <div
            className={`frame bg-paper p-4 flex items-start justify-between gap-3 ${
              flash.kind === "ok" ? "border-ok" : "border-alert"
            }`}
            role={flash.kind === "error" ? "alert" : "status"}
          >
            <p className={`text-sm flex items-start gap-2 ${flash.kind === "ok" ? "text-ok" : "text-alert"}`}>
              {flash.kind === "ok" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <span>{flash.text}</span>
            </p>
            <button onClick={() => setFlash(null)} className="btn btn-sm btn-quiet" aria-label="Dismiss message">
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Queue */}
      <p className="text-sm text-ink-2 num" aria-live="polite">
        Showing {visible.length} {FILTERS.find((f) => f.value === filter)?.label.toLowerCase()} payment
        {visible.length === 1 ? "" : "s"}
        {filter === "pending" ? " · oldest first" : ""}
      </p>

      {visible.length === 0 ? (
        <div className="frame bg-paper p-8 flex items-center gap-4">
          <SearchCheck className="w-10 h-10 text-ink-3 shrink-0" aria-hidden="true" />
          <p className="text-sm text-ink-2">
            {query
              ? "No payments match this search."
              : filter === "pending"
              ? "The queue is clear. No payments are waiting for verification."
              : "Nothing here yet."}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map((row) => {
            const { reg } = row;
            const rowBusy = busyId === reg.id;
            const isRejecting = rejectingId === reg.id;
            const customMissing = reasonChoice === CUSTOM_REASON && !customReason.trim();
            return (
              <li key={reg.id} className="frame bg-paper">
                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Who */}
                  <div className="md:col-span-5 space-y-1 min-w-0">
                    <p className="text-lg font-semibold wide break-words">{row.name}</p>
                    <p className="font-mono text-xs text-ink-2">{reg.registration_number}</p>
                    <p className="text-sm text-ink-2">
                      <span className="font-mono">{row.rollNumber}</span> · {row.branch} · {row.year}
                      {row.section ? ` (Sec ${row.section})` : ""}
                    </p>
                  </div>

                  {/* Payment facts */}
                  <dl className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <dt className="cell-label">Fee</dt>
                      <dd className="font-bold num">
                        ₹{reg.fee}{" "}
                        <span className="text-xs text-ink-2 font-normal">{row.isteMember ? "ISTE" : "Non-ISTE"}</span>
                      </dd>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <dt className="cell-label">UTR</dt>
                      <dd className="flex items-center gap-1">
                        <span className="font-mono font-bold break-all">{reg.utr_number || "—"}</span>
                        {reg.utr_number && (
                          <button
                            type="button"
                            onClick={() => copyUtr(reg.id, reg.utr_number!)}
                            className="btn btn-sm btn-quiet shrink-0"
                            aria-label={`Copy UTR ${reg.utr_number}`}
                          >
                            {copiedId === reg.id ? (
                              <Check className="w-4 h-4 text-ok" aria-hidden="true" />
                            ) : (
                              <Copy className="w-4 h-4" aria-hidden="true" />
                            )}
                          </button>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="cell-label">Submitted</dt>
                      <dd className="font-mono">{fmtTime(row.submittedAt)}</dd>
                    </div>
                    {reg.payment_status !== "pending" && (
                      <div>
                        <dt className="cell-label">{reg.payment_status === "success" ? "Approved" : "Rejected"}</dt>
                        <dd className="font-mono">{fmtTime(reg.verified_at)}</dd>
                      </div>
                    )}
                    {reg.payment_status === "failed" && reg.rejection_reason && (
                      <div className="col-span-2">
                        <dt className="cell-label">Reason</dt>
                        <dd className="text-alert">{reg.rejection_reason}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Actions */}
                <div className="px-5 sm:px-6 py-4 rule-t flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => viewProof(reg.id, reg.registration_number, reg.payment_proof_path)}
                    disabled={!reg.payment_proof_path || proofBusyId === reg.id}
                    aria-busy={proofBusyId === reg.id}
                    className="btn btn-sm"
                  >
                    <ImageIcon className="w-4 h-4" aria-hidden="true" />
                    {!reg.payment_proof_path
                      ? "No screenshot"
                      : proofBusyId === reg.id
                      ? "Loading…"
                      : "View screenshot"}
                  </button>

                  {reg.payment_status === "pending" && (
                    <>
                      <span className="flex-1" aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => (isRejecting ? setRejectingId(null) : openReject(reg.id))}
                        disabled={rowBusy}
                        aria-expanded={isRejecting}
                        className="btn btn-sm btn-danger"
                      >
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                        {isRejecting ? "Cancel reject" : "Reject"}
                      </button>
                      <button
                        type="button"
                        onClick={() => approve(reg.id, reg.registration_number, row.name)}
                        disabled={rowBusy || isRejecting}
                        aria-busy={rowBusy && !isRejecting}
                        className="btn btn-sm btn-primary"
                      >
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        {rowBusy && !isRejecting ? "Approving…" : "Approve & issue ticket"}
                      </button>
                    </>
                  )}
                </div>

                {isRejecting && (
                  <form
                    onSubmit={(e) => reject(e, reg.id, reg.registration_number, row.name)}
                    className="px-5 sm:px-6 py-4 rule-t space-y-3 bg-paper-2"
                  >
                    <div>
                      <label htmlFor={`reason-${reg.id}`} className="field-label">
                        Rejection reason (shown to the participant)
                      </label>
                      <select
                        id={`reason-${reg.id}`}
                        value={reasonChoice}
                        onChange={(e) => setReasonChoice(e.target.value)}
                        className="field"
                      >
                        {REJECT_REASONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                        <option value={CUSTOM_REASON}>Other (type a reason)</option>
                      </select>
                    </div>
                    {reasonChoice === CUSTOM_REASON && (
                      <div>
                        <label htmlFor={`custom-${reg.id}`} className="field-label">
                          Custom reason
                        </label>
                        <input
                          id={`custom-${reg.id}`}
                          type="text"
                          required
                          maxLength={300}
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          className="field"
                          placeholder="e.g. Paid to the wrong UPI ID"
                          autoFocus
                        />
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={rowBusy || customMissing}
                        aria-busy={rowBusy}
                        className="btn btn-sm btn-danger"
                      >
                        {rowBusy ? "Rejecting…" : "Confirm rejection"}
                      </button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {lightbox && <ProofLightbox url={lightbox.url} title={lightbox.title} onClose={() => setLightbox(null)} />}
    </div>
  );
}

function ProofLightbox({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(17,17,19,0.8)] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="frame bg-paper w-full max-w-3xl max-h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 rule-b flex items-center justify-between gap-3">
          <p className="font-semibold truncate">{title}</p>
          <div className="flex items-center gap-2 shrink-0">
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              New tab
            </a>
            <button ref={closeRef} onClick={onClose} className="btn btn-sm" aria-label="Close screenshot">
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="overflow-auto p-4 flex items-center justify-center bg-field">
          {failed ? (
            <p className="text-sm text-alert p-6">
              The screenshot could not be displayed here. Open it in a new tab (the link expires in 5 minutes).
            </p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived storage URL
            <img src={url} alt={title} className="max-w-full h-auto" onError={() => setFailed(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
