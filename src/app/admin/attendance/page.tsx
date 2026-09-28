"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, Download, Search, CheckCircle2, Clock, UserPlus } from "lucide-react";
import { loadStore, generateCsvData, triggerDownload, processCheckIn } from "@/lib/store";
import { useAuth } from "@/lib/context/AuthContext";

export default function AdminAttendancePage() {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [feedback, setFeedback] = useState("");

  const refreshList = () => {
    const store = loadStore();
    setRecords(store.attendance);
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const res = processCheckIn(manualCode.trim(), `${currentUser?.name || "Admin"} (Override)`);
    setFeedback(res.message);
    setManualCode("");
    refreshList();
    setTimeout(() => setFeedback(""), 4000);
  };

  const handleExport = () => {
    const csv = generateCsvData("attendance");
    triggerDownload(csv, `nbkrist-p2p-attendance-${Date.now()}.csv`);
  };

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.participant_name.toLowerCase().includes(q) ||
      r.registration_number.toLowerCase().includes(q) ||
      r.roll_number.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-purple-400" />
            <span>Gate Attendance & Check-in Audit</span>
          </h1>
          <p className="text-xs text-slate-400">
            Current Hall Occupancy: <strong className="text-emerald-400 font-bold">{records.length} / 100 students</strong>
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs shadow-md shadow-purple-500/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Attendance Register (CSV)</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-purple-500 text-purple-300 text-xs flex items-center gap-2">
          <span>{feedback}</span>
        </div>
      )}

      {/* Manual Check-in Override Form */}
      <form onSubmit={handleManualCheckIn} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex gap-2">
        <input
          type="text"
          placeholder="Admin manual check-in override (Enter Registration ID, e.g. P2P-2026-A8F92X)..."
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value.toUpperCase())}
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono uppercase focus:border-purple-400 focus:outline-none"
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Force Check In</span>
        </button>
      </form>

      <div className="relative">
        <input
          type="text"
          placeholder="Filter attendance logs by student name, roll number, or reg ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-400 focus:outline-none"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Registration ID</th>
                <th className="p-3.5">Participant Name</th>
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5">Year & Sec</th>
                <th className="p-3.5">ISTE</th>
                <th className="p-3.5">Check-in Time</th>
                <th className="p-3.5">Verified By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-cyan-300">{item.registration_number}</td>
                  <td className="p-3.5 font-bold text-white">{item.participant_name}</td>
                  <td className="p-3.5 font-mono">{item.roll_number}</td>
                  <td className="p-3.5">{item.branch}</td>
                  <td className="p-3.5">{item.year.split(" ")[0]} - {item.section}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.iste_member ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                    }`}>
                      {item.iste_member ? "ISTE" : "Regular"}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">{item.check_in_time}</td>
                  <td className="p-3.5 text-slate-400">{item.checked_in_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
