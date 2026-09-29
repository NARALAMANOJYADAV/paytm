"use client";

import React, { useState } from "react";
import Link from "next/link";
import PaymentHelp from "@/components/PaymentHelp";
import { ArrowRight, AlertCircle, CheckCircle2, Clock, Upload } from "lucide-react";
import TicketCard from "@/components/TicketCard";
import { useAuth } from "@/lib/context/AuthContext";
import { resubmitPayment, useStore } from "@/lib/store";
import { ProjectSubmission, Registration } from "@/lib/types";

function submissionTag(status?: ProjectSubmission["status"]) {
  switch (status) {
    case "submitted":
    case "evaluated":
      return "tag-ok";
    case "draft":
    case "under_review":
      return "tag-pending";
    default:
      return "";
  }
}

const fmtIST = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
      })
    : "";

const PROOF_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

function ResubmitPaymentForm({ registration, upiId }: { registration: Registration; upiId?: string }) {
  const [utr, setUtr] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanUtr = utr.replace(/\s/g, "");
    if (!/^\d{12}$/.test(cleanUtr)) {
      setError("Enter the 12-digit UPI transaction reference (UTR).");
      return;
    }
    if (!proof) {
      setError("Upload a screenshot of your payment.");
      return;
    }
    if (!PROOF_TYPES.includes(proof.type)) {
      setError("Payment screenshot must be PNG, JPG, WEBP or PDF.");
      return;
    }
    if (proof.size > 5 * 1024 * 1024) {
      setError("Payment screenshot must be under 5 MB.");
      return;
    }
    const form = new FormData();
    form.set("utr", cleanUtr);
    form.set("proof", proof);
    setBusy(true);
    try {
      await resubmitPayment(form);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resubmit your payment.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <p role="status" className="px-5 py-4 sm:px-6 text-sm text-ink flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-ok flex-shrink-0" aria-hidden="true" />
        Payment resubmitted. It is now under verification.
      </p>
    );
  }

  return (
    <form id="resubmit" onSubmit={handleSubmit} className="px-5 py-5 sm:px-6 space-y-4" aria-labelledby="resubmit-title">
      <div>
        <h3 id="resubmit-title" className="font-semibold text-ink text-lg">Resubmit payment</h3>
        <p className="text-sm text-ink-2 mt-1">
          Pay <strong className="text-ink num">₹{registration.fee}</strong>
          {upiId ? <> to UPI ID <span className="font-mono text-ink">{upiId}</span></> : null}, then enter the new
          12-digit UTR and upload a screenshot of the payment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="resubmit-utr" className="field-label">UTR / UPI reference *</label>
          <input
            id="resubmit-utr"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={14}
            required
            placeholder="12-digit number"
            value={utr}
            onChange={(e) => setUtr(e.target.value.replace(/[^\d\s]/g, ""))}
            className="field font-mono"
          />
        </div>
        <div>
          <label htmlFor="resubmit-proof" className="field-label">Payment screenshot *</label>
          <input
            id="resubmit-proof"
            type="file"
            required
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={(e) => setProof(e.target.files?.[0] ?? null)}
            className="field text-sm"
          />
          <p className="field-hint">PNG, JPG, WEBP or PDF, up to 5 MB.</p>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-alert flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>
        <Upload className="w-4 h-4" aria-hidden="true" />
        <span>{busy ? "Uploading…" : "Resubmit payment"}</span>
      </button>
    </form>
  );
}

