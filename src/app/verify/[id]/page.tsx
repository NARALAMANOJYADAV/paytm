"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowLeft, XCircle, Ban, Loader2 } from "lucide-react";
import { verifyCertificate } from "@/lib/store";
import { Certificate } from "@/lib/types";

type VerifyState =
  | { status: "loading" }
  | { status: "valid"; cert: Certificate }
  | { status: "revoked" }
  | { status: "not_found" }
  | { status: "error"; message: string };

export default function VerifyCertificatePage() {
  const params = useParams();
  const certIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const [state, setState] = useState<VerifyState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!certIdParam) return;
    verifyCertificate(certIdParam)
      .then((res) => {
        if (cancelled) return;
        if (res.certificate) setState({ status: "valid", cert: res.certificate });
        else if (res.revoked) setState({ status: "revoked" });
        else setState({ status: "not_found" });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ status: "error", message: err instanceof Error ? err.message : "Verification failed." });
      });
    return () => {
      cancelled = true;
    };
  }, [certIdParam, attempt]);

  const view: VerifyState = certIdParam ? state : { status: "not_found" };
  const cert = view.status === "valid" ? view.cert : null;

  return (
    <div className="flex-1 min-h-[85vh] py-8 sm:py-12 px-4 sm:px-6 bg-field">
      <div className="max-w-2xl w-full mx-auto space-y-6">

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 min-h-11 text-sm font-bold text-ink-2 hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Homepage</span>
        </Link>

        {view.status === "loading" && (
          <div className="frame bg-paper p-8 space-y-3 text-center" role="status" aria-busy="true">
            <Loader2 className="w-8 h-8 text-ink-2 mx-auto animate-spin" aria-hidden="true" />
            <p className="text-sm text-ink-2">Verifying certificate...</p>
          </div>
        )}

        {view.status === "revoked" && (
          <div className="frame bg-paper p-8 space-y-4 text-center">
            <Ban className="w-10 h-10 text-alert mx-auto" aria-hidden="true" />
            <h1 className="page-title text-ink">Certificate Revoked</h1>
            <span className="tag tag-alert">Not valid</span>
            <p className="text-sm text-ink-2">
              The certificate <span className="font-mono text-ink break-all">&quot;{certIdParam}&quot;</span> was issued
              but has since been revoked by the organizers. It is no longer a valid credential.
            </p>
          </div>
        )}

        {view.status === "error" && (
          <div className="frame bg-paper p-8 space-y-4 text-center">
            <XCircle className="w-10 h-10 text-alert mx-auto" aria-hidden="true" />
            <h1 className="page-title text-ink">Could Not Verify</h1>
            <p role="alert" className="text-sm text-alert font-semibold">{view.status === "error" ? view.message : ""}</p>
            <button type="button" onClick={() => {
              setState({ status: "loading" });
              setAttempt((n) => n + 1);
            }} className="btn">
              Try again
            </button>
          </div>
        )}

        {(view.status === "valid" || view.status === "not_found") && (
          cert ? (
            <div className="space-y-4">

              {/* Verification result */}
              <header className="frame bg-paper px-5 py-5 sm:px-6 flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-ok flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-2">
                  <h1 className="page-title text-ink">Official Certificate Verified</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tag tag-ok">
                      <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      Verified Against Official Records
                    </span>
                  </div>
                </div>
              </header>

              {/* Printed-document record: intentionally light */}
              <article
                aria-label={`Certificate record ${cert.certificate_id}`}
                className="bg-white text-[#0d1117] border border-line p-1.5 [print-color-adjust:exact] [-webkit-print-color-adjust:exact]"
              >
                <div className="border border-line">
                  <div className="bg-navy text-white px-5 py-4 text-center">
                    <p className="font-semibold wide uppercase text-sm sm:text-lg leading-tight">
                      N.B.K.R. Institute of Science &amp; Technology
                    </p>
                    <p className="text-[11px] uppercase tracking-widest text-[rgba(255,255,255,0.7)] font-bold mt-1">
                      Department of IT &amp; AI&amp;DS · In association with ISTE Student Chapter
                    </p>
                  </div>

                  <div className="px-5 py-6 sm:px-8 text-center space-y-2">
                    <p className="display uppercase text-xl sm:text-3xl">Prompt to Production</p>
                    <p className="text-[11px] uppercase tracking-widest font-bold text-[#5b6472]">Certified Participant</p>
                    <p className="font-semibold wide text-2xl sm:text-3xl break-words">{cert.participant_name}</p>
                    {cert.rank && (
                      <p className="pt-2">
                        <span className="inline-block border border-line bg-sun text-on-accent px-3 py-1 font-semibold uppercase tracking-wide text-sm">
                          {cert.rank}
                        </span>
                      </p>
                    )}
                  </div>

                  <dl className="grid grid-cols-2 border-t-2 border-line text-left">
                    <div className="px-4 py-3 border-r-2 border-b-2 border-line">
                      <dt className="text-[11px] uppercase tracking-wider font-bold text-[#5b6472]">Roll Number</dt>
                      <dd className="font-mono font-bold text-sm mt-0.5 break-all">{cert.roll_number}</dd>
                    </div>
                    <div className="px-4 py-3 border-b-2 border-line">
                      <dt className="text-[11px] uppercase tracking-wider font-bold text-[#5b6472]">Branch</dt>
                      <dd className="font-bold text-sm mt-0.5">{cert.branch}</dd>
                    </div>
                    <div className="px-4 py-3 border-r-2 border-line">
                      <dt className="text-[11px] uppercase tracking-wider font-bold text-[#5b6472]">Credential ID</dt>
                      <dd className="font-mono font-bold text-sm mt-0.5 break-all">{cert.certificate_id}</dd>
                    </div>
                    <div className="px-4 py-3">
                      <dt className="text-[11px] uppercase tracking-wider font-bold text-[#5b6472]">Issue Date</dt>
                      <dd className="font-bold text-sm mt-0.5 tabular-nums">{cert.issue_date}</dd>
                    </div>
                  </dl>

                  <div className="border-t-2 border-line px-4 py-3 text-center">
                    <p className="font-mono text-[11px] text-[#3a414c]">
                      Verified against the Prompt to Production certificate registry
                    </p>
                  </div>
                </div>
              </article>

            </div>
          ) : (
            <div className="frame bg-paper p-8 space-y-4 text-center">
              <XCircle className="w-10 h-10 text-alert mx-auto" aria-hidden="true" />
              <h1 className="page-title text-ink">Certificate Not Found</h1>
              <span className="tag tag-alert">Not verified</span>
              <p className="text-sm text-ink-2">
                No certificate found with ID <span className="font-mono text-ink break-all">&quot;{certIdParam}&quot;</span>. Please verify the link or QR code scanned.
              </p>
            </div>
          )
        )}

      </div>
    </div>
  );
}
