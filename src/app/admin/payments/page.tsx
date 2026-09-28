"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Download, Search, CheckCircle2, ShieldCheck } from "lucide-react";
import { loadStore, generateCsvData, triggerDownload } from "@/lib/store";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const store = loadStore();
    const list = store.payments.map((p) => {
      const reg = store.registrations.find((r) => r.id === p.registration_id);
      const profile = store.profiles.find((pr) => pr.id === reg?.participant_id);
      return {
        ...p,
        regNum: reg?.registration_number || "N/A",
        participantName: profile?.certificate_name || "Student",
        rollNumber: profile?.roll_number || "N/A",
      };
    });
    setPayments(list);
  }, []);

  const totalAmount = payments.reduce((acc, p) => acc + (p.status === "success" ? p.amount : 0), 0);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.regNum.toLowerCase().includes(q) ||
      p.participantName.toLowerCase().includes(q) ||
      p.razorpay_payment_id.toLowerCase().includes(q)
    );
  });

  const handleExport = () => {
    const csv = generateCsvData("payments");
    triggerDownload(csv, `nbkrist-p2p-payments-${Date.now()}.csv`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span>Payments & Razorpay Orders</span>
          </h1>
          <p className="text-xs text-slate-400">
            Total Collections: <strong className="text-emerald-400 font-mono text-sm">₹{totalAmount.toLocaleString()}</strong> • 100% Server Verified
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Payments CSV</span>
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Filter by Registration ID, student name, or Razorpay payment ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-emerald-400 focus:outline-none"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Registration ID</th>
                <th className="p-3.5">Participant</th>
                <th className="p-3.5">Razorpay Order ID</th>
                <th className="p-3.5">Razorpay Payment ID</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-cyan-300">{item.regNum}</td>
                  <td className="p-3.5 font-bold text-white">
                    {item.participantName}
                    <span className="block text-[10px] text-slate-500 font-mono">{item.rollNumber}</span>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">{item.razorpay_order_id}</td>
                  <td className="p-3.5 font-mono text-[11px] text-cyan-400">{item.razorpay_payment_id}</td>
                  <td className="p-3.5 font-bold text-white text-sm">₹{item.amount}</td>
                  <td className="p-3.5 text-slate-300">{item.payment_method || "UPI / Card"}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 uppercase">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
