"use client";

import React, { useState } from "react";
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Volume2,
  Camera,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { processCheckIn, loadStore } from "@/lib/store";
import { useAuth } from "@/lib/context/AuthContext";

export default function CheckinVerificationPage() {
  const { currentUser } = useAuth();
  const coordinatorName = currentUser?.name || "K. V. Chaitanya";

  const [inputQuery, setInputQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    status: "verified" | "already_checked_in" | "invalid";
    message: string;
    participant?: any;
  } | null>(null);

  // Audio chime feedback
  const playSound = (type: "success" | "warning" | "error") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        // High pleasant double ding
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "warning") {
        // Low cautionary double buzz
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(260, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // Error drop
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(140, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {}
  };

  const handleVerify = (tokenOrId: string) => {
    if (!tokenOrId.trim()) return;

    const res = processCheckIn(tokenOrId, coordinatorName);
    setResult(res);

    if (res.status === "verified") {
      playSound("success");
    } else if (res.status === "already_checked_in") {
      playSound("warning");
    } else {
      playSound("error");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(inputQuery);
  };

  // Sample quick test cards for coordinator testing
  const sampleTestTickets = [
    { label: "Manoj N (Unchecked)", code: "P2P-2026-A8F92X" },
    { label: "Pooja Reddy (Already In)", code: "P2P-2026-B4C77Y" },
    { label: "Invalid Test Code", code: "P2P-INVALID-999" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <QrCode className="w-6 h-6 text-purple-400" />
          <span>Ticket Check-in Verification</span>
        </h1>
        <p className="text-xs text-slate-400">
          Scan participant QR or enter Registration ID for tamper-evident admission.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: QR Camera Scanner + Input */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Camera Scanner Box */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-purple-400" />
                Live Camera Scanner
              </span>
              <button
                onClick={() => setIsScanning(!isScanning)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isScanning
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                }`}
              >
                {isScanning ? "Stop Camera" : "Start Camera"}
              </button>
            </div>

            {/* Viewfinder simulation */}
            <div className="relative aspect-video rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
              {isScanning ? (
                <>
                  <div className="absolute inset-x-8 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-lg shadow-cyan-400"></div>
                  <div className="w-48 h-48 border-2 border-purple-400/80 rounded-2xl relative flex items-center justify-center animate-pulse">
                    <span className="text-[11px] text-cyan-300 font-mono">
                      Align QR in Frame
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-4">
                    Scanning active • Hold ticket steady in front of lens
                  </p>
                </>
              ) : (
                <div className="space-y-3">
                  <QrCode className="w-12 h-12 text-slate-600 mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-300">Camera Viewfinder Ready</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click "Start Camera" or type registration code below
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Manual Input Form */}
          <form
            onSubmit={handleFormSubmit}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3"
          >
            <label className="block text-xs font-semibold text-slate-300">
              Manual Registration ID Lookup
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. P2P-2026-A8F92X"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono uppercase focus:border-purple-400 focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Verify
              </button>
            </div>
          </form>

          {/* Quick Click Simulation for Coordinator Testing */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Quick Test Simulation:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleTestTickets.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputQuery(t.code);
                    handleVerify(t.code);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 transition-colors"
                >
                  {t.label} ({t.code})
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Exact Section 37 Verification Result Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verification Result
            </h2>
            {result && (
              <button
                onClick={() => setResult(null)}
                className="text-[10px] text-purple-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {result ? (
            <div
              className={`rounded-3xl p-6 sm:p-7 space-y-5 border-2 shadow-2xl transition-all ${
                result.status === "verified"
                  ? "bg-gradient-to-b from-emerald-950/60 via-slate-900 to-slate-950 border-emerald-400 shadow-emerald-500/20"
                  : result.status === "already_checked_in"
                  ? "bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 border-amber-400 shadow-amber-500/20"
                  : "bg-gradient-to-b from-rose-950/60 via-slate-900 to-slate-950 border-rose-500 shadow-rose-500/20"
              }`}
            >
              {/* Result Status Banner */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${
                    result.status === "verified"
                      ? "bg-emerald-500 text-slate-950"
                      : result.status === "already_checked_in"
                      ? "bg-amber-400 text-slate-950"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {result.status === "verified" ? "✓" : result.status === "already_checked_in" ? "⚠" : "✕"}
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {result.status === "verified" && "✓ CHECK-IN VERIFIED"}
                    {result.status === "already_checked_in" && "⚠ ALREADY CHECKED IN"}
                    {result.status === "invalid" && "✕ INVALID TICKET"}
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {result.message}
                  </p>
                </div>
              </div>

              {/* Section 36 Basic Participant Details (No private passwords/emails exposed) */}
              {result.participant && (
                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">
                      Participant Name
                    </span>
                    <span className="text-white font-black text-base">
                      {result.participant.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">
                        Registration ID
                      </span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {result.participant.registrationNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">
                        Roll Number
                      </span>
                      <span className="font-mono text-white font-bold">
                        {result.participant.rollNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">
                        Branch & Year
                      </span>
                      <span className="text-white">
                        {result.participant.branch} • {result.participant.year} (Sec {result.participant.section})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">
                        ISTE Status
                      </span>
                      <span className={`font-bold ${result.participant.isteMember ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {result.participant.isteMember ? "ISTE Member" : "Non-ISTE"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {result.participant.firstCheckInTime || result.participant.checkInTime}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-3">
              <UserCheck className="w-12 h-12 text-slate-700 mx-auto" />
              <h3 className="text-sm font-bold text-slate-400">Awaiting Scanner Input</h3>
              <p className="text-xs text-slate-500">
                Scan or enter ticket code to view participant verification details.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
