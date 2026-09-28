"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, MessageSquare, Send, CheckCircle2, Clock, User } from "lucide-react";
import { loadStore, replySupportTicket } from "@/lib/store";
import { useAuth } from "@/lib/context/AuthContext";
import { SupportTicket } from "@/lib/types";

export default function CoordinatorSupportPage() {
  const { currentUser } = useAuth();
  const coordinatorName = currentUser?.name || "K. V. Chaitanya";

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const refreshTickets = () => {
    const store = loadStore();
    setTickets(store.supportTickets);
    if (selectedTicket) {
      const updated = store.supportTickets.find((t) => t.id === selectedTicket.id);
      setSelectedTicket(updated || null);
    }
  };

  useEffect(() => {
    refreshTickets();
  }, []);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    replySupportTicket(selectedTicket.id, {
      senderName: coordinatorName,
      senderRole: "coordinator",
      message: replyMessage.trim(),
    });

    setReplyMessage("");
    refreshTickets();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-purple-400" />
          <span>Coordinator Support Desk</span>
        </h1>
        <p className="text-xs text-slate-400">
          Respond to participant questions regarding check-in, tickets, and team setups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Ticket List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Ticket Queue ({tickets.length})
          </span>

          <div className="space-y-2.5">
            {tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-purple-950/40 border-purple-500 shadow-md"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[11px] font-bold text-cyan-300">
                      {t.ticket_code}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        t.status === "resolved"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white line-clamp-1">
                    {t.subject}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>{t.user_name}</span>
                    <span>{t.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Ticket Conversation */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
              
              <div className="pb-4 border-b border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-400">
                    {selectedTicket.ticket_code} • {selectedTicket.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    Reg ID: <strong className="text-white font-mono">{selectedTicket.registration_id}</strong>
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">
                  {selectedTicket.subject}
                </h2>
                <p className="text-xs text-slate-400">
                  From: <strong className="text-slate-200">{selectedTicket.user_name}</strong>
                </p>
              </div>

              {/* Original Message */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Participant Message
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedTicket.message}
                </p>
              </div>

              {/* Thread History */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Staff Responses ({selectedTicket.responses.length})
                </span>

                {selectedTicket.responses.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No responses recorded yet.</p>
                ) : (
                  selectedTicket.responses.map((r) => (
                    <div
                      key={r.id}
                      className="bg-purple-950/30 border border-purple-500/30 p-3.5 rounded-2xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-purple-300">
                        <span className="font-bold">{r.sender_name} ({r.sender_role})</span>
                        <span className="text-slate-400">
                          {new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-slate-200">{r.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-800 space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder="Type official response to participant..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-purple-400 focus:outline-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center text-xs text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-700 mx-auto" />
              <p>Select a ticket from the left queue to view details and reply.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
