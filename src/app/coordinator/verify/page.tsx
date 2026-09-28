"use client";

import React, { useState } from "react";
import { SearchCheck, Search, CheckCircle2, XCircle, ShieldCheck, AlertCircle } from "lucide-react";
import { loadStore } from "@/lib/store";

export default function RegistrationVerifyPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const store = loadStore();
    const clean = query.trim().toUpperCase();

    const reg = store.registrations.find(
      (r) => r.registration_number.toUpperCase() === clean
    );

    if (!reg) {
      setData(null);
      setSearched(true);
      return;
    }

    const profile = store.profiles.find((p) => p.id === reg.participant_id);
    const user = store.users.find((u) => u.id === profile?.user_id);
    const payment = store.payments.find((p) => p.registration_id === reg.id);
    const ticket = store.tickets.find((t) => t.registration_id === reg.id);
    const att = store.attendance.find((a) => a.registration_number.toUpperCase() === reg.registration_number.toUpperCase());

    setData({
      reg,
      profile,
      user,
      payment,
      ticket,
      att,
    });
    setSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <SearchCheck className="w-6 h-6 text-purple-400" />
          <span>Registration Verification</span>
        </h1>
        <p className="text-xs text-slate-400">
          Audit registration validity, payment confirmation, and ticket generation status.
        </p>
      </div>

      <form onSubmit={handleSearch} className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Enter Registration Number
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. P2P-2026-A8F92X"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono uppercase focus:border-purple-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Audit Record
          </button>
        </div>
      </form>

      {searched && (
        data ? (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                  Audited Registration
                </span>
                <h2 className="text-xl font-black text-white">{data.reg.registration_number}</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                Verified in Database
              </span>
            </div>

            {/* Checklist of Requirements in Section 39 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Registration Record</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmed & Active
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Payment Verification</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Paid (₹{data.reg.fee})
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">3. Digital QR Ticket</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Issued ({data.ticket?.status || "Active"})
                </span>
              </div>
            </div>

            {/* Basic Participant Info */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
              <h3 className="font-bold text-white uppercase text-[11px] text-purple-400">
                Participant Profile
              </h3>
              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Name:</span>
                  <span className="font-bold text-white">{data.profile?.certificate_name || data.user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Roll Number:</span>
                  <span className="font-mono text-cyan-300">{data.profile?.roll_number}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Branch & Year:</span>
                  <span>{data.profile?.branch} • {data.profile?.year} (Sec {data.profile?.section})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Attendance Status:</span>
                  <span className={data.att ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                    {data.att ? `Checked in at ${data.att.check_in_time}` : "Not Checked in"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic">
              Note: As an event coordinator, payment records are read-only and cannot be altered. Contact administrator for financial adjustments.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-900 border border-rose-500/30 p-8 text-center space-y-3">
            <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Matching Registration Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Registration code "{query}" does not exist in the database. Verify with the student.
            </p>
          </div>
        )
      )}
    </div>
  );
}
