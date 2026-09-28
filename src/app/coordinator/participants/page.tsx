"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, CheckCircle2, Clock, Users, ArrowUpDown } from "lucide-react";
import { loadStore, processCheckIn } from "@/lib/store";
import { useAuth } from "@/lib/context/AuthContext";

export default function CoordinatorParticipantsPage() {
  const { currentUser } = useAuth();
  const coordinatorName = currentUser?.name || "K. V. Chaitanya";

  const [participants, setParticipants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("all"); // all, checked_in, not_checked_in
  const [isteFilter, setIsteFilter] = useState("all"); // all, iste, non-iste
  const [branchFilter, setBranchFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const refreshList = () => {
    const store = loadStore();
    const list = store.registrations.map((reg) => {
      const profile = store.profiles.find((p) => p.id === reg.participant_id);
      const user = store.users.find((u) => u.id === profile?.user_id);
      const att = store.attendance.find(
        (a) => a.registration_number.toUpperCase() === reg.registration_number.toUpperCase()
      );

      return {
        id: reg.id,
        registrationNumber: reg.registration_number,
        name: profile?.certificate_name || user?.name || "Participant",
        rollNumber: profile?.roll_number || "N/A",
        year: profile?.year || "4th Year",
        branch: profile?.branch || "AI & DS",
        section: profile?.section || "A",
        isteMember: profile?.iste_member ?? false,
        paymentStatus: reg.payment_status,
        isCheckedIn: !!att,
        checkInTime: att?.check_in_time,
      };
    });
    setParticipants(list);
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleManualCheckin = (regNumber: string) => {
    processCheckIn(regNumber, coordinatorName);
    refreshList();
  };

  const filtered = participants.filter((p) => {
    // Search filter: name, roll number, registration ID
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      p.rollNumber.toLowerCase().includes(query) ||
      p.registrationNumber.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (statusFilter === "checked_in" && !p.isCheckedIn) return false;
    if (statusFilter === "not_checked_in" && p.isCheckedIn) return false;

    if (isteFilter === "iste" && !p.isteMember) return false;
    if (isteFilter === "non-iste" && p.isteMember) return false;

    if (branchFilter !== "all" && p.branch !== branchFilter) return false;
    if (yearFilter !== "all" && p.year !== yearFilter) return false;

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            <span>Participant Roster</span>
          </h1>
          <p className="text-xs text-slate-400">
            Showing {filtered.length} of {participants.length} registered students.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls matching Section 38 */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-sm">
        
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, roll number, or registration ID (e.g. P2P-2026-A8F92X)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-purple-400 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Attendance
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="checked_in">Checked In</option>
              <option value="not_checked_in">Not Checked In</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              ISTE Status
            </label>
            <select
              value={isteFilter}
              onChange={(e) => setIsteFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
            >
              <option value="all">All Memberships</option>
              <option value="iste">ISTE Member (₹50)</option>
              <option value="non-iste">Non-ISTE (₹100)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Branch
            </label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
            >
              <option value="all">All Branches</option>
              <option value="AI & DS">AI & DS</option>
              <option value="IT">IT</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Year of Study
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
            >
              <option value="all">All Years</option>
              <option value="4th Year">4th Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="2nd Year">2nd Year</option>
            </select>
          </div>
        </div>

      </div>

      {/* Participants Table matching Section 38 */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Registration ID</th>
                <th className="p-3.5">Participant Name</th>
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Branch & Year</th>
                <th className="p-3.5">Sec</th>
                <th className="p-3.5">ISTE</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Attendance</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-cyan-300">
                    {item.registrationNumber}
                  </td>
                  <td className="p-3.5 font-bold text-white">
                    {item.name}
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">
                    {item.rollNumber}
                  </td>
                  <td className="p-3.5">
                    {item.branch} • {item.year.split(" ")[0]}
                  </td>
                  <td className="p-3.5 text-center font-bold">
                    {item.section}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.isteMember ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                    }`}>
                      {item.isteMember ? "ISTE" : "Regular"}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-bold uppercase text-emerald-400">
                      {item.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {item.isCheckedIn ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{item.checkInTime || "In"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {!item.isCheckedIn ? (
                      <button
                        onClick={() => handleManualCheckin(item.registrationNumber)}
                        className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] font-bold transition-colors"
                      >
                        Check In
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500">Verified</span>
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
