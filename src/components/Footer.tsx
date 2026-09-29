import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Heart } from "lucide-react";
import { LogoGlyph } from "@/components/Logo";

const linkCls =
  "group inline-flex min-h-9 w-fit items-center gap-1 text-[#f4f3ef] underline decoration-[#f4f3ef]/25 underline-offset-[5px] hover:decoration-[#f2b544] transition-colors";
const arrowCls =
  "w-3.5 h-3.5 text-[#f2b544] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5";
const infoLabel = "font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[#8c8b85] mb-0.5";

const colHead = "text-[#f4f3ef] text-[0.9375rem] mb-2 sm:mb-5 lg:mb-10";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a18] text-[#f4f3ef] print:hidden">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-8 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-14 lg:gap-8">
          {/* Statement */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-8">
            <h2 className="text-[clamp(2rem,5vw,4.25rem)] font-semibold tracking-[-0.045em] leading-[0.98]">
              From prompts.
              <br />
              To production.
            </h2>
            <p className="text-[#b3b2ab] text-[0.9375rem] sm:text-base leading-relaxed max-w-[44ch]">
              A one-day, hands-on Generative AI workshop and build challenge, conducted by{" "}
              <span className="text-[#f4f3ef]">Paytm</span> for the Department of IT &amp; AI&amp;DS, NBKRIST, in
              association with ISTE.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 min-h-12 px-6 rounded-full bg-[#f4f3ef] text-[#111113] font-medium hover:bg-white transition-colors"
              >
                Register now <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/verify"
                className="inline-flex min-h-12 items-center border-b border-[#f4f3ef]/60 hover:border-[#f4f3ef] transition-colors"
              >
                Verify a certificate
              </Link>
            </div>
          </div>

          {/* Columns: info is a labelled list (quiet), links are bright with an arrow */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8 sm:gap-y-12">
            <div>
              <h3 className={colHead}>Event</h3>
              <dl className="space-y-3 text-sm sm:text-[0.9375rem]">
                {[
                  ["Date", "Wed, 30 Sep 2026"],
                  ["Time", "9:00 AM – 4:00 PM IST"],
                  ["Venue", "Seminar Hall-1, New CSE Block"],
                  ["Day 2", "Thu, 1 Oct · 10:00 AM (Winners Announcement)"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className={infoLabel}>{k}</dt>
                    <dd className="text-[#dcdbd5] num">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className={colHead}>Explore</h3>
              <ul className="space-y-0.5 text-sm sm:text-[0.9375rem]">
                {[
                  ["Speakers", "/#speakers"],
                  ["Schedule", "/#schedule"],
                  ["Leaderboard", "/leaderboard"],
                  ["FAQ", "/#faq"],
                  ["Event rules", "/rules"],
                  ["Sign in", "/login"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className={linkCls}>
                      {label}
                      <ArrowUpRight className={arrowCls} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className={colHead}>Organisers</h3>
              <dl className="space-y-3 text-sm sm:text-[0.9375rem]">
                <div>
                  <dt className={infoLabel}>Organised by</dt>
                  <dd className="text-[#dcdbd5]">Dept. of IT &amp; AI&amp;DS, NBKRIST</dd>
                </div>
                <div>
                  <dt className={infoLabel}>In association with</dt>
                  <dd className="text-[#dcdbd5]">ISTE Student Chapter</dd>
                </div>
                <div>
                  <dt className={infoLabel}>Conducted by</dt>
                  <dd className="text-[#dcdbd5] inline-flex items-center">
                    Paytm <Heart className="w-3.5 h-3.5 mx-1.5 fill-[#e5484d] text-[#e5484d]" aria-hidden="true" /> AI
                  </dd>
                </div>
                <div>
                  <dt className={infoLabel}>Contact</dt>
                  <dd className="flex flex-col">
                    <a href="mailto:23kb1a3037@nbkrist.org" className={linkCls}>
                      23kb1a3037@nbkrist.org
                      <ArrowUpRight className={arrowCls} aria-hidden="true" />
                    </a>
                    <a href="tel:+919491803089" className={`${linkCls} num`}>
                      +91 94918 03089
                      <ArrowUpRight className={arrowCls} aria-hidden="true" />
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-8 sm:mt-16 lg:mt-24 flex flex-col sm:flex-row sm:items-end justify-between gap-1 sm:gap-2 text-xs sm:text-sm text-[#b3b2ab]">
          <p>Vidyanagar, S.P.S.R. Nellore Dist, Andhra Pradesh 524413</p>
          <p>© 2026 Dept. of IT &amp; AI&amp;DS, NBKRIST</p>
        </div>
      </div>

      {/* Giant wordmark */}
      <div className="@container max-w-[1400px] mx-auto px-5 sm:px-8 mt-8 sm:mt-10 overflow-hidden" aria-hidden="true">
        <div className="select-none text-[#f4f3ef] translate-y-[10%]">
          <div className="flex items-end gap-[2cqi]">
            <LogoGlyph className="w-[8cqi] shrink-0 mb-[1.5cqi]" />
            <p className="font-semibold tracking-[-0.06em] leading-[0.82] whitespace-nowrap text-[9.7cqi]">
              Prompt to Production
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
