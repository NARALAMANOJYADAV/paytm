"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Download, Printer, ShieldCheck, CheckCircle2, Sparkles, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { loadStore } from "@/lib/store";
import { Certificate } from "@/lib/types";
import { generateQrDataUrl } from "@/lib/qr";

export default function CertificatePage() {
  const { currentProfile, currentUser, currentRegistration } = useAuth();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [qrUrl, setQrUrl] = useState<string>("");

  const regNumber = currentRegistration?.registration_number || "P2P-2026-A8F92X";
  const name = currentProfile?.certificate_name || currentUser?.name || "Manoj N";

  useEffect(() => {
    const store = loadStore();
    const cert = store.certificates.find(
      (c) => c.registration_id.toUpperCase() === regNumber.toUpperCase()
    ) || store.certificates[0]; // defaults to verified certificate for preview

    if (cert) {
      setCertificate(cert);
      generateQrDataUrl(
        typeof window !== "undefined"
          ? `${window.location.origin}/verify/${cert.certificate_id}`
          : `https://nbkrist.org/verify/${cert.certificate_id}`
      ).then(setQrUrl);
    }
  }, [regNumber]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Official Certificate</h1>
          <p className="text-xs text-slate-400">
            Certified by N.B.K.R. Institute of Science & Technology in association with ISTE.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all self-start sm:self-auto print:hidden"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Download PDF</span>
        </button>
      </div>

      {certificate ? (
        <div className="space-y-4">
          
          {/* Holographic Certificate Frame */}
          <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-4 border-amber-500/40 p-6 sm:p-12 shadow-2xl overflow-hidden print:border-black print:bg-white print:text-black">
            
            {/* Background seal watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <Award className="w-96 h-96 text-cyan-400" />
            </div>

            <div className="relative z-10 border-2 border-dashed border-amber-500/30 rounded-2xl p-6 sm:p-10 text-center space-y-6 print:border-black">
              
              {/* Header Logos & College Branding */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center font-black text-cyan-300 text-sm">
                    NBKR
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center font-black text-blue-300 text-sm">
                    ISTE
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center font-black text-indigo-300 text-xs">
                    Paytm
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase print:text-black">
                  N.B.K.R. Institute of Science & Technology
                </h2>
                <p className="text-xs uppercase tracking-widest text-cyan-400 font-bold print:text-black">
                  Department of Information Technology & Artificial Intelligence & Data Science
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                  In Association with Indian Society for Technical Education (ISTE)
                </p>
              </div>

              {/* Certificate Title */}
              <div className="py-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
                  Certificate of {certificate.type === "winner" ? "Merit (1st Place)" : certificate.type === "runner_up" ? "Merit (Runner Up)" : "Participation"}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif italic text-white print:text-black">
                  PROMPT TO PRODUCTION
                </h3>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Paytm AI Workshop & Build Challenge
                </p>
              </div>

              {/* Citation Body */}
              <div className="space-y-3 max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed print:text-black">
                <p>This is to certify that</p>
                <div className="text-2xl sm:text-3xl font-bold text-cyan-300 font-serif border-b border-cyan-500/40 inline-block px-8 pb-1 print:text-black print:border-black">
                  {certificate.participant_name}
                </div>
                <p className="text-xs text-slate-400 print:text-black">
                  Roll No: <strong className="text-white font-mono print:text-black">{certificate.roll_number}</strong> • Branch: <strong className="text-white print:text-black">{certificate.branch}</strong>
                </p>
                <p className="text-xs sm:text-sm text-slate-300 pt-2 print:text-black">
                  has successfully participated in the full-day <strong className="text-white print:text-black">Prompt to Production – Paytm AI Workshop</strong> conducted on <strong className="text-white print:text-black">30 September 2026</strong>, acquiring hands-on mastery in Generative AI, Prompt Engineering, and AI-assisted production software development.
                </p>
                {certificate.rank && (
                  <p className="text-sm font-bold text-amber-400 pt-1 print:text-black">
                    ★ Awarded: {certificate.rank} ★
                  </p>
                )}
              </div>

              {/* Signatures & QR Section */}
              <div className="pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center print:border-black">
                <div className="text-center sm:text-left space-y-1">
                  <div className="font-serif italic text-sm text-slate-300 print:text-black">Dr. S. K. Rao</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Head of Department
                  </div>
                  <div className="text-[9px] text-slate-500">Dept of IT & AI&DS, NBKRIST</div>
                </div>

                {/* QR Verification Badge */}
                <div className="flex flex-col items-center justify-center">
                  <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-200">
                    {qrUrl ? (
                      <img src={qrUrl} alt="Verify Certificate" className="w-20 h-20" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 flex items-center justify-center text-[9px] text-slate-400">
                        QR Verification
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-[9px] text-cyan-400 mt-1 font-bold print:text-black">
                    {certificate.certificate_id}
                  </span>
                  <Link
                    href={`/verify/${certificate.certificate_id}`}
                    target="_blank"
                    className="text-[9px] text-slate-400 hover:text-cyan-400 underline print:hidden"
                  >
                    Verify Authenticity
                  </Link>
                </div>

                <div className="text-center sm:text-right space-y-1">
                  <div className="font-serif italic text-sm text-slate-300 print:text-black">Prof. K. Prasad</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Faculty Advisor
                  </div>
                  <div className="text-[9px] text-slate-500">ISTE Student Chapter</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Award className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Certificate Pending</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Certificates are issued following attendance verification at the venue and completion of the Build Challenge.
          </p>
        </div>
      )}
    </div>
  );
}
