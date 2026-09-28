"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  CreditCard,
  UserCheck,
  Shield,
  Layers,
  Send,
  Award,
  Megaphone,
  HelpCircle,
  Settings,
  LogOut,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { role, currentUser, logout, quickSwitchRole } = useAuth();

  const navItems = [
    { name: "Executive Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Event Management", href: "/admin/event", icon: Calendar },
    { name: "Participants", href: "/admin/participants", icon: Users },
    { name: "Payments & Orders", href: "/admin/payments", icon: CreditCard },
    { name: "Gate Attendance", href: "/admin/attendance", icon: UserCheck },
    { name: "Coordinators & Roles", href: "/admin/coordinators", icon: Shield },
    { name: "Teams & Roster", href: "/admin/teams", icon: Layers },
    { name: "Judging & Submissions", href: "/admin/submissions", icon: Send },
    { name: "Certificates", href: "/admin/certificates", icon: Award },
    { name: "Event Resources", href: "/admin/resources", icon: BookOpen },
    { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { name: "Support Desk", href: "/admin/support", icon: HelpCircle },
    { name: "Platform Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row border-t border-slate-900">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800 p-4 sm:p-5 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-5">
          
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-red-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center font-bold text-red-300 text-sm">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase text-red-400 block tracking-wider">
                Lead Administrator
              </span>
              <span className="font-bold text-white text-xs truncate block">
                {currentUser?.name || "Dr. S. K. Rao"}
              </span>
              <span className="text-[9px] text-slate-400 block">
                Full Root Privileges
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? "text-red-400" : "text-slate-500"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80 space-y-2 mt-6">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Environment</span>
            <span className="font-mono text-cyan-400 font-bold">Production-Ready</span>
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
        {role !== "admin" && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>You are viewing the Administrator Console in demo mode.</span>
            </div>
            <button
              onClick={() => quickSwitchRole("admin")}
              className="px-2.5 py-1 rounded bg-red-400 text-slate-950 font-bold text-[10px] hover:bg-red-300"
            >
              Switch to Admin Role
            </button>
          </div>
        )}

        {children}
      </main>

    </div>
  );
}
