"use client";

import React, { useState } from "react";
import { User, ShieldCheck, Mail, Phone, Laptop, Award, ExternalLink, Save } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { loadStore, saveStore } from "@/lib/store";

export default function ProfilePage() {
  const { currentProfile, currentUser, currentRegistration } = useAuth();
  const [linkedin, setLinkedin] = useState(currentProfile?.linkedin_portfolio || "");
  const [isSaved, setIsSaved] = useState(false);

  const handleSavePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile) return;
    const store = loadStore();
    const p = store.profiles.find((pr) => pr.id === currentProfile.id);
    if (p) {
      p.linkedin_portfolio = linkedin;
      saveStore(store);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Participant Profile</h1>
        <p className="text-xs text-slate-400">
          Official enrollment records for Prompt to Production – Paytm AI Workshop.
        </p>
      </div>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-cyan-500/20">
            {currentProfile?.certificate_name?.[0] || "M"}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {currentProfile?.certificate_name || currentUser?.name || "Manoj N"}
            </h2>
            <p className="text-xs text-cyan-400 font-mono">
              Roll No: {currentProfile?.roll_number || "22011A3142"} • Reg ID: {currentRegistration?.registration_number || "P2P-2026-A8F92X"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {currentProfile?.branch || "AI & DS"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                {currentProfile?.year || "4th Year"} • Section {currentProfile?.section || "A"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 30 Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          <div className="space-y-4">
            <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400">
              Personal & Academic Details
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div>
                <span className="text-slate-400 block font-medium">Name for Certificate:</span>
                <span className="text-white font-bold text-sm">{currentProfile?.certificate_name || "Manoj N"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Roll Number:</span>
                <span className="text-cyan-300 font-mono font-bold">{currentProfile?.roll_number || "22011A3142"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Branch:</span>
                <span className="text-white font-medium">{currentProfile?.branch || "AI & DS"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Year & Section:</span>
                <span className="text-white font-medium">{currentProfile?.year || "4th Year"} • Section {currentProfile?.section || "A"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400">
              Contact & Membership Info
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div>
                <span className="text-slate-400 block font-medium">Email Address:</span>
                <span className="text-white font-mono">{currentUser?.email || "student@nbkrist.org"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Mobile Number:</span>
                <span className="text-white font-mono">{currentProfile?.mobile || "+91 98765 43210"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">ISTE Status:</span>
                <span className={`font-bold ${currentProfile?.iste_member ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {currentProfile?.iste_member ? `Member (${currentProfile?.iste_sm_number || 'ISTE-STU-2023-8942'})` : "Non-ISTE"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Laptop Availability:</span>
                <span className="text-white font-medium">{currentProfile?.has_laptop ? "Yes (Bringing Laptop)" : "No Laptop"}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Professional Profile Form */}
        <form onSubmit={handleSavePortfolio} className="pt-4 border-t border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            LinkedIn Profile / Portfolio Link
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update</span>
            </button>
          </div>
          {isSaved && (
            <p className="text-[11px] text-emerald-400">Profile URL updated successfully!</p>
          )}
          <p className="text-[10px] text-slate-400">
            Passwords and sensitive credentials are encrypted and never shown.
          </p>
        </form>

      </div>
    </div>
  );
}
