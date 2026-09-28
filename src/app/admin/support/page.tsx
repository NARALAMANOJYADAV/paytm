"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import { loadStore, replySupportTicket } from "@/lib/store";
import { SupportTicket } from "@/lib/types";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");

  const refreshList = () => {
    const store = loadStore();
    setTickets(store.supportTickets);
    if (selectedTicket) {
      const up = store.supportTickets.find((t) => t.id === selectedTicket.id);
      setSelectedTicket(up || null);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !reply.trim()) return;

    replySupportTicket(selectedTicket.id, {
      senderName: "Dr. S. K. Rao (Head of Dept)",
      senderRole: "admin",
      message: reply.trim(),
    });

    setReply("");
    refreshList();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-red-400" />
          <span>Master Support Desk</span>
        </h1>
        <p className="text-xs text-slate-400">
          Global support inbox covering payments, registration issues, ticket replacements, and venue queries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Ticket List */}
        <div className="lg:col-span-5 space-y-2.5">
          {tickets.map((t) => {
            const isSelected = selectedTicket?.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-red-950/40 border-red-500 shadow-md"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-cyan-300">{t.ticket_code}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {t.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white">{t.subject}</h3>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>{t.user_name}</span>
                  <span>{t.category}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversation details */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-xl">
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] text-red-400 font-bold uppercase block">
                  {selectedTicket.ticket_code} • {selectedTicket.category}
                </span>
                <h2 className="text-base font-bold text-white mt-1">{selectedTicket.subject}</h2>
                <p className="text-xs text-slate-400">From: {selectedTicket.user_name} ({selectedTicket.registration_id})</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-200">
                {selectedTicket.message}
              </div>

              {/* Thread history */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Responses</span>
                {selectedTicket.responses.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between text-[10px] text-cyan-300 font-bold">
                      <span>{r.sender_name} ({r.sender_role})</span>
                      <span className="text-slate-500">{new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-300">{r.message}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleReply} className="pt-3 border-t border-slate-800 space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder="Official Admin response..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Response</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
              Select a support ticket to respond.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
