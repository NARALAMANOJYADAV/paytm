"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ticket,
  User,
  Calendar,
  BookOpen,
  Users,
  Send,
  Award,
  HelpCircle,
  Sparkles,
  LogOut,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { role, currentProfile, currentUser, logout, quickSwitchRole } = useAuth();

  const navItems = [
    { name: "Overview & Ticket", href: "/dashboard", icon: Ticket },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
    { name: "Event Schedule", href: "/dashboard/schedule", icon: Calendar },
    { name: "Resources", href: "/dashboard/resources", icon: BookOpen },
    { name: "My Team", href: "/dashboard/team", icon: Users },
    { name: "Project Submission", href: "/dashboard/submission", icon: Send },
    { name: "Certificate", href: "/dashboard/certificate", icon: Award },
    { name: "Support Desk", href: "/dashboard/support", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row border-t border-slate-900">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800 p-4 sm:p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-6">
          
          {/* User profile cardlet */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 text-sm">
              {currentProfile?.certificate_name?.[0] || currentUser?.name?.[0] || "M"}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase text-cyan-400 block tracking-wider">
                Participant
              </span>
              <span className="font-bold text-white text-xs sm:text-sm truncate block">
                {currentProfile?.certificate_name || currentUser?.name || "Manoj N"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {currentProfile?.roll_number || "22011A3142"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
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
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom logout / status */}
        <div className="pt-6 border-t border-slate-800/80 space-y-3 mt-6">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Event Date</span>
            <span className="font-bold text-slate-300">30 Sep 2026</span>
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
        {/* Role Notice if someone is exploring with different role */}
        {role !== "user" && (
          <div className="mb-6 p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>You are viewing the Participant Portal in <strong>{role.toUpperCase()}</strong> mode.</span>
            </div>
            <button
              onClick={() => quickSwitchRole("user")}
              className="px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-bold text-[10px] hover:bg-amber-300"
            >
              Switch to Student View
            </button>
          </div>
        )}

        {children}
      </main>

    </div>
  );
}
