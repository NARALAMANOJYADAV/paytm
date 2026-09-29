"use client";

import React, { useMemo, useState } from "react";
import { Download, Search, CheckCircle2, XCircle, Image as ImageIcon, ExternalLink } from "lucide-react";
import {
  useStore,
  generateCsvData,
  triggerDownload,
  reviewPayment,
  paymentProofUrl,
} from "@/lib/store";
import type { PaymentStatus } from "@/lib/types";

type Filter = "pending" | "failed" | "success" | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "pending", label: "To verify" },
  { value: "failed", label: "Rejected" },
  { value: "success", label: "Verified" },
  { value: "all", label: "All" },
];

const statusTag = (status: PaymentStatus) =>
  status === "success" ? "tag-ok" : status === "failed" ? "tag-alert" : "tag-pending";
const statusLabel = (status: PaymentStatus) =>
  status === "success" ? "Verified" : status === "failed" ? "Rejected" : status === "refunded" ? "Refunded" : "Under verification";

const fmtIST = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
};

export default function AdminPaymentsPage() {
  const store = useStore();
  const [filter, setFilter] = useState<Filter>("pending");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Review panel state
  const [busy, setBusy] = useState<"approve" | "reject" | "proof" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [proof, setProof] = useState<{ url: string; isPdf: boolean } | null>(null);

  const rows = useMemo(
    () =>
      [...store.registrations]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((reg) => {
          const profile = store.profiles.find((p) => p.id === reg.participant_id);
          const user = store.users.find((u) => u.id === profile?.user_id);
          return {
            reg,
            name: profile?.certificate_name || user?.name || "—",
            roll: profile?.roll_number ?? "",
            email: user?.email ?? "",
            mobile: profile?.mobile ?? "",
            branch: profile?.branch ?? "",
            year: profile?.year ?? "",
            section: profile?.section ?? "",
            iste: !!profile?.iste_member,
            isteNo: profile?.iste_sm_number ?? "",
          };
        }),
    [store],
  );

  const counts = useMemo(() => {
    const c = { pending: 0, failed: 0, success: 0, all: rows.length };
    rows.forEach((r) => {
      if (r.reg.payment_status === "pending") c.pending++;
      else if (r.reg.payment_status === "failed") c.failed++;
      else if (r.reg.payment_status === "success") c.success++;
    });
    return c;
  }, [rows]);

  const collected = rows
    .filter((r) => r.reg.payment_status === "success" && r.reg.registration_status === "confirmed")
    .reduce((acc, r) => acc + (r.reg.fee || 0), 0);

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.reg.payment_status !== filter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.name, r.roll, r.reg.registration_number, r.reg.utr_number ?? "", r.email, r.mobile]
      .some((v) => v.toLowerCase().includes(q));
  });

  const selected = rows.find((r) => r.reg.id === selectedId) ?? null;

  // Changing the selection always resets the review panel.
  const changeSelection = (id: string | null) => {
    setSelectedId(id);
    setRejecting(false);
    setReason("");
    setProof(null);
  };

  const select = (id: string) => {
    changeSelection(id);
    setNotice(null);
  };

  const handleProof = async () => {
    if (!selected) return;
    setBusy("proof");
    setNotice(null);
    try {
      const { url } = await paymentProofUrl(selected.reg.id);
      const path = (selected.reg.payment_proof_path ?? "").toLowerCase();
      setProof({ url, isPdf: path.endsWith(".pdf") });
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : "Could not load the screenshot." });
    } finally {
      setBusy(null);
    }
  };

  const handleDecision = async (decision: "approve" | "reject") => {
    if (!selected) return;
    if (decision === "reject" && !reason.trim()) {
      setNotice({ ok: false, text: "Enter a rejection reason. The participant will see it." });
      return;
    }
    const current = selected;
    setBusy(decision);
    setNotice(null);
    try {
      const res = await reviewPayment(current.reg.id, decision, decision === "reject" ? reason.trim() : undefined);
      setNotice({
        ok: true,
        text:
          decision === "approve"
            ? `Approved ${current.reg.registration_number} (${current.name}). Ticket ${res.ticketNumber ?? current.reg.registration_number} issued.`
            : `Rejected ${current.reg.registration_number} (${current.name}). They can resubmit payment.`,
      });
      // Advance to the next registration still waiting in the queue.
      const next = filtered.find((r) => r.reg.id !== current.reg.id && r.reg.payment_status === "pending");
      changeSelection(next ? next.reg.id : null);
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : "Could not record the decision." });
    } finally {
      setBusy(null);
    }
  };

  const handleExport = () => {
    const csv = generateCsvData("payments");
    triggerDownload(csv, `nbkrist-p2p-payments-${Date.now()}.csv`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="frame bg-paper p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title text-ink">Payment Verification</h1>
          <p className="mt-2 text-sm text-ink-2">
            Collected: <strong className="num font-semibold text-ink">₹{collected.toLocaleString("en-IN")}</strong> from{" "}
            <span className="num">{counts.success}</span> verified •{" "}
            <strong className="num font-semibold text-ink">{counts.pending}</strong> waiting for review
          </p>
        </div>

        <button onClick={handleExport} className="btn self-start sm:self-auto">
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Export Payments CSV</span>
        </button>
      </div>

      <div className="frame bg-paper p-4 flex flex-col lg:flex-row lg:items-end gap-3">
        <div role="group" aria-label="Payment status" className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`btn btn-sm min-h-11 ${filter === f.value ? "btn-ink" : ""}`}
            >
              <span>{f.label}</span>
              <span className="num">({counts[f.value]})</span>
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <label htmlFor="payment-search" className="field-label">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id="payment-search"
              type="search"
              placeholder="Name, roll number, registration ID, UTR, email or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field pl-9"
            />
          </div>
        </div>
      </div>

      {notice && (
        <div
          role={notice.ok ? "status" : "alert"}
          className={`frame p-4 text-sm flex items-center gap-2 ${notice.ok ? "bg-ok-soft text-ink" : "bg-alert-soft text-alert font-semibold"}`}
        >
          {notice.ok && <CheckCircle2 className="w-4 h-4 text-ok flex-shrink-0" aria-hidden="true" />}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Queue */}
        <section className="lg:col-span-5 frame bg-paper" aria-labelledby="queue-heading">
          <h2 id="queue-heading" className="px-4 py-3 rule-b text-base font-semibold wide text-ink">
            {FILTERS.find((f) => f.value === filter)?.label} <span className="num text-ink-3">({filtered.length})</span>
          </h2>
          <ul className="divide-y-2 divide-line max-h-[70vh] overflow-y-auto">
            {filtered.map((r) => {
              const isSelected = selectedId === r.reg.id;
              return (
                <li key={r.reg.id}>
                  <button
                    type="button"
                    onClick={() => select(r.reg.id)}
                    aria-current={isSelected ? "true" : undefined}
                    className={`relative w-full text-left p-4 pl-5 min-h-11 transition-colors ${isSelected ? "bg-paper-2" : "hover:bg-paper-2"}`}
                  >
                    {isSelected && <span className="absolute left-0 top-0 bottom-0 w-1 bg-sky" aria-hidden="true" />}
                    <span className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-ink">{r.name}</span>
                      <span className={`tag ${statusTag(r.reg.payment_status)}`}>{statusLabel(r.reg.payment_status)}</span>
                    </span>
                    <span className="block font-mono text-xs text-ink-2">
                      {r.reg.registration_number} • {r.roll}
                    </span>
                    <span className="flex justify-between gap-2 mt-1 text-xs text-ink-2">
                      <span>
                        UTR <span className="font-mono text-ink">{r.reg.utr_number || "—"}</span> • <span className="num">₹{r.reg.fee}</span>
                      </span>
                      <span className="font-mono">{fmtIST(r.reg.created_at)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="p-6 text-sm text-ink-2">
                {filter === "pending" && !search ? "Nothing to verify. The queue is empty." : "No registrations match."}
              </li>
            )}
          </ul>
        </section>

        {/* Review panel */}
        <div className="lg:col-span-7">
          {selected ? (
            <section className="frame bg-paper" aria-labelledby="review-heading">
              <div className="p-5 sm:p-6 rule-b">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`tag ${statusTag(selected.reg.payment_status)}`}>{statusLabel(selected.reg.payment_status)}</span>
                  <span className="tag tag-info">{selected.iste ? "ISTE" : "Regular"}</span>
                </div>
                <h2 id="review-heading" className="text-2xl font-semibold wide text-ink mt-2 leading-tight">{selected.name}</h2>
                <p className="font-mono text-sm text-ink-2 mt-1">{selected.reg.registration_number}</p>
              </div>

              <dl className="p-5 sm:p-6 rule-b grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  ["UTR number", <span key="u" className="font-mono font-bold">{selected.reg.utr_number || "—"}</span>],
                  ["Fee due", <span key="f" className="num font-bold">₹{selected.reg.fee}</span>],
                  ["Roll number", <span key="r" className="font-mono">{selected.roll || "—"}</span>],
                  ["Year / Branch / Sec", `${selected.year || "—"} • ${selected.branch || "—"} • ${selected.section || "—"}`],
                  ["Email", selected.email || "—"],
                  ["Mobile", selected.mobile || "—"],
                  ["ISTE SM number", selected.iste ? selected.isteNo || "—" : "Not a member"],
                  ["Submitted", fmtIST(selected.reg.created_at)],
                  ["Verified", fmtIST(selected.reg.verified_at)],
                ].map(([k, v]) => (
                  <div key={String(k)} className="min-w-0">
                    <dt className="cell-label">{k}</dt>
                    <dd className="text-ink break-words">{v}</dd>
                  </div>
                ))}
                {selected.reg.rejection_reason && (
                  <div className="sm:col-span-2">
                    <dt className="cell-label">Rejection reason</dt>
                    <dd className="text-alert font-semibold">{selected.reg.rejection_reason}</dd>
                  </div>
                )}
              </dl>

              <div className="p-5 sm:p-6 rule-b space-y-3">
                <button
                  type="button"
                  onClick={handleProof}
                  disabled={busy === "proof" || !selected.reg.payment_proof_path}
                  aria-busy={busy === "proof"}
                  className="btn btn-sm min-h-11"
                >
                  <ImageIcon className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {!selected.reg.payment_proof_path
                      ? "No screenshot uploaded"
                      : busy === "proof"
                        ? "Loading…"
                        : proof
                          ? "Reload payment screenshot"
                          : "View payment screenshot"}
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
                        alt={`Payment screenshot for ${selected.reg.registration_number}`}
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

              {selected.reg.payment_status === "pending" ? (
                <div className="p-5 sm:p-6 space-y-3">
                  <p className="text-sm text-ink-2">
                    Match the UTR and amount (<span className="num font-bold text-ink">₹{selected.reg.fee}</span>) against the
                    bank statement before approving. Approving issues the ticket and QR.
                  </p>
                  {rejecting && (
                    <div>
                      <label htmlFor="reject-reason" className="field-label">Rejection reason (shown to the participant) *</label>
                      <textarea
                        id="reject-reason"
                        rows={2}
                        maxLength={300}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. UTR not found in the bank statement / amount paid was ₹50 instead of ₹100"
                        className="field"
                      />
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {!rejecting ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDecision("approve")}
                          disabled={busy !== null}
                          aria-busy={busy === "approve"}
                          className="btn btn-primary"
                        >
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
                          onClick={() => handleDecision("reject")}
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
                </div>
              ) : (
                <p className="p-5 sm:p-6 text-sm text-ink-2">
                  {selected.reg.payment_status === "success"
                    ? "This payment is verified and the ticket is issued."
                    : "This payment was rejected. It returns to the queue when the participant resubmits."}
                </p>
              )}
            </section>
          ) : (
            <div className="frame bg-paper p-12 text-center text-sm text-ink-2">
              Select a registration from the list to review its payment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
