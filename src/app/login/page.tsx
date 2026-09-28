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
  CheckCircle2,
  Phone,
  ArrowLeft,
  X,
  Send,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { UserRole } from "@/lib/types";
import { resetPasswordByIdentifier } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<"phone" | "email">("phone");
  
  // Phone recovery state
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState("");
  const [enteredPhoneOtp, setEnteredPhoneOtp] = useState("");
  const [newPhonePassword, setNewPhonePassword] = useState("");
  const [confirmPhonePassword, setConfirmPhonePassword] = useState("");
  const [phoneRecoveryError, setPhoneRecoveryError] = useState("");
  const [phoneRecoverySuccess, setPhoneRecoverySuccess] = useState(false);

  // Email recovery state
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [emailLinkGenerated, setEmailLinkGenerated] = useState(false);
  const [generatedResetLink, setGeneratedResetLink] = useState("");
  const [copiedResetLink, setCopiedResetLink] = useState(false);
  const [newEmailPassword, setNewEmailPassword] = useState("");
  const [confirmEmailPassword, setConfirmEmailPassword] = useState("");
  const [emailRecoveryError, setEmailRecoveryError] = useState("");
  const [emailRecoverySuccess, setEmailRecoverySuccess] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError("");
    setSuccessMessage("");
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
    setSuccessMessage("");

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

  // PHONE RECOVERY: Step 1 - Send OTP Code
  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneRecoveryError("");

    const clean = recoveryPhone.replace(/\D/g, "");
    if (!clean || clean.length < 10) {
      setPhoneRecoveryError("Please enter a valid 10-digit registered mobile number.");
      return;
    }

    // Generate 6-digit OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPhoneOtp(mockOtp);
    setPhoneOtpSent(true);
  };

  // PHONE RECOVERY: Step 2 - Verify Code and Update Password
  const handleVerifyPhoneOtpAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneRecoveryError("");

    if (enteredPhoneOtp.trim() !== generatedPhoneOtp.trim()) {
      setPhoneRecoveryError("Invalid verification code. Please enter the 6-digit code shown above.");
      return;
    }

    if (!newPhonePassword || newPhonePassword.length < 6) {
      setPhoneRecoveryError("New password must be at least 6 characters.");
      return;
    }

    if (newPhonePassword !== confirmPhonePassword) {
      setPhoneRecoveryError("Passwords do not match.");
      return;
    }

    const res = resetPasswordByIdentifier(recoveryPhone, newPhonePassword);
    if (!res.success) {
      setPhoneRecoveryError(res.error || "Failed to update password for this phone number.");
      return;
    }

    setPhoneRecoverySuccess(true);
    setSuccessMessage(`Password updated successfully for ${res.user?.name || recoveryPhone}! You can now sign in.`);
    setIdentifier(res.user?.email || recoveryPhone);
    setPassword(newPhonePassword);

    setTimeout(() => {
      setShowForgotModal(false);
      resetModalState();
    }, 1500);
  };

  // EMAIL RECOVERY: Step 1 - Generate Reset Link
  const handleGenerateEmailLink = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailRecoveryError("");

    const clean = recoveryEmail.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      setEmailRecoveryError("Please enter a valid registered email address.");
      return;
    }

    const token = `p2p_${Math.random().toString(36).substring(2, 10)}`;
    const link = `https://p2p-workshop.nbkrist.org/login?reset_token=${token}&email=${encodeURIComponent(clean)}`;
    setGeneratedResetLink(link);
    setEmailLinkGenerated(true);
  };

  // EMAIL RECOVERY: Step 2 - Set New Password via Link
  const handleResetViaEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailRecoveryError("");

    if (!newEmailPassword || newEmailPassword.length < 6) {
      setEmailRecoveryError("New password must be at least 6 characters.");
      return;
    }

    if (newEmailPassword !== confirmEmailPassword) {
      setEmailRecoveryError("Passwords do not match.");
      return;
    }

    const res = resetPasswordByIdentifier(recoveryEmail, newEmailPassword);
    if (!res.success) {
      setEmailRecoveryError(res.error || "Failed to update password for this email address.");
      return;
    }

    setEmailRecoverySuccess(true);
    setSuccessMessage(`Password reset successfully for ${res.user?.name || recoveryEmail}! You can now sign in.`);
    setIdentifier(recoveryEmail);
    setPassword(newEmailPassword);

    setTimeout(() => {
      setShowForgotModal(false);
      resetModalState();
    }, 1500);
  };

  const resetModalState = () => {
    setPhoneOtpSent(false);
    setGeneratedPhoneOtp("");
    setEnteredPhoneOtp("");
    setNewPhonePassword("");
    setConfirmPhonePassword("");
    setPhoneRecoveryError("");
    setPhoneRecoverySuccess(false);

    setEmailLinkGenerated(false);
    setGeneratedResetLink("");
    setCopiedResetLink(false);
    setNewEmailPassword("");
    setConfirmEmailPassword("");
    setEmailRecoveryError("");
    setEmailRecoverySuccess(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        
        {/* Top Back to Landing Page Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Landing Page</span>
          </Link>
          <span className="text-[11px] text-slate-500 font-mono">P2P • NBKRIST</span>
        </div>

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

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
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
                    ? "COORDINATOR567"
                    : selectedRole === "admin"
                    ? "ADMIN345"
                    : "e.g. 23KB1A3064 or rahul@nbkrist.org"
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none placeholder:text-slate-600"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
            {selectedRole === "user" && (
              <p className="text-[10px] text-slate-400 mt-1">
                Enter the email address or college roll number entered during registration.
              </p>
            )}
          </div>

          {/* Password Input with Forgot Password Option */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              {selectedRole === "user" && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setPhoneRecoveryError("");
                    setEmailRecoveryError("");
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline transition-colors"
                >
                  Forgot Password?
                </button>
              )}
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

      {/* FORGOT PASSWORD MODAL: PHONE CODE & EMAIL RESET LINK */}
      {showForgotModal && (
        <div
          onClick={() => {
            setShowForgotModal(false);
            resetModalState();
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Reset Account Password</h3>
                  <p className="text-[11px] text-slate-400">Choose phone OTP or email reset link</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  resetModalState();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recovery Mode Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setRecoveryMethod("phone");
                  setPhoneRecoveryError("");
                  setEmailRecoveryError("");
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  recoveryMethod === "phone"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone Code (OTP)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecoveryMethod("email");
                  setPhoneRecoveryError("");
                  setEmailRecoveryError("");
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  recoveryMethod === "email"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Reset Link</span>
              </button>
            </div>

            {/* METHOD 1: PHONE NUMBER VERIFICATION CODE (OTP) */}
            {recoveryMethod === "phone" && (
              <div className="space-y-4">
                {phoneRecoveryError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{phoneRecoveryError}</span>
                  </div>
                )}

                {phoneRecoverySuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    <span>Password updated successfully! Logging you in...</span>
                  </div>
                )}

                {!phoneOtpSent ? (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Registered Mobile Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={recoveryPhone}
                          onChange={(e) => setRecoveryPhone(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none font-mono"
                        />
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        We will send a 6-digit verification code to your registered mobile number.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send 6-Digit Verification Code</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOtpAndReset} className="space-y-3.5">
                    {/* OTP Simulation Alert Box */}
                    <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                          SMS Verification Code
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">Sent to {recoveryPhone}</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                        <span className="text-xs text-slate-300">Your OTP Code:</span>
                        <span className="font-mono font-black text-lg text-cyan-300 tracking-widest">{generatedPhoneOtp}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Enter the code above and set your new password below.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Enter 6-Digit Code
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="e.g. 123456"
                        value={enteredPhoneOtp}
                        onChange={(e) => setEnteredPhoneOtp(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-center text-sm font-mono tracking-widest focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="At least 6 characters"
                        value={newPhonePassword}
                        onChange={(e) => setNewPhonePassword(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter new password"
                        value={confirmPhonePassword}
                        onChange={(e) => setConfirmPhonePassword(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPhoneOtpSent(false)}
                        className="px-3 py-2.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold"
                      >
                        Change Number
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                      >
                        Verify & Reset Password
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* METHOD 2: EMAIL RESET LINK */}
            {recoveryMethod === "email" && (
              <div className="space-y-4">
                {emailRecoveryError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{emailRecoveryError}</span>
                  </div>
                )}

                {emailRecoverySuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    <span>Password updated successfully! Logging you in...</span>
                  </div>
                )}

                {!emailLinkGenerated ? (
                  <form onSubmit={handleGenerateEmailLink} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="e.g. rahul@nbkrist.org"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                        />
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        We will generate an authenticated password reset link for this email.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Generate Password Reset Link</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetViaEmail} className="space-y-3.5">
                    {/* Email Link Simulation Box */}
                    <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                          Password Reset Link Ready
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">Dispatched to {recoveryEmail}</span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-300 break-all select-all flex items-center justify-between gap-2">
                        <span className="truncate">{generatedResetLink}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedResetLink);
                            setCopiedResetLink(true);
                            setTimeout(() => setCopiedResetLink(false), 2000);
                          }}
                          className="flex-shrink-0 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1"
                        >
                          {copiedResetLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedResetLink ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Set your new password directly below to complete the reset.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="At least 6 characters"
                        value={newEmailPassword}
                        onChange={(e) => setNewEmailPassword(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter new password"
                        value={confirmEmailPassword}
                        onChange={(e) => setConfirmEmailPassword(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEmailLinkGenerated(false)}
                        className="px-3 py-2.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold"
                      >
                        Change Email
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                      >
                        Set New Password
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
