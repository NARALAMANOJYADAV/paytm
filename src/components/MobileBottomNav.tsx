"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Ticket, User, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { role, isAuthenticated } = useAuth();

  // Hide sticky bottom bar on dedicated checkout / form flows so it never covers buttons
  if (pathname.startsWith("/register") || pathname.startsWith("/login") || pathname.startsWith("/coordinator/checkin")) {
    return null;
  }

  const getDashboardLink = () => {
    if (role === "admin") return "/admin";
    if (role === "coordinator") return "/coordinator";
    return "/dashboard";
  };

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      name: "Schedule",
      href: "/#schedule",
      icon: Calendar,
      isActive: pathname === "/#schedule",
    },
    {
      name: "Register",
      href: "/register",
      icon: Sparkles,
      highlight: true,
      isActive: pathname === "/register",
    },
    {
      name: "My Pass",
      href: getDashboardLink(),
      icon: Ticket,
      isActive: pathname.startsWith("/dashboard") || pathname.startsWith("/coordinator") || pathname.startsWith("/admin"),
    },
    {
      name: "Account",
      href: isAuthenticated ? getDashboardLink() : "/login",
      icon: User,
      isActive: pathname === "/login",
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 px-3 py-2 shadow-[0_-10px_25px_rgba(0,0,0,0.6)]">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25 active:scale-95 transition-transform"
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="text-[11px] font-black uppercase tracking-tight">
                  Register
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
                item.isActive
                  ? "text-cyan-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${item.isActive ? "text-cyan-400" : "text-slate-400"}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
