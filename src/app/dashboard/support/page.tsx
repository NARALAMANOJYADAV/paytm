"use client";

import React, { useState } from "react";
import PaymentHelp from "@/components/PaymentHelp";
import { Send, CheckCircle2, AlertCircle, Reply } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useStore, createSupportTicket, replySupportTicket } from "@/lib/store";
import { SupportTicket, SupportCategory } from "@/lib/types";

const fmtIST = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true,
  });

const STATUS_LABEL: Record<SupportTicket["status"], string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

function ReplyForm({ ticket }: { ticket: SupportTicket }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  if (ticket.status === "closed") {
    return (
      <p className="text-xs text-ink-3">
        This request is closed. Open a new request if you still need help.
      </p>
    );
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    setSent(false);
    try {
      await replySupportTicket(ticket.id, text.trim());
      setText("");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your reply.");
    } finally {
      setBusy(false);
    }
  };

  const fieldId = `reply-${ticket.id}`;
  return (
    <form onSubmit={handleReply} className="space-y-2">
      <label htmlFor={fieldId} className="field-label">
        {ticket.status === "resolved" ? "Still need help? Reply to reopen" : "Add a reply"}
      </label>
      <textarea
        id={fieldId}
        rows={2}
        maxLength={4000}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="field"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-sm" disabled={busy || !text.trim()} aria-busy={busy}>
          <Reply className="w-4 h-4" aria-hidden="true" />
          <span>{busy ? "Sending…" : "Send Reply"}</span>
        </button>
        {sent && <span role="status" className="text-sm text-ok">Reply sent.</span>}
        {error && <span role="alert" className="text-sm text-alert">{error}</span>}
      </div>
    </form>
  );
}

export default function SupportPage() {
  const { currentUser, currentRegistration } = useAuth();
  const store = useStore();
  const userId = currentUser?.id;
  const tickets = userId ? store.supportTickets.filter((t) => t.user_id === userId) : [];

  // Form State
  const [category, setCategory] = useState<SupportCategory>("Payment");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const regId = currentRegistration?.registration_number || "Not registered";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setBusy(true);
    setNotice(null);
    try {
      const { ticketCode } = await createSupportTicket({
        category,
        subject: subject.trim(),
        message: message.trim(),
        attachmentUrl: attachmentUrl.trim() || undefined,
      });
      setSubject("");
      setMessage("");
      setAttachmentUrl("");
      setNotice({ text: `Support request ${ticketCode} opened. A coordinator will reply here.`, type: "success" });
    } catch (err) {
      setNotice({ text: err instanceof Error ? err.message : "Could not open your support request.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const statusTag = (status: SupportTicket["status"]) =>
    status === "resolved" ? "tag-ok" : status === "closed" ? "tag-off" : status === "in_progress" ? "tag-info" : "tag-pending";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="frame bg-paper px-5 py-5 sm:px-6">
        <h1 className="page-title text-ink">Event Support Desk</h1>
        <p className="text-sm text-ink-2 mt-2">
          Get assistance from event coordinators and organizers for registration, payment, or venue questions.
        </p>
        <PaymentHelp className="mt-4" />
      </header>

      {notice && (
        <div
          role={notice.type === "success" ? "status" : "alert"}
          className={`px-4 py-3 border text-sm text-ink flex items-center gap-2 ${
            notice.type === "success" ? "border-ok bg-ok-soft" : "border-alert bg-alert-soft"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-ok flex-shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-5 h-5 text-alert flex-shrink-0" aria-hidden="true" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Ticket Submission Form */}
      <form onSubmit={handleSubmit} className="frame bg-paper" aria-labelledby="new-request">
        <div className="px-5 py-4 sm:px-6 rule-b">
          <h2 id="new-request" className="text-xl font-semibold wide text-ink">Open a Support Request</h2>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="reg-id" className="field-label">Registration ID</label>
              <input
                id="reg-id"
                type="text"
                disabled
                value={regId}
                className="field font-mono bg-field text-ink-2 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="category" className="field-label">Issue Category *</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportCategory)}
                className="field"
              >
                <option value="Registration">Registration</option>
                <option value="Payment">Payment</option>
                <option value="Ticket">Ticket & QR Pass</option>
                <option value="Attendance">Attendance / Check-in</option>
                <option value="Team">Team Management</option>
                <option value="Submission">Project Submission</option>
                <option value="Certificate">Certificate</option>
                <option value="Other">Other / General Query</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="field-label">Subject *</label>
            <input
              id="subject"
              type="text"
              required
              placeholder="Brief summary of your query"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="field"
            />
          </div>

          <div>
            <label htmlFor="message" className="field-label">Message *</label>
            <textarea
              id="message"
              rows={3}
              required
              placeholder="Provide relevant transaction IDs, error descriptions, or specific questions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="field"
            />
          </div>

          <div>
            <label htmlFor="attachment" className="field-label">Screenshot / Attachment Link (optional)</label>
            <input
              id="attachment"
              type="url"
              placeholder="https://drive.google.com/..."
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              className="field font-mono text-sm"
            />
            <p className="field-hint">Share a link (Google Drive, etc.). Don&apos;t paste passwords or OTPs.</p>
          </div>
        </div>

        <div className="rule-t px-5 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-ink-2">
            Assigned coordinators respond during workshop desk hours <span className="num">(8:30 AM – 4:30 PM)</span>.
          </p>

          <button type="submit" className="btn btn-primary self-start sm:self-auto" disabled={busy} aria-busy={busy}>
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>{busy ? "Submitting…" : "Submit Ticket"}</span>
          </button>
        </div>
      </form>

      {/* Existing Tickets List */}
      <section className="space-y-3" aria-labelledby="my-requests">
        <h2 id="my-requests" className="text-xl font-semibold wide text-ink">
          Your Support Requests <span className="num">({tickets.length})</span>
        </h2>

        {tickets.length === 0 ? (
          <div className="frame bg-paper p-6 text-center text-sm text-ink-2">
            No support requests opened yet.
          </div>
        ) : (
          <ul className="planes grid-cols-1">
            {tickets.map((t) => (
              <li key={t.id} className="p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-ink">{t.ticket_code}</span>
                    <span className="tag tag-info">{t.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`tag ${statusTag(t.status)}`}>{STATUS_LABEL[t.status]}</span>
                    <span className="font-mono text-xs text-ink-3">{fmtIST(t.created_at)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-ink">{t.subject}</h3>
                  <p className="text-sm text-ink-2 leading-relaxed plane-field border border-rule p-3 whitespace-pre-wrap break-words">
                    {t.message}
                  </p>
                  {t.attachment_url && (
                    <a href={t.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-ink underline decoration-2 underline-offset-4 break-all">
                      Attachment
                    </a>
                  )}
                </div>

                {/* Coordinator Responses */}
                {t.responses.length > 0 && (
                  <div className="space-y-2">
                    <span className="cell-label block">Conversation</span>
                    {t.responses.map((r) => (
                      <div
                        key={r.id}
                        className={`border border-line rounded-xl px-3 py-2 text-sm space-y-1 ${r.sender_role === "user" ? "bg-paper" : "bg-paper-2"}`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-ink">
                            {r.sender_role === "user" ? "You" : r.sender_name}
                            {r.sender_role !== "user" && <span className="font-normal text-ink-3"> · Event staff</span>}
                          </span>
                          <span className="font-mono text-ink-3">{fmtIST(r.created_at)}</span>
                        </div>
                        <p className="text-ink whitespace-pre-wrap break-words">{r.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                <ReplyForm ticket={t} />
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}
