"use client";

import React, { useState } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { replySupportTicket, setSupportStatus, useStore } from "@/lib/store";
import { useAuth } from "@/lib/context/AuthContext";
import type { CoordinatorPermission, SupportStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: SupportStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const statusTag = (s: SupportStatus) =>
  s === "resolved" || s === "closed" ? "tag-ok" : s === "in_progress" ? "tag-info" : "tag-pending";

export default function CoordinatorSupportPage() {
  const { role, permissions } = useAuth();
  const can = (p: CoordinatorPermission) => role === "admin" || permissions.includes(p);
  const canReply = can("SUPPORT_REPLY");

  const store = useStore();
  const tickets = store.supportTickets;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedTicket = tickets.find((t) => t.id === selectedId) ?? null;
  const selectedRegNo = selectedTicket?.registration_id
    ? store.registrations.find((r) => r.id === selectedTicket.registration_id)?.registration_number
    : undefined;

  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const selectTicket = (id: string) => {
    setSelectedId(id);
    setFeedback(null);
    setReplyMessage("");
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    setSending(true);
    setFeedback(null);
    try {
      await replySupportTicket(selectedTicket.id, replyMessage.trim());
      setReplyMessage("");
      setFeedback({ kind: "ok", text: "Reply sent to the participant." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Could not send the reply." });
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: SupportStatus) => {
    if (!selectedTicket || status === selectedTicket.status) return;
    setStatusBusy(true);
    setFeedback(null);
    try {
      await setSupportStatus(selectedTicket.id, status);
      setFeedback({ kind: "ok", text: `Ticket marked ${STATUS_OPTIONS.find((o) => o.value === status)?.label.toLowerCase()}.` });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Could not update the status." });
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header plane */}
      <header className="frame bg-paper p-5 sm:p-6 space-y-1">
        <h1 className="page-title">Coordinator Support Desk</h1>
        <p className="text-sm text-ink-2">
          Respond to participant questions regarding check-in, tickets, and team setups.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket queue */}
        <section className="lg:col-span-5 frame bg-paper" aria-labelledby="queue-heading">
          <div className="p-4 rule-b flex items-center justify-between gap-3">
            <h2 id="queue-heading" className="text-lg font-semibold wide">
              Ticket Queue
            </h2>
            <span className="tag num">{tickets.length}</span>
          </div>

          {tickets.length === 0 ? (
            <p className="p-5 text-sm text-ink-2">No support tickets yet.</p>
          ) : (
            <ul className="divide-y divide-rule">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => selectTicket(t.id)}
                      aria-pressed={isSelected}
                      className={`relative w-full text-left p-4 min-h-[44px] transition-colors ${
                        isSelected ? "bg-paper-2" : "hover:bg-paper-2"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-sky" aria-hidden="true" />
                      )}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-ink-2">{t.ticket_code}</span>
                        <span className={`tag ${statusTag(t.status)}`}>
                          {t.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-ink line-clamp-1">{t.subject}</p>
                      <div className="flex items-center justify-between gap-2 text-xs text-ink-2 mt-1.5">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <User className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">{t.user_name}</span>
                        </span>
                        <span>{t.category}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Selected ticket conversation */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <section className="frame bg-paper" aria-labelledby="ticket-heading">
              <div className="p-5 sm:p-6 rule-b space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-bold text-ink-2">
                    {selectedTicket.ticket_code} · {selectedTicket.category}
                  </span>
                  {selectedRegNo && (
                    <span className="text-ink-2">
                      Reg ID: <strong className="text-ink font-mono">{selectedRegNo}</strong>
                    </span>
                  )}
                </div>
                <h2 id="ticket-heading" className="text-xl font-semibold wide">
                  {selectedTicket.subject}
                </h2>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink-2">
                    From: <strong className="text-ink">{selectedTicket.user_name}</strong>
                  </p>
                  {canReply ? (
                    <div className="flex items-center gap-2">
                      <label htmlFor="ticket-status" className="cell-label">
                        Status
                      </label>
                      <select
                        id="ticket-status"
                        value={selectedTicket.status}
                        onChange={(e) => handleStatusChange(e.target.value as SupportStatus)}
                        disabled={statusBusy}
                        aria-busy={statusBusy}
                        className="field py-1 min-h-[40px] w-auto"
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className={`tag ${statusTag(selectedTicket.status)}`}>
                      {selectedTicket.status.replace("_", " ")}
                    </span>
                  )}
                </div>
                {feedback && (
                  <p
                    role={feedback.kind === "error" ? "alert" : "status"}
                    className={`text-sm ${feedback.kind === "ok" ? "text-ok" : "text-alert"}`}
                  >
                    {feedback.text}
                  </p>
                )}
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/* Original message */}
                <div className="bg-paper-2 border border-line rounded-xl p-4 space-y-1">
                  <span className="cell-label block">Participant Message</span>
                  <p className="text-sm text-ink leading-relaxed">{selectedTicket.message}</p>
                </div>

                {/* Thread history */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-ink-2" aria-hidden="true" />
                    <span className="num">Conversation ({selectedTicket.responses.length})</span>
                  </h3>

                  {selectedTicket.responses.length === 0 ? (
                    <p className="text-sm text-ink-2">No responses recorded yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedTicket.responses.map((r) => (
                        <li key={r.id} className="border border-line bg-paper-2 rounded-xl p-4 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-ink">
                              {r.sender_name} <span className="tag tag-info ml-1">{r.sender_role}</span>
                            </span>
                            <span className="font-mono text-ink-2">
                              {new Date(r.created_at).toLocaleString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                day: "numeric",
                                month: "short",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-ink">{r.message}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Reply box */}
              {canReply ? (
              <form onSubmit={handleSendReply} className="p-5 sm:p-6 rule-t space-y-3">
                <label htmlFor="reply-message" className="field-label">
                  Official response
                </label>
                <textarea
                  id="reply-message"
                  rows={3}
                  required
                  placeholder="Type official response to participant..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="field"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending || !replyMessage.trim()}
                    aria-busy={sending}
                    className="btn btn-primary w-full sm:w-auto"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>{sending ? "Sending…" : "Send Reply"}</span>
                  </button>
                </div>
              </form>
              ) : (
                <p className="p-5 sm:p-6 rule-t text-sm text-ink-2">
                  You can read tickets but replying needs the support reply permission.
                </p>
              )}
            </section>
          ) : (
            <div className="frame bg-paper p-10 text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-ink-3 mx-auto" aria-hidden="true" />
              <p className="text-sm text-ink-2">Select a ticket from the queue to view details and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
