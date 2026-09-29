"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function VerifyLookupPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = id.trim().toUpperCase();
    if (!/^CERT-[A-Z0-9-]{6,}$/.test(clean)) {
      setError("Enter the certificate ID printed on the certificate, e.g. CERT-P2P-2026-XXXXXXXX.");
      return;
    }
    router.push(`/verify/${encodeURIComponent(clean)}`);
  };

  return (
    <div className="px-4 sm:px-6 py-14 sm:py-24">
      <div className="max-w-xl mx-auto">
        <ShieldCheck className="w-8 h-8 text-ink" aria-hidden="true" />
        <h1 className="mt-5 text-[clamp(2rem,4.5vw,3rem)] font-semibold tracking-[-0.04em] leading-[1.02]">
          Verify a certificate
        </h1>
        <p className="mt-4 text-ink-2 leading-relaxed">
          Check that a Prompt to Production certificate was genuinely issued by NBKRIST. Enter the ID printed on the
          certificate, or scan its QR code.
        </p>
        <form onSubmit={submit} className="mt-8 frame bg-paper p-5 sm:p-6 space-y-4" noValidate>
          <div>
            <label htmlFor="cert-id" className="field-label">Certificate ID</label>
            <input
              id="cert-id"
              className="field font-mono uppercase"
              placeholder="CERT-P2P-2026-XXXXXXXX"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setError("");
              }}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? "cert-err" : undefined}
              autoComplete="off"
              spellCheck={false}
            />
            {error && <p id="cert-err" className="mt-1.5 text-sm font-medium text-alert">{error}</p>}
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Verify <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
