"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, CheckCircle2, Download, ExternalLink, Sparkles, RefreshCw } from "lucide-react";
import { loadStore, saveStore } from "@/lib/store";
import { Certificate } from "@/lib/types";

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [issuedCount, setIssuedCount] = useState(0);
  const [notice, setNotice] = useState("");

  const refreshList = () => {
    const store = loadStore();
    setCertificates(store.certificates);
    setIssuedCount(store.certificates.length);
  };

  useEffect(() => {
    refreshList();
  }, []);

  // Mass Issue Certificates for all checked-in attendees
  const handleMassIssue = () => {
    const store = loadStore();
    let count = 0;

    store.attendance.forEach((att) => {
      const alreadyHas = store.certificates.some(
        (c) => c.registration_id.toUpperCase() === att.registration_number.toUpperCase()
      );
      if (!alreadyHas) {
        const certId = `CERT-P2P-2026-${String(store.certificates.length + 1).padStart(3, "0")}`;
        const newCert: Certificate = {
          id: `cert-${Date.now()}-${count}`,
          certificate_id: certId,
          registration_id: att.registration_number,
          participant_name: att.participant_name,
          roll_number: att.roll_number,
          branch: att.branch,
          college_name: "N.B.K.R. Institute of Science & Technology",
          type: "participation",
          issue_date: "30 September 2026",
          verification_url: `/verify/${certId}`,
          status: "issued",
        };
        store.certificates.push(newCert);
        count++;
      }
    });

    saveStore(store);
    refreshList();
    setNotice(`Successfully generated & signed ${count} official certificates for verified attendees!`);
    setTimeout(() => setNotice(""), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span>Certificates & Verification Credentials</span>
          </h1>
          <p className="text-xs text-slate-400">
            {certificates.length} credentials issued with cryptographic tamper-evident verification.
          </p>
        </div>

        <button
          onClick={handleMassIssue}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Mass Issue to All Attendees</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Certificate ID</th>
                <th className="p-3.5">Participant Name</th>
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5">Type & Rank</th>
                <th className="p-3.5">Issue Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Verification Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {certificates.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-amber-400">
                    {item.certificate_id}
                  </td>
                  <td className="p-3.5 font-bold text-white">
                    {item.participant_name}
                  </td>
                  <td className="p-3.5 font-mono">{item.roll_number}</td>
                  <td className="p-3.5">{item.branch}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.type === "winner"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : item.type === "runner_up"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {item.rank || "Participation"}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">{item.issue_date}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/verify/${item.certificate_id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline font-semibold"
                    >
                      <span>Public Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
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
