"use client";

import React, { useState, useEffect } from "react";
import { Users, Download, Search, CheckCircle2, Clock } from "lucide-react";
import { loadStore, generateCsvData, triggerDownload } from "@/lib/store";

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const store = loadStore();
    const list = store.registrations.map((reg) => {
      const profile = store.profiles.find((p) => p.id === reg.participant_id);
      const user = store.users.find((u) => u.id === profile?.user_id);
      const att = store.attendance.find(
        (a) => a.registration_number.toUpperCase() === reg.registration_number.toUpperCase()
      );

      return {
        id: reg.id,
        regNum: reg.registration_number,
        name: profile?.certificate_name || user?.name,
        roll: profile?.roll_number,
        email: user?.email,
        phone: profile?.mobile,
        branch: profile?.branch,
        year: profile?.year,
        section: profile?.section,
        iste: profile?.iste_member,
        isteNumber: profile?.iste_sm_number,
        fee: reg.fee,
        laptop: profile?.has_laptop,
        checkedIn: !!att,
      };
    });
    setParticipants(list);
  }, []);

  const filtered = participants.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.roll?.toLowerCase().includes(q) ||
      p.regNum?.toLowerCase().includes(q) ||
      p.branch?.toLowerCase().includes(q)
    );
  });

  const handleExport = () => {
    const csv = generateCsvData("participants");
    triggerDownload(csv, `nbkrist-p2p-participants-${Date.now()}.csv`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-red-400" />
            <span>Master Participant Directory</span>
          </h1>
          <p className="text-xs text-slate-400">
            Total {participants.length} registered students • Filter and export to Excel/CSV.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export All to CSV</span>
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Filter by student name, roll number, registration ID, or branch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Reg ID</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5">Year</th>
                <th className="p-3.5">ISTE Status</th>
                <th className="p-3.5">Laptop</th>
                <th className="p-3.5">Fee</th>
                <th className="p-3.5">Gate Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-cyan-300">{item.regNum}</td>
                  <td className="p-3.5 font-bold text-white">{item.name}</td>
                  <td className="p-3.5 font-mono">{item.roll}</td>
                  <td className="p-3.5">{item.branch}</td>
                  <td className="p-3.5">{item.year} (Sec {item.section})</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.iste ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                    }`}>
                      {item.iste ? "ISTE" : "Regular"}
                    </span>
                  </td>
                  <td className="p-3.5">{item.laptop ? "Yes" : "No"}</td>
                  <td className="p-3.5 font-mono text-white">₹{item.fee}</td>
                  <td className="p-3.5">
                    {item.checkedIn ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>In</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </span>
                    )}
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
