"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  Menu, 
  X, 
  UserCheck, 
  ShieldCheck, 
  GraduationCap, 
  ChevronDown, 
  ArrowRight,
  QrCode,
  Layers,
  Trophy,
  CalendarCheck
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { UserRole } from "@/lib/types";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const { role, quickSwitchRole, isAuthenticated, currentUser, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Workshop", href: "/#about" },
    { name: "Speakers", href: "/#speakers" },
    { name: "Learn", href: "/#learn" },
    { name: "Schedule", href: "/#schedule" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "FAQ", href: "/#faq" },
    { name: "Verify Cert", href: "/verify/CERT-P2P-2026-081" },
  ];

  const getDashboardHref = () => {
    if (role === "admin") return "/admin";
    if (role === "coordinator") return "/coordinator";
    return "/dashboard";
  };

  const getRoleBadge = (r: UserRole) => {
    if (r === "admin") return { label: "Admin View", icon: ShieldCheck, color: "bg-red-500/20 text-red-300 border-red-500/40" };
    if (r === "coordinator") return { label: "Coordinator View", icon: QrCode, color: "bg-purple-500/20 text-purple-300 border-purple-500/40" };
    return { label: "Participant View", icon: GraduationCap, color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" };
  };

  const activeRoleInfo = getRoleBadge(role);
  const ActiveIcon = activeRoleInfo.icon;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-sm sm:text-base tracking-tighter">
                P2P
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                PROMPT TO PRODUCTION
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Paytm AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block truncate max-w-[280px]">
              NBKRIST IT & AI&DS • In association with ISTE
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-lg transition-all ${
                pathname === link.href
                  ? "text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Action / Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${activeRoleInfo.color}`}
              title="Switch demo role simulation"
            >
              <ActiveIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{activeRoleInfo.label}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {roleDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setRoleDropdownOpen(false)}
              >
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Switch Demo Persona
                </div>

                <button
                  onClick={() => quickSwitchRole("user")}
                  className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 mt-1 rounded-lg text-xs transition-colors ${
                    role === "user" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-medium">Participant (Manoj)</div>
                    <div className="text-[10px] text-slate-400">4th Year AI&DS • Ticket Active</div>
                  </div>
                </button>

                <button
                  onClick={() => quickSwitchRole("coordinator")}
                  className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                    role === "coordinator" ? "bg-purple-500/20 text-purple-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-medium">Coordinator (Chaitanya)</div>
                    <div className="text-[10px] text-slate-400">QR Scanner • Attendance Access</div>
                  </div>
                </button>

                <button
                  onClick={() => quickSwitchRole("admin")}
                  className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                    role === "admin" ? "bg-red-500/20 text-red-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <div>
                    <div className="font-medium">Admin (Head/Faculty)</div>
                    <div className="text-[10px] text-slate-400">Full Access • Settings & Judging</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Direct CTA */}
          <Link
            href={getDashboardHref()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/25 transition-all active:scale-95"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-900"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-md shadow-cyan-500/20"
            >
              Register Now (ISTE ₹50 / Non-ISTE ₹100)
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-medium text-xs"
            >
              Account Login / Setup
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
