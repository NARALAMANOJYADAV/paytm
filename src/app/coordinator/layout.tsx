"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  QrCode,
  Users,
  SearchCheck,
  HelpCircle,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { role, currentUser, logout, quickSwitchRole, permissions } = useAuth();

  const navItems = [
    { name: "Overview", href: "/coordinator", icon: LayoutDashboard },
    { name: "QR Check-in Scanner", href: "/coordinator/checkin", icon: QrCode },
    { name: "Participant Roster", href: "/coordinator/participants", icon: Users },
    { name: "Verify Registration", href: "/coordinator/verify", icon: SearchCheck },
    { name: "Support Desk", href: "/coordinator/support", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row border-t border-slate-900">
      
      {/* Coordinator Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/80 border-r border-slate-800 p-4 sm:p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-6">
          
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center font-bold text-purple-300 text-sm">
              KC
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase text-purple-400 block tracking-wider">
                Event Coordinator
              </span>
              <span className="font-bold text-white text-xs sm:text-sm truncate block">
                {currentUser?.name || "K. V. Chaitanya"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                ID: NBKR-COORD-104
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-slate-500"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80 space-y-3 mt-6">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Staff Duty</span>
            <span className="font-bold text-emerald-400">On Active Duty</span>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium border border-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {role !== "coordinator" && role !== "admin" && (
          <div className="mb-6 p-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>You are viewing the Coordinator Desk in demo mode.</span>
            </div>
            <button
              onClick={() => quickSwitchRole("coordinator")}
              className="px-2.5 py-1 rounded bg-purple-400 text-slate-950 font-bold text-[10px] hover:bg-purple-300"
            >
              Switch to Coordinator Role
            </button>
          </div>
        )}

        {children}
      </main>

    </div>
  );
}
