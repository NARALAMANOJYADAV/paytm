"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Printer, ExternalLink, Check, X } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useStore } from "@/lib/store";
import { Certificate } from "@/lib/types";
import { generateQrDataUrl } from "@/lib/qr";

const fmtIST = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  });

function certLabel(c: Certificate): string {
  switch (c.type) {
    case "winner":
      return `Merit (${c.rank || "1st Place"})`;
    case "runner_up":
      return `Merit (${c.rank || "2nd Place"})`;
    case "merit":
      return c.rank ? `Merit (${c.rank})` : "Merit";
    default:
      return "Participation";
  }
}

export default function CertificatePage() {
  const { currentProfile, currentUser, currentRegistration: reg } = useAuth();
  const store = useStore();
  const { eventConfig } = store;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [now] = useState(() => Date.now());

  const name = currentProfile?.certificate_name || currentUser?.name || "";

  // Merit first, then participation
  const certificates = (reg ? store.certificates.filter((c) => c.registration_id === reg.id && c.status === "issued") : [])
    .slice()
    .sort((a, b) => Number(a.type === "participation") - Number(b.type === "participation"));
  const certificate = certificates.find((c) => c.certificate_id === selectedId) ?? certificates[0] ?? null;
  const certificateId = certificate?.certificate_id;

  useEffect(() => {
    if (!certificateId) return;
    let cancelled = false;
    generateQrDataUrl(`${window.location.origin}/verify/${certificateId}`).then((url) => {
      if (!cancelled) setQrUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [certificateId]);

  const handlePrint = () => {
    window.print();
  };

  const certType = certificate ? certLabel(certificate) : "";

  // Eligibility, from the participant's own records
  const paymentVerified = !!reg && reg.registration_status === "confirmed" && reg.payment_status === "success";
  const checkIn = reg
    ? store.attendance.find((a) => a.registration_number === reg.registration_number && a.status === "checked_in")
    : undefined;
  const endAt = eventConfig.event_end_at;
  const eventEnded = !!endAt && now >= new Date(endAt).getTime();
  const conditions = [
    {
      ok: paymentVerified,
      label: "Payment verified",
      detail: paymentVerified
        ? "Your registration is confirmed."
        : reg?.payment_status === "failed"
          ? "Your payment was rejected. Resubmit it from the overview page."
          : reg
            ? "Your payment is still under verification."
            : "No registration found for your account.",
    },
    {
      ok: !!checkIn,
      label: "Checked in at the venue",
      detail: checkIn
        ? `Checked in ${checkIn.check_in_at ? fmtIST(checkIn.check_in_at) : checkIn.check_in_time}.`
        : "Show your ticket QR at the entrance on the event day.",
    },
    {
      ok: eventEnded,
      label: "Event has ended",
      detail: endAt
        ? eventEnded
          ? `The event ended ${fmtIST(endAt)}.`
          : `Certificates are issued after ${fmtIST(endAt)}.`
        : "The organisers have not announced the end time yet.",
    },
  ];
  const allMet = conditions.every((c) => c.ok);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="frame bg-paper px-5 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="page-title text-ink">Official Certificate</h1>
          <p className="text-sm text-ink-2 mt-2">
            Certified by N.B.K.R. Institute of Science &amp; Technology in association with ISTE.
          </p>
        </div>

        {certificate && (
        <button
          onClick={handlePrint}
          className="btn btn-primary self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" aria-hidden="true" />
          <span>Print / Download PDF</span>
        </button>
        )}
      </header>

      {certificates.length > 1 && (
        <div role="group" aria-label="Your certificates" className="frame bg-paper flex overflow-x-auto px-1 print:hidden">
          {certificates.map((c) => (
            <button
              key={c.certificate_id}
              onClick={() => setSelectedId(c.certificate_id)}
              data-active={certificate?.certificate_id === c.certificate_id ? "true" : undefined}
              aria-pressed={certificate?.certificate_id === c.certificate_id}
              className="rail-item shrink-0"
            >
              {certLabel(c)}
            </button>
          ))}
        </div>
      )}

      {certificate ? (
        /* Printed document: intentionally light, explicit colours */
        <article
          aria-label={`Certificate ${certificate.certificate_id} for ${certificate.participant_name || name}`}
          className="bg-white text-[#0d1117] border border-line p-1.5 sm:p-2 [print-color-adjust:exact] [-webkit-print-color-adjust:exact]"
        >
          <div className="border border-line">

            {/* Navy header band */}
            <div className="bg-navy text-white px-5 py-5 sm:px-10 sm:py-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3" aria-hidden="true">
                <span className="border border-white px-2 py-0.5 text-xs font-semibold tracking-wider">NBKR</span>
                <span className="border border-white px-2 py-0.5 text-xs font-semibold tracking-wider">ISTE</span>
                <span className="border border-white px-2 py-0.5 text-xs font-semibold tracking-wider">Paytm</span>
              </div>
              <p className="font-semibold wide uppercase text-base sm:text-xl leading-tight">
                N.B.K.R. Institute of Science &amp; Technology
              </p>
              <p className="text-[11px] sm:text-xs uppercase tracking-widest text-[rgba(255,255,255,0.7)] font-bold mt-1.5">
                Department of Information Technology &amp; Artificial Intelligence &amp; Data Science
              </p>
              <p className="text-[11px] uppercase tracking-widest text-[rgba(255,255,255,0.7)] mt-1">
                In Association with Indian Society for Technical Education (ISTE)
              </p>
            </div>

            {/* Body */}
            <div className="px-5 py-8 sm:px-12 sm:py-12 text-center space-y-6">
              <div className="space-y-2">
                <h2 className="display uppercase text-[1.75rem] sm:text-5xl">
                  Certificate of {certType}
                </h2>
                <p className="font-semibold wide uppercase tracking-wider text-navy text-base sm:text-lg">
                  Prompt to Production
                </p>
                <p className="text-xs font-bold uppercase tracking-widest text-[#3a414c]">
                  Paytm AI Workshop &amp; Build Challenge
                </p>
              </div>

              <div className="space-y-3 max-w-2xl mx-auto text-sm sm:text-base text-[#3a414c] leading-relaxed">
                <p>This is to certify that</p>
                <p className="font-semibold wide text-2xl sm:text-4xl text-[#0d1117] border-b-2 border-line inline-block px-4 sm:px-8 pb-1 break-words max-w-full">
                  {certificate.participant_name}
                </p>
                <p className="text-sm">
                  Roll No: <strong className="font-mono text-[#0d1117]">{certificate.roll_number}</strong> · Branch: <strong className="text-[#0d1117]">{certificate.branch}</strong>
                </p>
                <p className="pt-2">
                  has successfully participated in the full-day <strong className="text-[#0d1117]">Prompt to Production – Paytm AI Workshop</strong> conducted on <strong className="text-[#0d1117]">{eventConfig.date_formatted}</strong>, acquiring hands-on mastery in Generative AI, Prompt Engineering, and AI-assisted production software development.
                </p>
                {certificate.rank && (
                  <p className="pt-1">
                    <span className="inline-block border border-line bg-sun text-on-accent px-3 py-1 font-semibold uppercase tracking-wide text-sm">
                      Awarded: {certificate.rank}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Signatories, ruled row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 border-t-2 border-line divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-[#0d1117]">
              <div className="px-5 py-6 text-center flex flex-col justify-end">
                <div className="border-t border-line pt-2 mx-auto w-44 max-w-full">
                  <div className="font-bold text-sm">Dr. S. K. Rao</div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-[#3a414c]">Head of Department</div>
                  <div className="text-[11px] text-[#5b6472]">Dept of IT &amp; AI&amp;DS, NBKRIST</div>
                </div>
              </div>

              <div className="px-5 py-5 flex flex-col items-center justify-center gap-1.5">
                <div className="bg-white border border-[#c9ced5] p-1.5">
                  {qrUrl ? (
                    <img src={qrUrl} alt="Verify Certificate" className="block w-24 h-24" />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center text-[10px] text-[#5b6472]">
                      QR Verification
                    </div>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#5b6472]">Verification code</span>
                <span className="font-mono text-xs font-bold">{certificate.certificate_id}</span>
                <span className="text-[10px] text-[#5b6472]">Issued {new Date(certificate.issue_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <Link
                  href={certificate.verification_url || `/verify/${certificate.certificate_id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 min-h-11 text-xs font-bold text-navy underline print:hidden"
                >
                  Verify Authenticity
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="px-5 py-6 text-center flex flex-col justify-end">
                <div className="border-t border-line pt-2 mx-auto w-44 max-w-full">
                  <div className="font-bold text-sm">Prof. K. Prasad</div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-[#3a414c]">Faculty Advisor</div>
                  <div className="text-[11px] text-[#5b6472]">ISTE Student Chapter</div>
                </div>
              </div>
            </div>

          </div>
        </article>
      ) : (
        <div className="frame bg-paper">
          <div className="p-8 text-center space-y-3">
            <Award className="w-10 h-10 text-ink-3 mx-auto" aria-hidden="true" />
            <h2 className="text-xl font-semibold wide text-ink">Certificate Pending</h2>
            <span className={`tag ${allMet ? "tag-ok" : "tag-pending"}`}>
              {allMet ? "Eligible · awaiting issue" : "Not yet eligible"}
            </span>
            <p className="text-sm text-ink-2 max-w-md mx-auto">
              Participation certificates go to everyone whose payment was verified and who checked in at the venue.
              The organisers issue them after the event ends; merit certificates go to the 1st and 2nd placed teams.
            </p>
          </div>
          <ul className="rule-t divide-y divide-rule px-5 sm:px-6" aria-label="Eligibility">
            {conditions.map((c) => (
              <li key={c.label} className="py-3 flex items-start gap-3">
                <span
                  className={`w-6 h-6 flex items-center justify-center flex-shrink-0 border ${c.ok ? "border-ok bg-ok-soft text-ok" : "border-line bg-field text-ink-3"}`}
                  aria-hidden="true"
                >
                  {c.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">
                    {c.label}
                    <span className="sr-only">{c.ok ? ": met" : ": not met"}</span>
                  </p>
                  <p className="text-sm text-ink-2">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="rule-t px-5 py-4 sm:px-6 text-sm text-ink-2">
            {allMet
              ? "You meet every condition. Your certificate appears here once the organisers issue certificates."
              : "Certificates appear here automatically once issued."}{" "}
            Questions? Contact the{" "}
            <Link href="/dashboard/support" className="font-bold text-ink underline decoration-2 underline-offset-4">support desk</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
