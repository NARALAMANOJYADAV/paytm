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
  CalendarCheck,
  LogOut
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
    { name: "FAQ", href: "/#faq" },
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

        {/* Right Action / Authentication Buttons */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${activeRoleInfo.color}`}>
                <ActiveIcon className="w-3.5 h-3.5" />
                <span>{currentUser?.name || activeRoleInfo.label}</span>
              </div>
              <Link
                href={getDashboardHref()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 transition-all active:scale-95"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 transition-all active:scale-95"
              >
                <span>Register (₹50/₹100)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800 focus:outline-none flex items-center gap-1.5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/98 border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto">
          {isAuthenticated ? (
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-xs">
                    {currentUser?.name?.[0] || "U"}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs truncate max-w-[150px]">{currentUser?.name || "Participant"}</div>
                    <div className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider">{role}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30"
                >
                  Sign Out
                </button>
              </div>

              <Link
                href={getDashboardHref()}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs text-center shadow-md shadow-cyan-500/20"
              >
                Open Dashboard →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs text-center"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs text-center shadow-md shadow-cyan-500/20"
              >
                Register (₹50/₹100)
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-900 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
