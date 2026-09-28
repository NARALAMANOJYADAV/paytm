"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import TicketCard from "@/components/TicketCard";
import { useAuth } from "@/lib/context/AuthContext";
import { loadStore } from "@/lib/store";

export default function DashboardOverviewPage() {
  const { currentProfile, currentUser, currentRegistration, currentTicket } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [certificateId, setCertificateId] = useState("");

  const regNumber = currentRegistration?.registration_number || "P2P-2026-A8F92X";
  const name = currentProfile?.certificate_name || currentUser?.name || "Manoj N";
  const rollNumber = currentProfile?.roll_number || "22011A3142";
  const branch = currentProfile?.branch || "AI & DS";
  const year = currentProfile?.year || "4th Year";
  const section = currentProfile?.section || "A";
  const isteMember = currentProfile?.iste_member ?? true;

  useEffect(() => {
    const store = loadStore();
    const att = store.attendance.find(
      (a) => a.registration_number.toUpperCase() === regNumber.toUpperCase()
    );
    setIsCheckedIn(!!att);

    const cert = store.certificates.find(
      (c) => c.registration_id.toUpperCase() === regNumber.toUpperCase()
    );
    if (cert) {
      setHasCertificate(true);
      setCertificateId(cert.certificate_id);
    }
  }, [regNumber]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Top Welcome Banner matching Section 29 */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/60 border border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Participant Hub</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Welcome, {name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Event: <strong className="text-cyan-300">Prompt to Production – Paytm AI Workshop</strong>
            </p>
          </div>

          {/* Section 29 Status Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Registration
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirmed
              </span>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Payment
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-cyan-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Paid (₹{isteMember ? 50 : 100})
              </span>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Attendance
              </span>
              <span className={`text-xs sm:text-sm font-extrabold flex items-center gap-1.5 mt-0.5 ${
                isCheckedIn ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                {isCheckedIn ? "Checked In" : "Pending Check-in"}
              </span>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Certificate
              </span>
              <span className={`text-xs sm:text-sm font-extrabold flex items-center gap-1.5 mt-0.5 ${
                hasCertificate ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                <Award className="w-3.5 h-3.5" />
                {hasCertificate ? "Available" : "After Evaluation"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Ticket on Left, Quick Hub on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Ticket Display */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Your Official Digital Event Ticket</span>
            </h2>
            <span className="text-xs text-slate-400">Present at Seminar Hall</span>
          </div>

          <TicketCard
            registrationId={regNumber}
            name={name}
            rollNumber={rollNumber}
            branch={branch}
            year={year}
            section={section}
            isteMember={isteMember}
            status="Confirmed"
          />
        </div>

        {/* Quick Hub Cards */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Build Challenge Reminder */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Build Challenge
              </span>
              <span className="text-[10px] text-slate-400">1:45 PM Kickoff</span>
            </div>
            <h3 className="text-sm font-bold text-white">
              Form Your Team (Up to 4 Members)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Collaborate on the hands-on AI build challenge. Create or join a team with your unique team invite code.
            </p>
            <Link
              href="/dashboard/team"
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-1"
            >
              <span>Manage My Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Workshop Resources Quick Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Workshop Materials & Presentations
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Download the Prompt Engineering Playbook, Paytm production keynote slides, and the official GitHub starter code.
            </p>
            <Link
              href="/dashboard/resources"
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-1"
            >
              <span>Browse All Resources</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Certificate Quick Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Certificate of Participation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {hasCertificate
                ? "Your official certificate is generated! View and download your certified credential."
                : "Certificates will be made available directly in this portal after attendance verification and challenge evaluation."}
            </p>
            <Link
              href="/dashboard/certificate"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors pt-1"
            >
              <span>{hasCertificate ? "View & Download Certificate" : "Check Certificate Eligibility"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
