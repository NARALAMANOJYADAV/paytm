"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight, KeyRound, AlertCircle, CheckCircle2, ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import type { UserRole } from "@/lib/types";
import { useStore } from "@/lib/store";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

const HOME_BY_ROLE: Record<UserRole, string> = {
  user: "/dashboard",
  coordinator: "/coordinator",
  admin: "/admin",
};

/** Only allow same-site relative paths for ?next= (no protocol-relative or absolute URLs). */
function safeNext(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] bg-field" aria-busy="true" />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, sendPasswordReset } = useAuth();
  const { eventConfig } = useStore();

  const isResetReturn = searchParams.get("reset") === "1";
  const nextPath = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Inline "forgot password" flow
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // ?reset=1 return: "Set a new password"
  const [recoveryReady, setRecoveryReady] = useState<boolean | null>(isResetReturn ? null : false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    if (!isResetReturn) return;
    const sb = supabaseBrowser();
    let cancelled = false;
    // The recovery link signs the user in (session parsed from the URL); wait for it.
    sb.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) setRecoveryReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        setRecoveryReady(true);
      }
    });
    // If no session shows up, the link was invalid or expired.
    const timer = window.setTimeout(() => {
      if (!cancelled) setRecoveryReady((r) => (r === null ? false : r));
    }, 4000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, [isResetReturn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!password) {
      setError("Please enter your account password");
      return;
    }
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success && res.role) {
        router.push(nextPath ?? HOME_BY_ROLE[res.role]);
        return;
      }
      setError(res.error || "Login failed. Please check your credentials.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    const clean = forgotEmail.trim();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setForgotError("Please enter a valid email address.");
      return;
    }
    setForgotBusy(true);
    try {
      const res = await sendPasswordReset(clean);
      if (res.success) setForgotSent(true);
      else setForgotError(res.error || "Could not send the reset link. Try again.");
    } finally {
      setForgotBusy(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    if (newPassword.length < 8) {
      setResetError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetBusy(true);
    try {
      const { error: upErr } = await supabaseBrowser().auth.updateUser({ password: newPassword });
      if (upErr) {
        setResetError(upErr.message);
        return;
      }
      // Sign out of the recovery session so the user signs in with the new password.
      await supabaseBrowser().auth.signOut();
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage("Password updated. Sign in with your new password.");
      router.replace("/login");
    } finally {
      setResetBusy(false);
    }
  };

  const showResetForm = isResetReturn;

  return (
    <div className="min-h-[85vh] bg-field px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        {/* Top Back to Landing Page Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-2 transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Landing Page</span>
          </Link>
          <span className="font-mono text-xs text-ink-3">P2P / NBKRIST</span>
        </div>

        <div className="planes grid-cols-1 lg:grid-cols-[5fr_7fr]">
          {showResetForm ? (
            /* RIGHT: set a new password after returning from the email link */
            <form
              onSubmit={handleSetNewPassword}
              className="order-1 space-y-5 p-5 sm:p-8 lg:order-2"
              aria-describedby={resetError ? "reset-error" : undefined}
            >
              <div className="space-y-2">
                <h1 className="page-title">Set a new password</h1>
                <p className="text-sm text-ink-2">Choose a new password for your account.</p>
              </div>

              {recoveryReady === null && (
                <p role="status" aria-busy="true" className="text-sm text-ink-2">
                  Checking your reset link...
                </p>
              )}

              {recoveryReady === false && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 border border-alert bg-alert-soft p-3.5 text-sm font-semibold text-alert"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    This reset link is invalid or has expired.{" "}
                    <Link href="/login" className="underline underline-offset-4">
                      Request a new one
                    </Link>
                    .
                  </span>
                </div>
              )}

              {resetError && (
                <div
                  id="reset-error"
                  role="alert"
                  className="flex items-start gap-2.5 border border-alert bg-alert-soft p-3.5 text-sm font-semibold text-alert"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {recoveryReady && (
                <>
                  <div>
                    <label htmlFor="new-password" className="field-label">
                      New Password
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      aria-invalid={resetError.startsWith("New password") ? "true" : undefined}
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-new-password" className="field-label">
                      Confirm New Password
                    </label>
                    <input
                      id="confirm-new-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      aria-invalid={resetError === "Passwords do not match." ? "true" : undefined}
                      className="field"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetBusy}
                    aria-busy={resetBusy}
                    className="btn btn-primary btn-lg w-full"
                  >
                    {resetBusy ? "Saving..." : "Set new password"}
                  </button>
                </>
              )}
            </form>
          ) : (
            /* RIGHT (first on mobile): sign-in form */
            <div className="order-1 space-y-5 p-5 sm:p-8 lg:order-2">
              <form
                onSubmit={handleLogin}
                className="space-y-5"
                aria-describedby={error ? "login-error" : undefined}
              >
                <div className="space-y-2">
                  <h1 className="page-title">Account Access</h1>
                  <p className="text-sm text-ink-2">
                    Sign in to access your digital ticket, workshop dashboard, or staff controls.
                  </p>
                </div>

                {error && (
                  <div
                    id="login-error"
                    role="alert"
                    className="flex items-start gap-2.5 border border-alert bg-alert-soft p-3.5 text-sm font-semibold text-alert"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div
                    role="status"
                    className="flex items-start gap-2.5 border border-ok bg-ok-soft p-3.5 text-sm font-semibold text-ok"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="field-label">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="username"
                      placeholder="e.g. rahul@nbkrist.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={error && !email.trim() ? "true" : undefined}
                      className="field pl-10"
                    />
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-end justify-between gap-2">
                    <label htmlFor="login-password" className="field-label">
                      Password
                    </label>
                    <button
                      type="button"
                      aria-expanded={showForgot}
                      aria-controls="forgot-panel"
                      onClick={() => {
                        setShowForgot((s) => !s);
                        setForgotError("");
                        setForgotSent(false);
                        if (!forgotEmail) setForgotEmail(email);
                      }}
                      className="-mt-3 inline-flex min-h-11 items-center text-sm font-bold text-accent underline underline-offset-4 hover:text-ink"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={error && !!email.trim() ? "true" : undefined}
                      className="field pl-10"
                    />
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign in to portal</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Inline forgot-password flow (its own form, not nested) */}
              {showForgot && (
                <form id="forgot-panel" onSubmit={handleSendReset} className="frame space-y-3 bg-field-2 p-4">
                  <span className="cell-label block">Reset your password</span>
                  {forgotSent ? (
                    <p role="status" className="flex items-start gap-2 text-sm font-semibold text-ok">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>Check your email for a reset link.</span>
                    </p>
                  ) : (
                    <>
                      {forgotError && (
                        <p role="alert" id="forgot-error" className="text-sm font-semibold text-alert">
                          {forgotError}
                        </p>
                      )}
                      <div>
                        <label htmlFor="forgot-email" className="field-label">
                          Account Email
                        </label>
                        <input
                          id="forgot-email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="e.g. rahul@nbkrist.org"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          aria-invalid={forgotError ? "true" : undefined}
                          aria-describedby={forgotError ? "forgot-error" : undefined}
                          className="field"
                        />
                      </div>
                      <button type="submit" disabled={forgotBusy} aria-busy={forgotBusy} className="btn w-full">
                        <Send className="h-4 w-4" />
                        <span>{forgotBusy ? "Sending..." : "Send reset link"}</span>
                      </button>
                    </>
                  )}
                </form>
              )}

              <p className="border-t border-rule pt-4 text-sm text-ink-2">
                Haven&apos;t registered for the workshop yet?{" "}
                <Link
                  href="/register"
                  className="inline-flex min-h-11 items-center font-bold text-accent underline underline-offset-4 hover:text-ink"
                >
                  Register Here
                </Link>
              </p>
            </div>
          )}

          {/* LEFT (second on mobile): identity plane */}
          <div className="plane-navy order-2 flex flex-col gap-8 p-5 sm:p-8 lg:order-1">
            <div className="space-y-3">
              <p className="display break-words text-[2rem] uppercase text-white sm:text-[2.5rem] lg:text-[3rem]">
                Prompt to Production
              </p>
              <p className="text-sm font-semibold text-[rgba(255,255,255,0.7)]">
                Paytm AI Workshop · Department of IT &amp; AI&amp;DS, NBKRIST with ISTE
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t-2 border-white/25 pt-5">
              <div>
                <dt className="cell-label">Date</dt>
                <dd className="num mt-1 font-bold text-white">{eventConfig.date_formatted}</dd>
              </div>
              <div>
                <dt className="cell-label">Time</dt>
                <dd className="num mt-1 font-bold text-white">{eventConfig.time}</dd>
              </div>
              <div className="col-span-2">
                <dt className="cell-label">Venue</dt>
                <dd className="mt-1 font-bold text-white">{eventConfig.venue}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
