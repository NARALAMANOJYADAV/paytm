"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { useStore, replySupportTicket, setSupportStatus } from "@/lib/store";
import { SupportTicket } from "@/lib/types";

const STATUSES: { value: SupportTicket["status"]; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
};

const statusTag = (status: SupportTicket["status"]) => {
  switch (status) {
    case "resolved":
      return "tag-ok";
    case "closed":
      return "tag-off";
    default:
      return "tag-pending";
  }
};

export default function AdminSupportPage() {
  const store = useStore();
  const tickets = store.supportTickets;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedTicket = tickets.find((t) => t.id === selectedId) ?? null;
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState<"reply" | "status" | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const regNumber = (id?: string) => (id ? store.registrations.find((r) => r.id === id)?.registration_number : undefined);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !reply.trim()) return;
    setBusy("reply");
    setNotice(null);
    try {
      await replySupportTicket(selectedTicket.id, reply.trim());
      setReply("");
      setNotice({ ok: true, text: "Response sent." });
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : "Could not send the response." });
    } finally {
      setBusy(null);
    }
  };

  const handleStatus = async (status: SupportTicket["status"]) => {
    if (!selectedTicket || status === selectedTicket.status) return;
    setBusy("status");
    setNotice(null);
    try {
      await setSupportStatus(selectedTicket.id, status);
      setNotice({ ok: true, text: `Ticket marked ${status.replace("_", " ")}.` });
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : "Could not update the status." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="frame bg-paper p-5 sm:p-6">
        <h1 className="page-title text-ink">Master Support Desk</h1>
        <p className="mt-2 text-sm text-ink-2">
          Global support inbox covering payments, registration issues, ticket replacements, and venue queries.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket List */}
        <ul className="lg:col-span-5 planes grid-cols-1" aria-label="Support tickets">
          {tickets.map((t) => {
            const isSelected = selectedTicket?.id === t.id;
            return (
              <li key={t.id} className={isSelected ? "bg-paper-2" : ""}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(t.id);
                    setNotice(null);
                  }}
                  aria-current={isSelected ? "true" : undefined}
                  className="relative w-full text-left p-4 pl-5 min-h-11 transition-colors hover:bg-paper-2"
                >
                  {isSelected && <span className="absolute left-0 top-0 bottom-0 w-1 bg-sky" aria-hidden="true" />}
                  <span className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-sm font-bold text-accent">{t.ticket_code}</span>
                    <span className={`tag ${statusTag(t.status)}`}>{t.status.replace("_", " ")}</span>
                  </span>
                  <span className="block text-sm font-bold text-ink">{t.subject}</span>
                  <span className="flex items-center justify-between gap-2 text-xs text-ink-2 mt-2">
                    <span>{t.user_name}</span>
                    <span className="uppercase tracking-wide">{t.category}</span>
                  </span>
                </button>
              </li>
            );
          })}
          {tickets.length === 0 && <li className="p-6 text-sm text-ink-2">No support tickets.</li>}
        </ul>

        {/* Conversation details */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <section className="frame bg-paper">
              <div className="p-5 sm:p-6 rule-b">
                <p className="font-mono text-xs font-bold text-ink-3 uppercase">
                  {selectedTicket.ticket_code} / {selectedTicket.category}
                </p>
                <h2 className="text-xl font-semibold wide text-ink mt-1">{selectedTicket.subject}</h2>
                <p className="text-sm text-ink-2 mt-1">
                  From: {selectedTicket.user_name || "Unknown user"}
                  {regNumber(selectedTicket.registration_id) && (
                    <>
                      {" "}(<span className="font-mono">{regNumber(selectedTicket.registration_id)}</span>)
                    </>
                  )}
                  {" • "}
                  <span className="font-mono text-xs">{formatTime(selectedTicket.created_at)}</span>
                </p>
                <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-2">
                  <div>
                    <label htmlFor="ticket-status" className="field-label">Status</label>
                    <select
                      id="ticket-status"
                      value={selectedTicket.status}
                      disabled={busy === "status"}
                      aria-busy={busy === "status"}
                      onChange={(e) => handleStatus(e.target.value as SupportTicket["status"])}
                      className="field"
                    >
                      {STATUSES.map((st) => (
                        <option key={st.value} value={st.value}>{st.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                <div className="plane-field frame p-4 text-sm text-ink whitespace-pre-wrap">{selectedTicket.message}</div>
                {selectedTicket.attachment_url && (
                  <a
                    href={selectedTicket.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-sm font-bold text-ink underline underline-offset-4 decoration-2 decoration-sky"
                  >
                    Open attachment
                  </a>
                )}

                {/* Thread history */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-ink">Responses</h3>
                  {selectedTicket.responses.length === 0 && (
                    <p className="text-sm text-ink-2">No responses yet.</p>
                  )}
                  {selectedTicket.responses.map((r) => (
                    <div key={r.id} className="border border-rule bg-field-2 p-3 text-sm space-y-1">
                      <div className="flex flex-wrap justify-between gap-2 text-xs font-bold">
                        <span className="text-ink">
                          {r.sender_name} <span className="text-ink-3">({r.sender_role})</span>
                        </span>
                        <span className="font-mono text-ink-3">
                          {formatTime(r.created_at)}
                        </span>
                      </div>
                      <p className="text-ink-2 whitespace-pre-wrap">{r.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleReply} className="p-5 sm:p-6 rule-t space-y-3">
                <label htmlFor="admin-reply" className="field-label">
                  Official admin response
                </label>
                <textarea
                  id="admin-reply"
                  rows={3}
                  required
                  maxLength={4000}
                  placeholder="Official Admin response..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="field"
                />
                {notice && (
                  <p
                    role={notice.ok ? "status" : "alert"}
                    className={`frame px-3 py-2 text-sm font-semibold flex items-center gap-2 ${notice.ok ? "bg-ok-soft text-ok" : "bg-alert-soft text-alert"}`}
                  >
                    {notice.ok && <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
                    <span>{notice.text}</span>
                  </p>
                )}
                <button type="submit" disabled={busy === "reply" || !reply.trim()} aria-busy={busy === "reply"} className="btn btn-primary">
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>{busy === "reply" ? "Sending…" : "Send Response"}</span>
                </button>
                <p className="field-hint">Replying moves the ticket to “in progress”.</p>
              </form>
            </section>
          ) : (
            <div className="frame bg-paper p-12 text-center text-sm text-ink-2">
              Select a support ticket to respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
