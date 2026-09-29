"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";

const fmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", year: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
      }) + " IST"
    : "to be announced";

interface Section {
  id: string;
  title: string;
  rules: React.ReactNode[];
}

export default function RulesPage() {
  const { eventConfig: c } = useStore();

  const sections: Section[] = [
    {
      id: "registration",
      title: "Registration",
      rules: [
        <>Each student may register <strong>once</strong>. An email address and a roll number can each be used for only one registration.</>,
        <>Registration is open while seats remain and the organisers keep it open. Seats are limited to <strong>{c.capacity}</strong>, and a registration awaiting payment verification holds a seat.</>,
        <>Enter your name exactly as it should appear on your certificate. Roll number, email, branch, year and section can be changed only through the Support Desk.</>,
        <>Your account password is set during registration. Password resets are sent only to the registered email address.</>,
      ],
    },
    {
      id: "payment",
      title: "Fees and payment verification",
      rules: [
        <>The fee is <strong>₹{c.iste_fee}</strong> for ISTE student members with a valid membership number, and <strong>₹{c.non_iste_fee}</strong> for everyone else.</>,
        <>Pay by UPI to the official UPI ID shown on the registration page, then submit the <strong>12-digit UTR</strong> (transaction reference) and a <strong>screenshot</strong> of the payment (PNG, JPG, WEBP or PDF, up to 5 MB).</>,
        <>Each UTR can be used for <strong>one registration only</strong>. Reused or shared UTRs are rejected automatically.</>,
        <>Your registration stays <em>pending</em> until an organiser checks the UTR and screenshot. <strong>No ticket is issued until the payment is verified.</strong></>,
        <>If a payment is rejected, the reason is shown on your dashboard and you may resubmit a new UTR and screenshot while seats remain. A rejected registration does not hold a seat.</>,
      ],
    },
    {
      id: "entry",
      title: "Ticket and entry",
      rules: [
        <>After verification your QR ticket appears on your dashboard. Bring it on your phone or printed, along with your college ID card.</>,
        <>Each ticket admits its holder <strong>once</strong>. A second scan shows the time of the first check-in and is not admitted again.</>,
        <>Tickets are personal and carry a security token. Screenshots of someone else&apos;s ticket, edited codes or unverified registrations are refused at the gate.</>,
        <>Your attendance is recorded only when a coordinator scans your ticket at the Seminar Hall entrance. Attendance is required for a certificate.</>,
      ],
    },
    {
      id: "teams",
      title: "Build Challenge teams",
      rules: [
        <>Only participants whose payment is verified can create or join a team.</>,
        <>A team has <strong>1 to {c.max_team_size} members</strong>. Each participant can be in <strong>only one team</strong>.</>,
        <>The creator becomes team leader and receives an invite code to share. Members join with that code.</>,
        <>A member may leave before the team submits. The leader can leave only after every other member has left, which dissolves the team.</>,
        <>Once the team submits its project, the roster is <strong>locked</strong>: nobody can join or leave.</>,
      ],
    },
    {
      id: "submission",
      title: "Project submission",
      rules: [
        <>Each team makes <strong>one submission</strong>. Any member can save drafts; drafts are not judged.</>,
        <>A final submission needs a project name, the problem statement, a description and at least a <strong>GitHub repository or live demo link</strong>.</>,
        <>The submission deadline is <strong>{fmt(c.submission_deadline_at)}</strong>. After it, submissions cannot be created or edited.</>,
        <>Once a submission is evaluated it is locked, and the scores and feedback appear on the team&apos;s dashboard.</>,
      ],
    },
    {
      id: "judging",
      title: "Judging",
      rules: [
        <>Submitted projects are scored out of <strong>100</strong>: Innovation (25), AI &amp; prompt engineering (25), Technical execution (25) and Presentation (25).</>,
        <>Teams are ranked by total score. A tie is broken in favour of the team that submitted first.</>,
        <>The live leaderboard shows project names and scores only; repository and demo links are not published.</>,
      ],
    },
    {
      id: "certificates",
      title: "Certificates",
      rules: [
        <>A <strong>Certificate of Participation</strong> is issued only when all three conditions are met: your payment was verified, you were checked in at the venue, and the event has ended ({fmt(c.event_end_at)}).</>,
        <>Registered participants who did not attend, or whose payment was not verified, <strong>do not receive a certificate</strong>.</>,
        <>A <strong>Certificate of Merit</strong> goes to every member of the 1st-place (Winner) and 2nd-place (Runner-up) teams, in addition to their participation certificate.</>,
        <>Each certificate has a unique ID and can be verified by anyone on the public verification page. Certificates found to be issued in error may be revoked, and verification will then show them as revoked.</>,
      ],
    },
    {
      id: "support",
      title: "Support and decisions",
      rules: [
        <>Raise questions and corrections through the <strong>Support Desk</strong> on your dashboard; replies appear there.</>,
        <>Decisions of the organising committee (Department of IT &amp; AI&amp;DS, NBKRIST, with ISTE) on verification, entry, judging and certificates are final.</>,
      ],
    },
  ];

  return (
    <div className="px-4 sm:px-6 py-10 sm:py-16">
      <div className="max-w-[1100px] mx-auto grid lg:grid-cols-[220px_minmax(0,1fr)] gap-10 lg:gap-16">
        <aside className="hidden lg:block">
          <nav aria-label="Rules sections" className="sticky top-28 space-y-1">
            <p className="cell-label mb-3">On this page</p>
            {sections.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className="flex gap-3 py-1.5 text-sm text-ink-3 hover:text-ink transition-colors">
                <span className="num w-5 text-ink-3">{i + 1}</span>
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="min-w-0">
          <header className="mb-10 sm:mb-14 max-w-[62ch]">
            <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-semibold tracking-[-0.04em] leading-[1.02]">
              Event rules
            </h1>
            <p className="mt-4 text-ink-2 text-base sm:text-lg leading-relaxed">
              How registration, entry, the Build Challenge and certificates work for {c.name} – {c.subtitle}. These rules are
              enforced by the event platform itself.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-ink-3">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              {c.date_formatted} · {c.venue}, NBKRIST
            </p>
          </header>

          <div className="space-y-12 sm:space-y-16">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="flex items-baseline gap-3 text-xl sm:text-2xl font-semibold tracking-[-0.025em]">
                  <span className="num text-ink-3 text-base">{i + 1}.</span>
                  {s.title}
                </h2>
                <ol className="mt-5 frame bg-paper divide-y divide-rule">
                  {s.rules.map((r, j) => (
                    <li key={j} className="flex gap-4 px-5 sm:px-6 py-4 text-[0.9375rem] leading-relaxed text-ink-2 [&_strong]:text-ink [&_strong]:font-semibold">
                      <span className="num shrink-0 w-8 text-ink-3 text-sm pt-0.5">{i + 1}.{j + 1}</span>
                      <span className="max-w-[68ch]">{r}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>

          <div className="mt-14 frame bg-paper p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-ink-2">By registering you agree to these rules.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="btn btn-primary">Register</Link>
              <Link href="/#faq" className="btn">Read the FAQ</Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
