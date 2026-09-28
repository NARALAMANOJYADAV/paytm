import React from "react";
import Link from "next/link";
import { MapPin, Calendar, Clock, Mail, Phone, ExternalLink, Shield, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md shadow-cyan-500/20">
                P2P
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                Prompt to Production
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Paytm AI Workshop bridging cutting-edge Generative AI research and production software engineering, organized by the Department of IT & AI&DS, NBKRIST in association with ISTE.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-cyan-400">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Certified Hands-on AI Workshop</span>
            </div>
          </div>

          {/* Col 2: Venue & Schedule */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
              Event Details
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Wednesday, 30 September 2026</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>9:00 AM – 4:00 PM IST</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Seminar Hall, New CSE Block, NBKRIST Campus, Vidyanagar - 524413, Andhra Pradesh</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="hover:text-cyan-400 transition-colors">
                  Registration Portal
                </Link>
              </li>
              <li>
                <Link href="/#schedule" className="hover:text-cyan-400 transition-colors">
                  Workshop Schedule & Agenda
                </Link>
              </li>
              <li>
                <Link href="/#speakers" className="hover:text-cyan-400 transition-colors">
                  Paytm & Microsoft Keynotes
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-cyan-400 transition-colors">
                  Live Build Challenge Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/verify/CERT-P2P-2026-081" className="hover:text-cyan-400 transition-colors">
                  Certificate Authenticity Verification
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-cyan-400 transition-colors">
                  Participant & Staff Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Institution & Contact */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
              Organizing Body
            </h4>
            <p className="text-xs text-slate-300 font-medium">
              N.B.K.R. Institute of Science & Technology
            </p>
            <p className="text-[11px] text-slate-400">
              Autonomous Institute Affiliated to JNTUA • Accredited by NAAC with 'A' Grade • NBA Accredited
            </p>
            <div className="pt-2 text-xs space-y-1.5 text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>it_aids@nbkrist.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>+91 8624 228247 / 228257</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 Department of IT & AI&DS, NBKRIST. In association with ISTE Student Chapter.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              All Systems Operational
            </span>
            <span className="text-slate-400">•</span>
            <span>Industry Partner: Paytm</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
