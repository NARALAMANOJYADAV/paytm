"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Plus, Check, X, UserCheck, ShieldAlert, Lock } from "lucide-react";
import { loadStore, toggleCoordinatorPermission, saveStore } from "@/lib/store";
import { CoordinatorInfo, CoordinatorPermission } from "@/lib/types";

export default function AdminCoordinatorsPage() {
  const [coordinators, setCoordinators] = useState<CoordinatorInfo[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New coordinator form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [idNum, setIdNum] = useState("");

  const allPermissions: { key: CoordinatorPermission; label: string; desc: string }[] = [
    { key: "CHECKIN_VIEW", label: "Check-in Scanner View", desc: "Access the QR camera scanner interface" },
    { key: "CHECKIN_MANAGE", label: "Confirm Check-ins", desc: "Record and confirm participant attendance" },
    { key: "PARTICIPANT_VIEW", label: "Participant List", desc: "View registered students and search records" },
    { key: "REGISTRATION_VERIFY", label: "Registration Verification", desc: "Audit ticket existence and payment status" },
    { key: "SUPPORT_VIEW", label: "Support Desk View", desc: "Read student queries and issues" },
    { key: "SUPPORT_REPLY", label: "Support Reply", desc: "Send official responses to participant tickets" },
  ];

  const refreshList = () => {
    const store = loadStore();
    setCoordinators(store.coordinators);
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleToggle = (coordId: string, perm: CoordinatorPermission) => {
    toggleCoordinatorPermission(coordId, perm);
    refreshList();
  };

  const handleToggleStatus = (coordId: string) => {
    const store = loadStore();
    const c = store.coordinators.find((item) => item.id === coordId);
    if (c) {
      c.status = c.status === "active" ? "disabled" : "active";
      saveStore(store);
      refreshList();
    }
  };

  const handleAddCoordinator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !idNum.trim()) return;

    const store = loadStore();
    const newCoord: CoordinatorInfo = {
      id: `coord-${Date.now()}`,
      user_id: `user-coord-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      employee_or_student_id: idNum.trim(),
      status: "active",
      permissions: ["CHECKIN_VIEW", "CHECKIN_MANAGE", "PARTICIPANT_VIEW", "REGISTRATION_VERIFY"],
      created_at: new Date().toISOString(),
    };

    store.coordinators.push(newCoord);
    saveStore(store);
    setName("");
    setEmail("");
    setIdNum("");
    setShowAddModal(false);
    refreshList();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-red-400" />
            <span>Coordinator Management & Access Control</span>
          </h1>
          <p className="text-xs text-slate-400">
            Define granular operational permissions for event day coordinators (Sections 44 & 45).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Coordinator</span>
        </button>
      </div>

      {/* Add Modal Form */}
      {showAddModal && (
        <form
          onSubmit={handleAddCoordinator}
          className="rounded-3xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl animate-in fade-in duration-150"
        >
          <h3 className="font-bold text-white text-sm">Register New Event Coordinator</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. K. V. Chaitanya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Email ID *</label>
              <input
                type="email"
                required
                placeholder="coordinator@nbkrist.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Employee / Student ID *</label>
              <input
                type="text"
                required
                placeholder="NBKR-COORD-104"
                value={idNum}
                onChange={(e) => setIdNum(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
            >
              Save Coordinator
            </button>
          </div>
        </form>
      )}

      {/* Coordinators List with Granular Permissions */}
      <div className="space-y-6">
        {coordinators.map((coord) => (
          <div
            key={coord.id}
            className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 space-y-6 shadow-xl"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300 font-bold flex items-center justify-center text-base">
                  {coord.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{coord.name}</h2>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        coord.status === "active"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {coord.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {coord.email} • ID: <strong className="text-cyan-300 font-mono">{coord.employee_or_student_id}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => handleToggleStatus(coord.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    coord.status === "active"
                      ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                      : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                  }`}
                >
                  {coord.status === "active" ? "Disable Access" : "Activate Access"}
                </button>
              </div>
            </div>

            {/* Granular Permission Toggles matching Section 45 */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Assigned Coordinator Permissions ({coord.permissions.length} Enabled)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allPermissions.map((perm) => {
                  const isEnabled = coord.permissions.includes(perm.key);
                  return (
                    <button
                      key={perm.key}
                      type="button"
                      onClick={() => handleToggle(coord.id, perm.key)}
                      className={`text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isEnabled
                          ? "bg-purple-950/40 border-purple-500/60 shadow-sm"
                          : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-60"
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-white text-xs block">
                          {perm.label}
                        </span>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {perm.desc}
                        </p>
                        <span className="font-mono text-[9px] text-slate-500 block pt-1">
                          {perm.key}
                        </span>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          isEnabled
                            ? "bg-purple-500 text-slate-950 shadow-md shadow-purple-500/30"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isEnabled ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Restricted Areas Notice matching Section 44 */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Restricted automatically: Payment editing, Admin account management, Event settings.</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Enforced by RBAC</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
