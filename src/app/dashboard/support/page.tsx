"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, Send, MessageSquare, CheckCircle2, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { loadStore, createSupportTicket } from "@/lib/store";
import { SupportTicket, SupportCategory } from "@/lib/types";

export default function SupportPage() {
  const { currentProfile, currentUser, currentRegistration } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Form State
  const [category, setCategory] = useState<SupportCategory>("Payment");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  const userId = currentUser?.id || "user-1";
  const userName = currentProfile?.certificate_name || currentUser?.name || "Manoj N";
  const regId = currentRegistration?.registration_number || "P2P-2026-A8F92X";

  const refreshTickets = () => {
    const store = loadStore();
    const myTickets = store.supportTickets.filter((t) => t.user_id === userId);
    setTickets(myTickets);
  };

  useEffect(() => {
    refreshTickets();
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    createSupportTicket({
      userId,
      userName,
      registrationId: regId,
      category,
      subject,
      message,
      attachmentUrl: attachmentUrl || undefined,
    });

    setSubject("");
    setMessage("");
    setAttachmentUrl("");
    setSuccessNotice("Support ticket submitted! Our coordinators will respond promptly.");
    setTimeout(() => setSuccessNotice(""), 4000);
    refreshTickets();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Event Support Desk</h1>
        <p className="text-xs text-slate-400">
          Get assistance from event coordinators and organizers for registration, payment, or venue questions.
        </p>
      </div>

      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Ticket Submission Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Open a Support Request</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Registration ID
            </label>
            <input
              type="text"
              disabled
              value={regId}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Issue Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SupportCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
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
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Subject *
          </label>
          <input
            type="text"
            required
            placeholder="Brief summary of your query"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Message *
          </label>
          <textarea
            rows={3}
            required
            placeholder="Provide relevant transaction IDs, error descriptions, or specific questions..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[10px] text-slate-400">
            Assigned coordinators respond during workshop desk hours (8:30 AM – 4:30 PM).
          </p>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Ticket</span>
          </button>
        </div>
      </form>

      {/* Existing Tickets List matching Section 34 */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>Your Support Requests ({tickets.length})</span>
        </h2>

        {tickets.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            No support requests opened yet.
          </div>
        ) : (
          tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{t.ticket_code}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {t.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      t.status === "resolved"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {t.status}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(t.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm">{t.subject}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {t.message}
                </p>
              </div>

              {/* Coordinator Responses */}
              {t.responses.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Staff Response ({t.assigned_to || "Coordinator"})
                  </span>
                  {t.responses.map((r) => (
                    <div
                      key={r.id}
                      className="bg-cyan-950/30 border border-cyan-500/30 p-3 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-cyan-300">{r.sender_name}</span>
                        <span className="text-slate-400">{new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-200">{r.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