export default function DashboardOverviewPage() {
  const { currentProfile, currentUser, currentRegistration: reg, currentTicket } = useAuth();
  const store = useStore();
  const { eventConfig } = store;
  const [now] = useState(() => Date.now());

  const name = currentProfile?.certificate_name || currentUser?.name || "Participant";
  const maxTeam = eventConfig.max_team_size;

  const confirmed = !!reg && reg.registration_status === "confirmed" && reg.payment_status === "success";
  const cancelled = reg?.registration_status === "cancelled";
  const paymentPending = !!reg && !cancelled && reg.payment_status === "pending";
  const paymentRejected = !!reg && !cancelled && reg.payment_status === "failed";

  const attendance = reg
    ? store.attendance.find((a) => a.registration_number === reg.registration_number && a.status === "checked_in")
    : undefined;
  const isCheckedIn = !!attendance;
  const checkedInAt = attendance ? (attendance.check_in_at ? fmtIST(attendance.check_in_at) : attendance.check_in_time) : "";

  const certificates = reg ? store.certificates.filter((c) => c.registration_id === reg.id && c.status === "issued") : [];
  const hasCertificate = certificates.length > 0;

  const team = currentProfile
    ? store.teams.find((t) => t.members.some((m) => m.participant_id === currentProfile.id)) ?? null
    : null;
  const submission = team ? store.submissions.find((s) => s.team_id === team.id) ?? null : null;

  // When the current payment attempt was submitted: latest pending payment row, else the registration itself.
  const pendingPayment = reg
    ? store.payments
        .filter((p) => p.registration_id === reg.id && p.status === "pending")
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
    : undefined;
  const submittedAt = fmtIST(pendingPayment?.created_at || reg?.created_at);

  const eventEnded = !!eventConfig.event_end_at && now >= new Date(eventConfig.event_end_at).getTime();

  // The one next step for this participant, following the real state
  let nextStep: { title: string; detail: string; href: string; cta: string };
  if (!reg) {
    nextStep = {
      title: "We could not find your registration",
      detail: "Your account has no registration on record. Contact the support desk and we will sort it out.",
      href: "/dashboard/support",
      cta: "Open Support Desk",
    };
  } else if (cancelled) {
    nextStep = {
      title: "Your registration was cancelled",
      detail: "Contact the support desk if you think this is a mistake.",
      href: "/dashboard/support",
      cta: "Open Support Desk",
    };
  } else if (paymentRejected) {
    nextStep = {
      title: "Resubmit your payment",
      detail: "Your payment could not be verified. Submit a new UTR and screenshot below.",
      href: "#resubmit",
      cta: "Resubmit Payment",
    };
  } else if (!confirmed) {
    nextStep = {
      title: "Payment under verification",
      detail: "An organiser is checking your UTR. Your ticket appears here as soon as it is approved.",
      href: "/dashboard/support",
      cta: "Contact Support Desk",
    };
  } else if (hasCertificate) {
    nextStep = {
      title: "Your certificate is ready",
      detail: "Download or print your verified certificate.",
      href: "/dashboard/certificate",
      cta: "View Certificate",
    };
  } else if (!team) {
    nextStep = {
      title: "Form your build team",
      detail: `Create a team or join one with an invite code. Teams of up to ${maxTeam} for the AI Build Challenge.`,
      href: "/dashboard/team",
      cta: "Manage My Team",
    };
  } else if (!submission || submission.status === "draft" || submission.status === "not_started") {
    nextStep = {
      title: submission ? "Finish your project submission" : "Submit your project",
      detail: "Add your GitHub repository, demo link and slides for jury evaluation.",
      href: "/dashboard/submission",
      cta: "Go to Project Submission",
    };
  } else {
    nextStep = {
      title: eventEnded ? "Certificates are on the way" : "Project submitted",
      detail: eventEnded
        ? "Certificates are issued by the organisers after the event. Check your eligibility."
        : "Your project is in. Certificates are issued after the event ends.",
      href: "/dashboard/certificate",
      cta: "Certificate Status",
    };
  }

  const paymentTag = confirmed
    ? { label: `Paid ₹${reg!.fee}`, cls: "tag-ok" }
    : cancelled
      ? { label: "Cancelled", cls: "tag-off" }
      : paymentRejected
        ? { label: "Payment rejected", cls: "tag-alert" }
        : paymentPending
          ? { label: "Under verification", cls: "tag-pending" }
          : reg
            ? { label: reg.payment_status, cls: "tag-off" }
            : { label: "Not registered", cls: "tag-off" };

  return (
    <div className="space-y-8">

      {/* Header plane */}
      <header className="frame bg-paper px-5 py-5 sm:px-6">
        <h1 className="page-title text-ink">Welcome, {name}</h1>
        <p className="text-sm text-ink-2 mt-2">
          Event: <strong className="text-ink">{eventConfig.name} – {eventConfig.subtitle}</strong>
        </p>
      </header>

      {/* Overview planes */}
      <section aria-label="Your status" className="planes grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 space-y-2">
          <span className="cell-label block">Ticket</span>
          <div className="flex flex-wrap gap-1.5">
            <span className={`tag ${paymentTag.cls}`}>{paymentTag.label}</span>
            {confirmed && (
              <span className={`tag ${isCheckedIn ? "tag-ok" : "tag-pending"}`}>
                {isCheckedIn ? "Checked In" : "Pending Check-in"}
              </span>
            )}
          </div>
          {reg && <p className="font-mono text-sm text-ink">{reg.registration_number}</p>}
        </div>

        <div className="p-5 space-y-2">
          <span className="cell-label block">Team</span>
          {team ? (
            <>
              <p className="font-bold text-ink">{team.name}</p>
              <p className="text-xs text-ink-2">{team.members.length} / {maxTeam} members</p>
            </>
          ) : (
            <>
              <span className="tag tag-pending">No team yet</span>
              <p className="text-xs text-ink-2">
                {confirmed ? `Up to ${maxTeam} members` : "Opens after payment verification"}
              </p>
            </>
          )}
        </div>

        <div className="p-5 space-y-2">
          <span className="cell-label block">Submission</span>
          <span className={`tag ${submissionTag(submission?.status)}`}>
            {(submission?.status || "not started").replace("_", " ")}
          </span>
          {submission && <p className="text-xs text-ink-2 truncate">{submission.project_name}</p>}
        </div>

        <div className="p-5 space-y-2">
          <span className="cell-label block">Certificate</span>
          <span className={`tag ${hasCertificate ? "tag-ok" : "tag-pending"}`}>
            {hasCertificate ? "Available" : "After the event"}
          </span>
          {hasCertificate && (
            <p className="font-mono text-xs text-ink-2">{certificates.map((c) => c.certificate_id).join(", ")}</p>
          )}
        </div>

        {nextStep.href.startsWith("#") ? (
          <a
            href={nextStep.href}
            className="plane-sky col-span-full p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            <div>
              <p className="font-semibold wide text-lg sm:text-xl">{nextStep.title}</p>
              <p className="text-sm mt-1">{nextStep.detail}</p>
            </div>
            <span className="inline-flex items-center gap-2 font-bold text-sm min-h-11 shrink-0">
              {nextStep.cta}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </a>
        ) : (
          <Link
            href={nextStep.href}
            className="plane-sky col-span-full p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            <div>
              <p className="font-semibold wide text-lg sm:text-xl">{nextStep.title}</p>
              <p className="text-sm mt-1">{nextStep.detail}</p>
            </div>
            <span className="inline-flex items-center gap-2 font-bold text-sm min-h-11 shrink-0">
              {nextStep.cta}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        )}
      </section>

      {/* Ticket / payment state + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <section className="lg:col-span-7 space-y-4" aria-labelledby="ticket-title">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="ticket-title" className="text-xl font-semibold wide text-ink">
              {confirmed ? "Your Official Digital Event Ticket" : "Registration & Payment"}
            </h2>
            {confirmed && <span className="text-sm text-ink-2">Present at {eventConfig.venue}</span>}
          </div>

          {confirmed && isCheckedIn && (
            <div role="status" className="plane-ok frame px-4 py-3 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span>
                Checked in at <strong>{checkedInAt}</strong>
                {attendance?.checked_in_by ? <> by {attendance.checked_in_by}</> : null}.
              </span>
            </div>
          )}

          {confirmed && currentTicket && currentProfile ? (
            <TicketCard
              registrationId={reg!.registration_number}
              qrToken={currentTicket.qr_token}
              fee={reg!.fee}
              name={name}
              rollNumber={currentProfile.roll_number}
              branch={currentProfile.branch}
              year={currentProfile.year}
              section={currentProfile.section}
              isteMember={currentProfile.iste_member}
              status={isCheckedIn ? "Checked In" : currentTicket.status === "cancelled" ? "Cancelled" : "Confirmed"}
            />
          ) : confirmed ? (
            <div className="frame bg-paper p-6 text-sm text-ink-2 space-y-2">
              <p className="font-semibold text-ink">Your payment is verified, but your ticket is not available yet.</p>
              <p>
                Refresh in a moment. If it still does not appear, contact the{" "}
                <Link href="/dashboard/support" className="font-bold text-ink underline decoration-2 underline-offset-4">support desk</Link>.
              </p>
            </div>
          ) : paymentPending && reg ? (
            <div className="frame bg-paper">
              <div className="plane-sun px-5 py-4 sm:px-6 flex items-center gap-2">
                <Clock className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <p className="font-semibold wide text-lg">Payment under verification</p>
              </div>
              <dl className="px-5 py-4 sm:px-6 divide-y divide-rule">
                <div className="py-2 grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-x-4">
                  <dt className="text-sm text-ink-3">UTR / UPI reference</dt>
                  <dd className="font-mono font-bold text-ink break-all">{reg.utr_number || "—"}</dd>
                </div>
                <div className="py-2 grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-x-4">
                  <dt className="text-sm text-ink-3">Submitted</dt>
                  <dd className="text-sm text-ink num">{submittedAt}</dd>
                </div>
                <div className="py-2 grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-x-4">
                  <dt className="text-sm text-ink-3">Amount</dt>
                  <dd className="text-sm text-ink num">₹{reg.fee}</dd>
                </div>
              </dl>
              <p className="rule-t px-5 py-4 sm:px-6 text-sm text-ink-2">
                Payments are usually verified within a few hours. Your ticket and QR code appear here once an organiser
                approves it. Something wrong? Contact the{" "}
                <Link href="/dashboard/support" className="font-bold text-ink underline decoration-2 underline-offset-4">support desk</Link>.
              </p>
              <div className="px-5 pb-5 sm:px-6">
                <PaymentHelp registrationNumber={reg.registration_number} utr={reg.utr_number} name={currentUser?.name} context="My payment is still under verification" />
              </div>
            </div>
          ) : paymentRejected && reg ? (
            <div className="frame bg-paper">
              <div className="plane-alert px-5 py-4 sm:px-6 space-y-1">
                <p className="font-semibold wide text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  Payment could not be verified
                </p>
                <p className="text-sm">
                  Reason: <strong>{reg.rejection_reason || "No reason was recorded."}</strong>
                </p>
                {reg.utr_number && (
                  <p className="text-sm">
                    Previous UTR: <span className="font-mono">{reg.utr_number}</span>
                  </p>
                )}
              </div>
              <ResubmitPaymentForm registration={reg} upiId={eventConfig.upi_id} />
              <div className="rule-t px-5 py-4 sm:px-6">
                <PaymentHelp registrationNumber={reg.registration_number} utr={reg.utr_number} name={currentUser?.name} context={`My payment was rejected (${reg.rejection_reason || "no reason given"})`} />
              </div>
            </div>
          ) : (
            <div className="frame bg-paper p-6 text-sm text-ink-2 space-y-2">
              <p className="font-semibold text-ink">
                {cancelled ? "This registration was cancelled." : "No active registration found for your account."}
              </p>
              <p>
                Contact the{" "}
                <Link href="/dashboard/support" className="font-bold text-ink underline decoration-2 underline-offset-4">support desk</Link>{" "}
                for help.
              </p>
            </div>
          )}
        </section>

        <section aria-label="Quick links" className="lg:col-span-5 planes grid-cols-1 print:hidden">
          <div className="p-5 space-y-2">
            <h3 className="font-semibold text-ink">Form Your Team (Up to {maxTeam} Members)</h3>
            <p className="text-xs text-ink-3">Build Challenge · 1:45 PM Kickoff</p>
            <p className="text-sm text-ink-2 leading-relaxed">
              Collaborate on the hands-on AI build challenge. Create or join a team with your unique team invite code.
            </p>
            <Link href="/dashboard/team" className="inline-flex items-center gap-2 min-h-11 text-sm font-bold text-ink underline decoration-2 underline-offset-4 hover:decoration-sun">
              <span>Manage My Team</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="p-5 space-y-2">
            <h3 className="font-semibold text-ink">Workshop Materials &amp; Presentations</h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              Slides, playbooks and starter code published by the organisers.
            </p>
            <Link href="/dashboard/resources" className="inline-flex items-center gap-2 min-h-11 text-sm font-bold text-ink underline decoration-2 underline-offset-4 hover:decoration-sun">
              <span>Browse All Resources</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="p-5 space-y-2">
            <h3 className="font-semibold text-ink">AI Challenge &amp; Build Submission</h3>
            <p className="text-sm text-ink-2 leading-relaxed">
              Form your team, build hands-on with Paytm API &amp; Microsoft frameworks, and submit your project GitHub repository and demo link.
            </p>
            <Link href="/dashboard/submission" className="inline-flex items-center gap-2 min-h-11 text-sm font-bold text-ink underline decoration-2 underline-offset-4 hover:decoration-sun">
              <span>Go to Project Submission</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
