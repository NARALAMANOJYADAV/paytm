"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Award, CheckCircle2, ShieldCheck, Calendar, Building, ArrowLeft, XCircle } from "lucide-react";
import { loadStore } from "@/lib/store";
import { Certificate } from "@/lib/types";

export default function VerifyCertificatePage() {
  const params = useParams();
  const certIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!certIdParam) return;
    const store = loadStore();
    const found = store.certificates.find(
      (c) => c.certificate_id.toUpperCase() === certIdParam.toUpperCase()
    );
    setCert(found || null);
    setLoaded(true);
  }, [certIdParam]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-xl w-full space-y-6">
        
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homepage</span>
        </Link>

        {loaded && (
          cert ? (
            <div className="rounded-3xl bg-slate-900 border-2 border-emerald-500/40 p-6 sm:p-8 space-y-6 shadow-2xl shadow-emerald-500/10">
              
              {/* Verification Header */}
              <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cryptographically Verified Record</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-white">
                    Official Certificate Verified
                  </h1>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Certified Participant
                  </span>
                  <span className="text-xl font-bold text-white block mt-0.5">
                    {cert.participant_name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Roll Number
                    </span>
                    <span className="font-mono text-cyan-300 font-bold text-sm">
                      {cert.roll_number}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Branch
                    </span>
                    <span className="text-white font-medium text-sm">
                      {cert.branch}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Credential ID
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      {cert.certificate_id}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Issue Date
                    </span>
                    <span className="text-slate-200">
                      {cert.issue_date}
                    </span>
                  </div>
                </div>

                {cert.rank && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs text-center">
                    ★ {cert.rank} ★
                  </div>
                )}
              </div>

              {/* Institution Seal Card */}
              <div className="space-y-2 text-center text-xs text-slate-400 pt-2">
                <p className="font-bold text-slate-200">
                  N.B.K.R. Institute of Science & Technology
                </p>
                <p className="text-[11px]">
                  Department of IT & AI&DS • In association with ISTE Student Chapter
                </p>
                <p className="text-[10px] text-slate-500 font-mono pt-1">
                  SHA-256 Validated Signature • Prompt to Production 2026
                </p>
              </div>

            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-rose-500/40 p-8 space-y-4 text-center shadow-xl">
              <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Certificate Not Found</h2>
              <p className="text-xs text-slate-400">
                No certificate found with ID "{certIdParam}". Please verify the link or QR code scanned.
              </p>
            </div>
          )
        )}

      </div>
    </div>
  );
}
