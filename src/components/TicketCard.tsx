"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Download, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  Printer, 
  Smartphone,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { generateQrDataUrl } from "@/lib/qr";
import { downloadIcsFile } from "@/lib/ics";
import { downloadWalletPassJson } from "@/lib/wallet";

interface TicketCardProps {
  registrationId: string;
  name: string;
  rollNumber: string;
  branch: string;
  year?: string;
  section?: string;
  isteMember?: boolean;
  status?: string;
  hideActions?: boolean;
}

export default function TicketCard({
  registrationId,
  name,
  rollNumber,
  branch,
  year = "4th Year",
  section = "A",
  isteMember = true,
  status = "Confirmed",
  hideActions = false,
}: TicketCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadQr() {
      const url = await generateQrDataUrl(`ticket_id=${registrationId}`);
      setQrDataUrl(url);
    }
    loadQr();
  }, [registrationId]);

  const handleDownloadCalendar = () => {
    downloadIcsFile(`P2P-Workshop-${registrationId}.ics`);
  };

  const handleDownloadWallet = () => {
    downloadWalletPassJson({
      registrationId,
      participantName: name,
      rollNumber,
      branch,
      venue: "Seminar Hall, New CSE Block, NBKRIST",
      eventDate: "30 September 2026",
    });
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Visual Holographic Digital Ticket Container */}
      <div 
        ref={ticketRef}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/40 p-1 shadow-2xl shadow-cyan-950/60 print:border-black print:text-black print:bg-white"
      >
        {/* Glowing holographic ambient accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none print:hidden"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none print:hidden"></div>

        <div className="relative rounded-[22px] bg-slate-950/90 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between border border-cyan-500/20 print:bg-white print:border-none print:p-4">
          
          {/* Top Notch & College Header */}
          <div className="text-center pb-6 border-b border-dashed border-slate-800 print:border-slate-300">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold uppercase tracking-wider mb-3 print:border-black print:text-black">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Official Digital Event Pass</span>
            </div>

            <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight uppercase leading-tight print:text-black">
              Prompt to Production
            </h3>
            <p className="text-xs sm:text-sm font-bold text-cyan-400 tracking-wide uppercase mt-0.5 print:text-black">
              Paytm AI Workshop
            </p>

            <div className="mt-3 pt-3 border-t border-slate-900 print:border-slate-200">
              <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider print:text-black">
                N.B.K.R. Institute of Science & Technology
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                Department of IT & AI&DS • In Association with ISTE
              </p>
            </div>
          </div>

          {/* Participant Details Body */}
          <div className="py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Participant Name
                </span>
                <span className="font-extrabold text-white text-sm sm:text-base truncate block mt-0.5 print:text-black">
                  {name}
                </span>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Roll Number
                </span>
                <span className="font-mono font-bold text-cyan-300 text-sm sm:text-base block mt-0.5 print:text-black">
                  {rollNumber}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/40 rounded-xl p-2.5 border border-slate-800/60 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Branch
                </span>
                <span className="font-bold text-white text-xs sm:text-sm block mt-0.5 print:text-black">
                  {branch}
                </span>
              </div>

              <div className="bg-slate-900/40 rounded-xl p-2.5 border border-slate-800/60 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Year & Sec
                </span>
                <span className="font-bold text-white text-xs sm:text-sm block mt-0.5 print:text-black">
                  {year.split(" ")[0]} - {section}
                </span>
              </div>

              <div className="bg-slate-900/40 rounded-xl p-2.5 border border-slate-800/60 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  ISTE Status
                </span>
                <span className={`font-bold text-xs sm:text-sm block mt-0.5 ${isteMember ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {isteMember ? "Member (₹50)" : "Non-ISTE"}
                </span>
              </div>
            </div>

            {/* Registration Code Badge */}
            <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-blue-950/60 rounded-xl p-3 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Registration ID
                </span>
                <span className="font-mono font-black text-white text-base sm:text-lg tracking-wider print:text-black">
                  {registrationId}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{status}</span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center py-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
              <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${registrationId}`}
                    width={180}
                    height={180}
                    className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 sm:w-44 sm:h-44 bg-slate-100 flex items-center justify-center text-xs text-slate-400 animate-pulse">
                    Generating QR...
                  </div>
                )}
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-2 tracking-wide uppercase">
                Scan for instant entry verification
              </p>
            </div>

            {/* Event Time & Venue Details */}
            <div className="pt-3 border-t border-dashed border-slate-800 print:border-slate-300 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-200 print:text-black">
                <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="font-bold">Wednesday, 30 September 2026</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 print:text-black">
                <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>9:00 AM – 4:00 PM (Check-in starts 8:45 AM)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 print:text-black">
                <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Seminar Hall, New CSE Block, NBKRIST</span>
              </div>
            </div>
          </div>

          {/* Ticket Footer Bar */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Tamper-evident QR
            </span>
            <span className="font-mono">P2P-SYS-2026-PASS</span>
          </div>
        </div>
      </div>

      {/* Action Buttons as requested in Section 26, 27, 28 & 51 */}
      {!hideActions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
          <button
            onClick={handleDownloadCalendar}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 group"
          >
            <Calendar className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Add to Calendar (.ics)</span>
          </button>

          <button
            onClick={handleDownloadWallet}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 group"
          >
            <Smartphone className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Add to Wallet (Pass)</span>
          </button>

          <button
            onClick={handlePrintTicket}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/25 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Download / Print Ticket</span>
          </button>

          <Link
            href="/#schedule"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs sm:text-sm transition-all"
          >
            <span>View Event Schedule</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      )}
    </div>
  );
}
