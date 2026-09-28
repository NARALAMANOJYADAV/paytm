"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  GraduationCap,
  QrCode,
  ShieldCheck,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { UserRole } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { login, quickSwitchRole } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(email, selectedRole);
      setIsLoading(false);
      
      if (selectedRole === "admin") router.push("/admin");
      else if (selectedRole === "coordinator") router.push("/coordinator");
      else router.push("/dashboard");
    }, 400);
  };

  const handleQuickLogin = (role: UserRole) => {
    quickSwitchRole(role);
    if (role === "admin") router.push("/admin");
    else if (role === "coordinator") router.push("/coordinator");
    else router.push("/dashboard");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Secure Role-Based Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Account Access
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to access your digital ticket, coordinator scanner, or admin controls.
          </p>
        </div>

        {/* 1-Click Quick Demo Switcher Card */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-cyan-500/30 p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Demo Login
            </span>
            <span className="text-[10px] text-slate-400">Instant Access</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("user")}
              className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-center transition-all group"
            >
              <GraduationCap className="w-5 h-5 text-cyan-400 mx-auto group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-white block mt-1">Student</span>
              <span className="text-[9px] text-slate-400 block truncate">Manoj</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("coordinator")}
              className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-center transition-all group"
            >
              <QrCode className="w-5 h-5 text-purple-400 mx-auto group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-white block mt-1">Coordinator</span>
              <span className="text-[9px] text-slate-400 block truncate">Chaitanya</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("admin")}
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-center transition-all group"
            >
              <ShieldCheck className="w-5 h-5 text-red-400 mx-auto group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-white block mt-1">Admin</span>
              <span className="text-[9px] text-slate-400 block truncate">Dr. Rao</span>
            </button>
          </div>
        </div>

        {/* Standard Credentials Form */}
        <form
          onSubmit={handleLogin}
          className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl"
        >
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector tabs */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Login As
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRole("user")}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedRole === "user"
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Participant
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("coordinator")}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedRole === "coordinator"
                    ? "bg-purple-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Coordinator
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("admin")}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedRole === "admin"
                    ? "bg-red-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder={
                  selectedRole === "admin"
                    ? "admin@nbkrist.org"
                    : selectedRole === "coordinator"
                    ? "coordinator@nbkrist.org"
                    : "student@nbkrist.org"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <Link href="#" className="text-[11px] text-cyan-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <span>AUTHENTICATING...</span>
            ) : (
              <>
                <span>SIGN IN TO DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
            Haven't registered for the workshop yet?{" "}
            <Link href="/register" className="text-cyan-400 font-bold hover:underline">
              Register Here
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}
