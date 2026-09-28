"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  QrCode,
  GraduationCap,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { UserRole } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError("");
    if (role === "coordinator") {
      setIdentifier("COORDINATOR567");
      setPassword("");
    } else if (role === "admin") {
      setIdentifier("ADMIN345");
      setPassword("");
    } else {
      setIdentifier("");
      setPassword("");
    }
  };

  const handleFillCredentials = (role: "coordinator" | "admin") => {
    if (role === "coordinator") {
      setSelectedRole("coordinator");
      setIdentifier("COORDINATOR567");
      setPassword("coordinator@890");
      setError("");
    } else if (role === "admin") {
      setSelectedRole("admin");
      setIdentifier("ADMIN345");
      setPassword("admin@678");
      setError("");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError(
        selectedRole === "coordinator"
          ? "Please enter your Coordinator ID"
          : selectedRole === "admin"
          ? "Please enter your Admin ID"
          : "Please enter your registered Email or Roll Number"
      );
      return;
    }

    if (!password.trim()) {
      setError("Please enter your account password");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(identifier, password, selectedRole);
      setIsLoading(false);

      if (res.success) {
        if (res.role === "admin") {
          router.push("/admin");
        } else if (res.role === "coordinator") {
          router.push("/coordinator");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(res.error || "Login failed. Please check your credentials.");
      }
    }, 300);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        
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
            Sign in to access your digital ticket, workshop dashboard, or staff controls.
          </p>
        </div>

        {/* Credentials Form */}
        <form
          onSubmit={handleLogin}
          className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
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
                onClick={() => handleRoleChange("user")}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === "user"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Participant</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("coordinator")}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === "coordinator"
                    ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Coordinator</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("admin")}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === "admin"
                    ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Identifier Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              {selectedRole === "coordinator"
                ? "Coordinator ID"
                : selectedRole === "admin"
                ? "Admin ID"
                : "Registered Email or Roll Number"}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={
                  selectedRole === "coordinator"
                    ? "e.g. COORDINATOR567"
                    : selectedRole === "admin"
                    ? "e.g. ADMIN345"
                    : "e.g. student@nbkrist.org or 23B91A1242"
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none placeholder:text-slate-600 font-medium"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
            {selectedRole === "user" && (
              <p className="text-[10px] text-slate-400 mt-1">
                Enter the email address or college roll number entered during registration.
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none placeholder:text-slate-600"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
            {selectedRole === "user" ? (
              <p className="text-[10px] text-slate-400 mt-1">
                Enter the account password created when completing your workshop registration.
              </p>
            ) : null}
          </div>

          {/* Staff Credentials Helper Card */}
          {selectedRole === "coordinator" && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 text-[11px] uppercase tracking-wider">
                  Coordinator Credentials
                </span>
                <button
                  type="button"
                  onClick={() => handleFillCredentials("coordinator")}
                  className="text-[10px] text-purple-400 underline hover:text-purple-300 font-bold"
                >
                  Auto-fill
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-300 flex flex-col gap-0.5">
                <div>ID: <strong className="text-white">COORDINATOR567</strong></div>
                <div>PASS: <strong className="text-white">coordinator@890</strong></div>
              </div>
            </div>
          )}

          {selectedRole === "admin" && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-300 text-[11px] uppercase tracking-wider">
                  Admin Credentials
                </span>
                <button
                  type="button"
                  onClick={() => handleFillCredentials("admin")}
                  className="text-[10px] text-red-400 underline hover:text-red-300 font-bold"
                >
                  Auto-fill
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-300 flex flex-col gap-0.5">
                <div>ID: <strong className="text-white">ADMIN345</strong></div>
                <div>PASS: <strong className="text-white">admin@678</strong></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <span>AUTHENTICATING...</span>
            ) : (
              <>
                <span>SIGN IN TO PORTAL</span>
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
