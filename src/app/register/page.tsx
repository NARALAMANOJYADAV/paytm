"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PaymentHelp from "@/components/PaymentHelp";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Lock,
  Smartphone,
  Laptop,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
  Upload,
  FileText,
  Clock,
} from "lucide-react";
import { registerParticipant, useStore, isStoreReady } from "@/lib/store";
import { useAuth } from "@/lib/context/AuthContext";
import { ParticipantProfile } from "@/lib/types";
import { generateQrDataUrl, getUpiPaymentUri } from "@/lib/qr";

const PROOF_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const PROOF_MAX_BYTES = 5 * 1024 * 1024;

type ErrorKey =
  | "name" | "email" | "mobile" | "rollNumber" | "section" | "isteSmNumber" | "linkedinUrl" | "details"
  | "utrNumber" | "proof" | "payment"
  | "password" | "confirmPassword" | "account" | "rules";

/** Route a server error message to the step and field it belongs to. */
function routeServerError(message: string): { step: 1 | 2 | 3; key: ErrorKey } {
  const m = message.toLowerCase();
  if (m.includes("utr")) return { step: 2, key: "utrNumber" };
  if (m.includes("screenshot") || m.includes("upload")) return { step: 2, key: "proof" };
  if (m.includes("password")) return { step: 3, key: "password" };
  if (m.includes("roll number")) return { step: 1, key: "rollNumber" };
  if (m.includes("email")) return { step: 1, key: "email" };
  if (m.includes("mobile")) return { step: 1, key: "mobile" };
  if (m.includes("full name")) return { step: 1, key: "name" };
  if (m.includes("iste")) return { step: 1, key: "isteSmNumber" };
  if (m.includes("linkedin")) return { step: 1, key: "linkedinUrl" };
  if (m.includes("section")) return { step: 1, key: "section" };
  if (m.includes("year") || m.includes("branch")) return { step: 1, key: "details" };
  return { step: 3, key: "account" };
}

export default function RegisterPage() {
  const { login, loading: authLoading, role, currentRegistration } = useAuth();
  const router = useRouter();
  const { eventConfig, seatsTaken } = useStore();

  // Wizard Steps: 1: Details, 2: Summary & Payment, 3: Account, 4: Submitted
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [year, setYear] = useState<ParticipantProfile["year"]>("4th Year");
  const [branch, setBranch] = useState<ParticipantProfile["branch"]>("AI & DS");
  const [section, setSection] = useState("");

  // Conditional ISTE
  const [isIsteMember, setIsIsteMember] = useState<boolean>(true);
  const [isteSmNumber, setIsteSmNumber] = useState<string>("");

  // Laptop info
  const [hasLaptop, setHasLaptop] = useState<boolean>(true);

  // LinkedIn / Portfolio
  const [linkedinUrl, setLinkedinUrl] = useState<string>("");

  // Errors (client validation + routed server errors)
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});

  // UPI payment display
  const upiId = eventConfig.upi_id?.trim() || "";
  const upiPayee = eventConfig.upi_payee_name?.trim() || "NBKRIST";
  const isteFee = eventConfig.iste_fee;
  const nonIsteFee = eventConfig.non_iste_fee;
  const fee = isIsteMember ? isteFee : nonIsteFee;
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>("");
  const [upiPaymentUri, setUpiPaymentUri] = useState<string>("");
  const [upiConfirmOpen, setUpiConfirmOpen] = useState(false);

  // Phones open the UPI app chooser directly. Desktops can't handle upi:// links well,
  // so ask once per visit before trying (and offer the QR / copy instead).
  const openUpiApp = () => {
    if (!upiPaymentUri) return;
    const isPhone =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    let confirmed = false;
    try {
      confirmed = sessionStorage.getItem("p2p-upi-desktop-ok") === "1";
    } catch {}
    if (isPhone || confirmed) window.location.href = upiPaymentUri;
    else setUpiConfirmOpen(true);
  };
  const confirmUpiOnDesktop = () => {
    try {
      sessionStorage.setItem("p2p-upi-desktop-ok", "1");
    } catch {}
    setUpiConfirmOpen(false);
    window.location.href = upiPaymentUri;
  };
  useEffect(() => {
    if (!upiConfirmOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setUpiConfirmOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [upiConfirmOpen]);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedNote, setCopiedNote] = useState<boolean>(false);
  const dynamicUpiNote = `P2P ${name.trim() || "<user name>"} ${mobile.trim() || "<user mobile>"}`;

  // Payment proof
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string>("");

  // Account
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result
  const [createdRegNumber, setCreatedRegNumber] = useState<string>("");
  const [submittedFee, setSubmittedFee] = useState<number>(0);
  const [loginWarning, setLoginWarning] = useState<string>("");

  // Build the UPI QR from the configured UPI ID, fee and note
  useEffect(() => {
    const note = `P2P ${name.trim()} ${mobile.trim()}`.trim();
    const uri = getUpiPaymentUri({
      upiId,
      payeeName: upiPayee,
      amount: fee,
      transactionNote: note || (isIsteMember ? "P2P Workshop ISTE Fee" : "P2P Workshop Non-ISTE Fee"),
    });
    let cancelled = false;
    generateQrDataUrl(uri).then((dataUrl) => {
      if (cancelled) return;
      setUpiQrDataUrl(dataUrl);
      setUpiPaymentUri(uri);
    });
    return () => {
      cancelled = true;
    };
  }, [isIsteMember, name, mobile, upiId, upiPayee, fee]);

  // Object URL for the screenshot preview: revoke the old one when it changes or on unmount
  useEffect(() => {
    if (!proofPreviewUrl) return;
    return () => URL.revokeObjectURL(proofPreviewUrl);
  }, [proofPreviewUrl]);

  const selectProof = (file: File | null) => {
    setProofFile(file);
    setProofPreviewUrl(file && file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
  };

  const clearError = (key: ErrorKey) => {
    if (!errors[key]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyNote = () => {
    const note = `P2P ${name.trim()} ${mobile.trim()}`.trim();
    navigator.clipboard.writeText(note);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  // Step 1 validation (mirrors the server rules)
  const validateForm = () => {
    const errs: Partial<Record<ErrorKey, string>> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Valid email is required";
    if (mobile.replace(/\D/g, "").length < 10) errs.mobile = "10-digit mobile number is required";
    const rollClean = rollNumber.replace(/\s+/g, "");
    if (!rollClean) errs.rollNumber = "Roll number is required";
    else if (!/^[a-z0-9]{6,15}$/i.test(rollClean)) errs.rollNumber = "Roll number should be 6–15 letters and digits, e.g. 23KB1A3037";
    const sectionClean = section.replace(/\s+/g, "");
    if (!sectionClean) errs.section = "Section is required";
    else if (!/^[a-z0-9]{1,3}$/i.test(sectionClean)) errs.section = "Section should be 1–3 letters or digits, e.g. A or B2";
    if (isIsteMember && !isteSmNumber.trim()) {
      errs.isteSmNumber = "ISTE Student Membership Number is required for discount";
    }
    if (linkedinUrl && !/^https?:\/\//i.test(linkedinUrl.trim())) {
      errs.linkedinUrl = "Please enter a valid URL (starting with http:// or https://)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setCurrentStep(2);
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    clearError("proof");
    if (!file) {
      selectProof(null);
      return;
    }
    if (!PROOF_TYPES.includes(file.type)) {
      selectProof(null);
      e.target.value = "";
      setErrors((prev) => ({ ...prev, proof: "Payment screenshot must be PNG, JPG, WEBP or PDF." }));
      return;
    }
    if (file.size > PROOF_MAX_BYTES) {
      selectProof(null);
      e.target.value = "";
      setErrors((prev) => ({ ...prev, proof: "Payment screenshot must be under 5 MB." }));
      return;
    }
    selectProof(file);
  };

  // Step 2 -> 3: validate UTR + screenshot (duplicate UTR is checked by the server)
  const handleProceedToAccount = () => {
    const errs: Partial<Record<ErrorKey, string>> = {};
    const cleanUtr = utrNumber.replace(/\s/g, "");
    if (!cleanUtr) errs.utrNumber = "Transaction UTR / Reference No. is mandatory (*)";
    else if (!/^\d{12}$/.test(cleanUtr)) errs.utrNumber = "Enter the 12-digit UPI transaction reference (UTR).";
    if (!proofFile) errs.proof = errors.proof || "Upload a screenshot of your payment.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setCurrentStep(3);
  };

  // Step 3: create the account + registration in one request
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters" });
      return;
    }
    if (!acceptedRules) {
      setErrors({ rules: "Please read and accept the event rules." });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    if (!proofFile) {
      setErrors({ proof: "Upload a screenshot of your payment." });
      setCurrentStep(2);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const form = new FormData();
    form.set("name", name.trim());
    form.set("email", email.trim());
    form.set("password", password);
    form.set("mobile", mobile.trim());
    form.set("rollNumber", rollNumber.trim().toUpperCase());
    form.set("year", year);
    form.set("branch", branch);
    form.set("section", section);
    form.set("isteMember", String(isIsteMember));
    form.set("isteSmNumber", isIsteMember ? isteSmNumber.trim() : "");
    form.set("hasLaptop", String(hasLaptop));
    form.set("linkedinPortfolio", linkedinUrl.trim());
    form.set("utr", utrNumber.replace(/\s/g, ""));
    form.set("proof", proofFile);

    try {
      const res = await registerParticipant(form);
      setCreatedRegNumber(res.registrationNumber);
      setSubmittedFee(res.fee);
      const auth = await login(email, password);
      if (!auth.success) {
        setLoginWarning(auth.error || "Your registration was saved, but we could not sign you in. Sign in from the login page.");
      }
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}
      setCurrentStep(4);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      const { step, key } = routeServerError(message);
      setErrors({ [key]: message });
      setCurrentStep(step);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { step: 1, label: "Details", title: "Personal Information" },
    { step: 2, label: "Payment", title: "Summary & Payment" },
    { step: 3, label: "Account", title: "Account Password Setup" },
    { step: 4, label: "Submitted", title: "Payment Under Verification" },
  ];

  // Presentation helpers for accessible field errors
  const errId = (key: ErrorKey) => (errors[key] ? `err-${key}` : undefined);
  const invalid = (key: ErrorKey) => (errors[key] ? ("true" as const) : undefined);

  // Closed state: registration switched off or seats full (never replaces the success screen)
  const storeReady = isStoreReady();
  const seatsFull = seatsTaken >= eventConfig.capacity;
  const paymentsNotSet = storeReady && !upiId;
  const isClosed = storeReady && currentStep !== 4 && (!eventConfig.registration_open || seatsFull || paymentsNotSet);
  const checkingAvailability = !storeReady && authLoading;
  const showForm = !isClosed && !checkingAvailability;

  const orderSummary = (
    <aside className="hidden lg:block lg:sticky lg:top-24 self-start">
      <div className="frame sticky top-24 bg-paper">
        <h2 className="rule-b px-5 py-4 text-lg font-semibold wide">Order Summary</h2>
        <div className="space-y-4 p-5">
          <div>
            <span className="cell-label block">Item</span>
            <p className="mt-1 font-bold">Prompt to Production: Paytm AI Workshop pass</p>
          </div>
          <div>
            <span className="cell-label block">Tier</span>
            <p className="mt-1 text-sm text-ink-2">
              {isIsteMember ? "ISTE Student Member Subsidized Rate" : "Standard Non-ISTE Rate"}
            </p>
          </div>
          <div className="flex items-end justify-between gap-3 border-t border-rule pt-4">
            <div>
              <span className="cell-label block">Total</span>
              <span className="text-xs text-ink-2">All taxes included</span>
            </div>
            <span className="num text-4xl font-semibold wide">₹{fee}</span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t border-rule p-5 text-sm">
          <div>
            <dt className="cell-label">Date</dt>
            <dd className="num mt-1 font-bold">{eventConfig.date_formatted}</dd>
          </div>
          <div>
            <dt className="cell-label">Time</dt>
            <dd className="num mt-1 font-bold">{eventConfig.time}</dd>
          </div>
          <div className="col-span-2">
            <dt className="cell-label">Venue</dt>
            <dd className="mt-1 font-bold">{eventConfig.venue}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );

  const choiceClass = (active: boolean) =>
    `relative flex min-h-11 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
      active ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink hover:border-ink-3 hover:bg-paper-2"
    }`;

  // Staff accounts cannot register; a student who already registered goes to their dashboard.
  const isStaff = role === "admin" || role === "coordinator";
  const alreadyRegistered = role === "user" && !!currentRegistration && currentStep !== 4;
  useEffect(() => {
    if (!authLoading && alreadyRegistered) router.replace("/dashboard");
  }, [authLoading, alreadyRegistered, router]);

  if (!authLoading && (isStaff || alreadyRegistered)) {
    return (
      <div className="min-h-[60vh] bg-field px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-xl frame bg-paper p-6 sm:p-8 space-y-4">
          <h1 className="page-title">{isStaff ? "Registration is for students" : "You are already registered"}</h1>
          <p className="text-ink-2">
            {isStaff
              ? `You are signed in with a ${role} account. Participants register themselves; you can review their registrations and payments from your console.`
              : "Taking you to your dashboard…"}
          </p>
          {isStaff && (
            <Link href={role === "admin" ? "/admin/participants" : "/coordinator"} className="btn btn-primary">
              Open {role === "admin" ? "participant directory" : "coordinator console"}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-field px-4 py-6 pb-16 sm:px-6 sm:py-10 sm:pb-24 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header + progress, one card */}
        <div className="frame bg-paper">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
            <div className="space-y-1.5">
              <h1 className="page-title">Register for Prompt to Production</h1>
              <p className="text-sm text-ink-2">
                Paytm AI Workshop · Department of IT &amp; AI&amp;DS, NBKRIST with ISTE
              </p>
            </div>
            {currentStep === 1 && (
              <Link href="/login" className="btn btn-sm self-start sm:self-auto">
                Already registered? Sign in
              </Link>
            )}
          </div>

          {!isClosed && (
            <div className="rule-t px-5 py-5 sm:px-7">
              <ol aria-label="Registration progress" className="grid grid-cols-4">
                {steps.map((item, i) => {
                  const isCurrent = currentStep === item.step;
                  const isDone = currentStep > item.step;
                  return (
                    <li key={item.step} aria-current={isCurrent ? "step" : undefined} className="relative flex flex-col items-center text-center">
                      {i > 0 && (
                        <span
                          aria-hidden="true"
                          className={`absolute top-4 right-1/2 h-[2px] w-full -translate-y-1/2 ${currentStep >= item.step ? "bg-ink" : "bg-line"}`}
                          style={{ marginRight: "1.25rem", width: "calc(100% - 2.5rem)" }}
                        />
                      )}
                      <span
                        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold num transition-colors ${
                          isCurrent
                            ? "bg-ink text-white shadow-[0_0_0_4px_rgba(17,17,19,0.08)]"
                            : isDone
                              ? "bg-ok text-white"
                              : "bg-paper text-ink-3 border border-line"
                        }`}
                      >
                        {isDone ? <Check className="h-4 w-4" aria-hidden="true" /> : item.step}
                      </span>
                      <span className={`mt-2 text-xs sm:text-sm ${isCurrent ? "font-semibold text-ink" : isDone ? "text-ink-2" : "text-ink-3"}`}>
                        {item.label}
                        {isDone && <span className="sr-only"> (completed)</span>}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="sr-only" aria-live="polite">
                Step {currentStep} of 4: {steps[currentStep - 1]?.title}
              </p>
            </div>
          )}
        </div>

        {checkingAvailability && (
          <div className="frame bg-paper p-5 sm:p-8" aria-busy="true">
            <p className="flex items-center gap-2 text-sm text-ink-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking seat availability...</span>
            </p>
          </div>
        )}

        {/* CLOSED STATE */}
        {isClosed && (
          <div className="frame mx-auto max-w-2xl bg-paper">
            <div className="rule-b flex items-start gap-4 px-5 py-5 sm:px-8">
              <Lock className="mt-1 h-6 w-6 flex-shrink-0 text-ink-2" />
              <div>
                <h2 className="text-2xl font-semibold wide">
                  {!eventConfig.registration_open ? "Registration is closed" : paymentsNotSet ? "Registration opens soon" : "All seats are taken"}
                </h2>
                <p className="mt-1 text-sm text-ink-2">
                  {!eventConfig.registration_open
                    ? "Registrations for this workshop are not being accepted right now."
                    : paymentsNotSet
                    ? "The organisers are setting up fee payments. Please check back shortly."
                    : `All ${eventConfig.capacity} seats have been filled. Seats held by rejected payments may open up again, so check back later.`}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:px-8">
              <Link href="/" className="btn btn-lg w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to home</span>
              </Link>
              <Link href="/login" className="btn btn-primary btn-lg w-full sm:w-auto">
                <span>Already registered? Sign in</span>
              </Link>
            </div>
          </div>
        )}

        {/* STEP 1: REGISTRATION FORM */}
        {showForm && currentStep === 1 && (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <form onSubmit={handleProceedToSummary} className="frame bg-paper">
              <div className="rule-b px-5 py-5 sm:px-8">
                <h2 className="text-xl font-semibold wide">Personal Information</h2>
                <p className="mt-1 text-sm text-ink-2">Ensure details match your official college records.</p>
              </div>

              <div className="space-y-8 p-5 sm:p-8">
                {errors.details && (
                  <div role="alert" className="flex items-start gap-2.5 border border-alert bg-alert-soft p-3.5 text-sm font-semibold text-alert">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{errors.details}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label htmlFor="reg-name" className="field-label">Full Name *</label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="e.g. Manoj N"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      aria-invalid={invalid("name")}
                      aria-describedby={errId("name")}
                      className="field"
                    />
                    {errors.name && <p id="err-name" className="mt-1.5 text-sm font-semibold text-alert">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="reg-email" className="field-label">Email ID *</label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="student@nbkrist.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={invalid("email")}
                      aria-describedby={errId("email")}
                      className="field"
                    />
                    {errors.email && <p id="err-email" className="mt-1.5 text-sm font-semibold text-alert">{errors.email}</p>}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label htmlFor="reg-mobile" className="field-label">Mobile Number *</label>
                    <input
                      id="reg-mobile"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="+91 9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      aria-invalid={invalid("mobile")}
                      aria-describedby={errId("mobile")}
                      className="field num"
                    />
                    {errors.mobile && <p id="err-mobile" className="mt-1.5 text-sm font-semibold text-alert">{errors.mobile}</p>}
                  </div>

                  {/* Roll Number */}
                  <div>
                    <label htmlFor="reg-roll" className="field-label">Roll Number *</label>
                    <input
                      id="reg-roll"
                      type="text"
                      required
                      placeholder="e.g. 22011A3142"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                      aria-invalid={invalid("rollNumber")}
                      aria-describedby={errId("rollNumber")}
                      className="field font-mono uppercase"
                    />
                    {errors.rollNumber && (
                      <p id="err-rollNumber" className="mt-1.5 text-sm font-semibold text-alert">{errors.rollNumber}</p>
                    )}
                  </div>

                  {/* Year */}
                  <div>
                    <label htmlFor="reg-year" className="field-label">Year of Study *</label>
                    <select
                      id="reg-year"
                      value={year}
                      onChange={(e) => setYear(e.target.value as ParticipantProfile["year"])}
                      className="field"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  {/* Branch */}
                  <div>
                    <label htmlFor="reg-branch" className="field-label">Branch *</label>
                    <select
                      id="reg-branch"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value as ParticipantProfile["branch"])}
                      className="field"
                    >
                      <option value="AI & DS">Artificial Intelligence & Data Science (AI & DS)</option>
                      <option value="IT">Information Technology (IT)</option>
                      <option value="CSE">Computer Science & Engineering (CSE)</option>
                      <option value="ECE">Electronics & Communication (ECE)</option>
                      <option value="EEE">Electrical & Electronics (EEE)</option>
                      <option value="Mechanical">Mechanical Engineering</option>
                      <option value="Civil">Civil Engineering</option>
                    </select>
                  </div>

                  {/* Section */}
                  <div>
                    <label htmlFor="reg-section" className="field-label">Section *</label>
                    <input
                      id="reg-section"
                      type="text"
                      inputMode="text"
                      autoCapitalize="characters"
                      autoComplete="off"
                      maxLength={3}
                      placeholder="e.g. A"
                      value={section}
                      onChange={(e) => {
                        setSection(e.target.value.toUpperCase());
                        clearError("section");
                      }}
                      aria-invalid={invalid("section")}
                      aria-describedby={errId("section")}
                      className="field uppercase"
                    />
                    {errors.section && (
                      <p id="err-section" role="alert" className="mt-1.5 text-sm font-semibold text-alert">{errors.section}</p>
                    )}
                  </div>
                </div>

                {/* ISTE INFORMATION: fee choice */}
                <fieldset className="space-y-3 border-t border-rule pt-6">
                  <legend className="field-label float-left mb-3 w-full">Are you an ISTE Member? *</legend>
                  <div role="radiogroup" aria-label="Registration fee" className="clear-both grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      { value: true, title: "Yes, ISTE member", price: isteFee, note: "Subsidized rate with a valid ISTE membership number" },
                      { value: false, title: "No, not a member", price: nonIsteFee, note: "Standard Non-ISTE rate" },
                    ].map((opt) => {
                      const active = isIsteMember === opt.value;
                      return (
                        <button
                          key={opt.title}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setIsIsteMember(opt.value)}
                          className={`relative flex min-h-32 w-full flex-col items-start justify-between gap-3 rounded-2xl border p-5 text-left transition-all ${
                            active
                              ? "border-ink bg-paper text-ink shadow-[0_0_0_1px_#111113,0_12px_28px_-16px_rgba(17,17,19,0.45)]"
                              : "border-line bg-paper text-ink hover:border-ink-3"
                          }`}
                        >
                          <span className="flex w-full items-start justify-between gap-3">
                            <span className="font-semibold">{opt.title}</span>
                            <span
                              aria-hidden="true"
                              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border ${
                                active ? "border-ink bg-ink text-white" : "border-line"
                              }`}
                            >
                              {active && <Check className="h-4 w-4" />}
                            </span>
                          </span>
                          <span>
                            <span className="num block text-4xl font-semibold wide">₹{opt.price}</span>
                            <span className="mt-1 block text-xs text-ink-2">
                              {opt.note}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Conditional ISTE Student Membership Number Field */}
                  {isIsteMember && (
                    <div className="pt-2">
                      <label htmlFor="reg-iste" className="field-label">ISTE Student Membership Number *</label>
                      <input
                        id="reg-iste"
                        type="text"
                        required
                        placeholder="e.g. ISTE-STU-2023-8942"
                        value={isteSmNumber}
                        onChange={(e) => setIsteSmNumber(e.target.value)}
                        aria-invalid={invalid("isteSmNumber")}
                        aria-describedby={errors.isteSmNumber ? "err-isteSmNumber reg-iste-hint" : "reg-iste-hint"}
                        className="field font-mono"
                      />
                      {errors.isteSmNumber && (
                        <p id="err-isteSmNumber" className="mt-1.5 text-sm font-semibold text-alert">{errors.isteSmNumber}</p>
                      )}
                      <p id="reg-iste-hint" className="field-hint">
                        Enter your valid ISTE ID to claim the ₹{isteFee} subsidized ticket.
                      </p>
                    </div>
                  )}
                </fieldset>

                {/* LAPTOP INFORMATION */}
                <fieldset className="space-y-3 border-t border-rule pt-6">
                  <legend className="field-label float-left mb-3 w-full">
                    Do you have a laptop for the hands-on session? *
                  </legend>
                  <div role="radiogroup" aria-label="Laptop" className="clear-both grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={hasLaptop}
                      onClick={() => setHasLaptop(true)}
                      className={choiceClass(hasLaptop)}
                    >
                      <Laptop className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1">Yes, I have a laptop</span>
                      {hasLaptop && <Check className="h-4 w-4 flex-shrink-0" />}
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={!hasLaptop}
                      onClick={() => setHasLaptop(false)}
                      className={choiceClass(!hasLaptop)}
                    >
                      <span className="flex-1">No laptop</span>
                      {!hasLaptop && <Check className="h-4 w-4 flex-shrink-0" />}
                    </button>
                  </div>
                  <p className="field-hint">
                    This helps organizers arrange lab terminals and power extension cords for the AI Build Challenge.
                  </p>
                </fieldset>

                {/* PROFESSIONAL PROFILE */}
                <div className="border-t border-rule pt-6">
                  <label htmlFor="reg-linkedin" className="field-label">
                    LinkedIn Profile / Portfolio URL (Optional)
                  </label>
                  <input
                    id="reg-linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/yourname"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    aria-invalid={invalid("linkedinUrl")}
                    aria-describedby={errId("linkedinUrl")}
                    className="field"
                  />
                  {errors.linkedinUrl && (
                    <p id="err-linkedinUrl" className="mt-1.5 text-sm font-semibold text-alert">{errors.linkedinUrl}</p>
                  )}
                </div>

                {/* Mobile fee readout (desktop shows the order summary plane) */}
                <div className="flex items-center justify-between gap-3 border border-line bg-field-2 p-4 lg:hidden">
                  <div>
                    <span className="cell-label block">Registration Fee</span>
                    <span className="text-xs text-ink-2">All taxes included</span>
                  </div>
                  <span className="num text-3xl font-semibold wide">₹{fee}</span>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-primary btn-lg w-full whitespace-normal py-3 text-center">
                  <span>Continue to registration summary</span>
                  <ArrowRight className="h-4 w-4 flex-shrink-0" />
                </button>
              </div>
            </form>

            {orderSummary}
          </div>
        )}

        {/* STEP 2: REGISTRATION SUMMARY & PAYMENT */}
        {showForm && currentStep === 2 && (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="frame bg-paper">
              <div className="rule-b px-5 py-5 sm:px-8">
                <h2 className="text-xl font-semibold wide">Registration Summary</h2>
                <p className="mt-1 text-sm text-ink-2">Review your information, pay by UPI and upload your payment proof</p>
              </div>

              <div className="space-y-6 p-5 sm:p-8">
                {errors.payment && (
                  <div role="alert" className="flex items-start gap-2.5 border border-alert bg-alert-soft p-3.5 text-sm font-semibold text-alert">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{errors.payment}</span>
                  </div>
                )}

                {/* Summary Details Grid */}
                <dl className="planes grid-cols-1 text-sm sm:grid-cols-2">
                  <div className="p-4">
                    <dt className="cell-label">Name</dt>
                    <dd className="mt-1 break-words font-bold">{name}</dd>
                  </div>
                  <div className="p-4">
                    <dt className="cell-label">Email</dt>
                    <dd className="mt-1 break-all">{email}</dd>
                  </div>
                  <div className="p-4">
                    <dt className="cell-label">Roll Number</dt>
                    <dd className="mt-1 font-mono font-bold uppercase">{rollNumber}</dd>
                  </div>
                  <div className="p-4">
                    <dt className="cell-label">Branch</dt>
                    <dd className="mt-1">{branch}</dd>
                  </div>
                  <div className="p-4">
                    <dt className="cell-label">Year &amp; Section</dt>
                    <dd className="mt-1">{year} · Sec {section}</dd>
                  </div>
                  <div className="p-4">
                    <dt className="cell-label">ISTE Member</dt>
                    <dd className="mt-1">
                      {isIsteMember ? (
                        <span>
                          Yes (<span className="font-mono">{isteSmNumber}</span>)
                        </span>
                      ) : (
                        "No"
                      )}
                    </dd>
                  </div>
                  <div className="p-4">
                    <dt className="cell-label">Laptop</dt>
                    <dd className="mt-1">{hasLaptop ? "Yes" : "No"}</dd>
                  </div>
                  <div className="p-4">
                    <dt className="cell-label">Mobile</dt>
                    <dd className="num mt-1">{mobile}</dd>
                  </div>
                </dl>

                {/* Dynamic Fee Box (mobile; desktop uses the order summary plane) */}
                <div className="flex items-center justify-between gap-3 border border-line bg-field-2 p-4 lg:hidden">
                  <div>
                    <span className="cell-label block">Registration Fee</span>
                    <p className="mt-0.5 text-xs text-ink-2">
                      {isIsteMember ? "ISTE Student Member Subsidized Rate" : "Standard Non-ISTE Rate"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="num block text-3xl font-semibold wide">₹{fee}</span>
                    <span className="text-xs text-ink-2">All taxes included</span>
                  </div>
                </div>

                {/* OFFICIAL DYNAMIC UPI QR PAYMENT CARD */}
                <section aria-labelledby="upi-title" className="frame bg-field-2">
                  <div className="rule-b flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-3">
                      <QrCode className="h-5 w-5 text-ink-2" />
                      <div>
                        <h3 id="upi-title" className="font-semibold">Official UPI Payment</h3>
                        <p className="text-xs text-ink-2">Paytm · PhonePe · Google Pay · BHIM</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="tag tag-info">Paytm AI</span>
                      <span className="tag">{isIsteMember ? `₹${isteFee} (ISTE Member)` : `₹${nonIsteFee} (Non-ISTE)`}</span>
                    </div>
                  </div>

                  {/* Phones: paying in a UPI app is the main action (you can't scan your own screen) */}
                  {upiPaymentUri && (
                    <div className="px-4 pt-4 sm:hidden">
                      <a href={upiPaymentUri} className="btn btn-primary btn-lg w-full">
                        <Smartphone className="h-5 w-5" aria-hidden="true" />
                        Pay ₹{fee} with a UPI app
                      </a>
                      <p className="mt-2 text-center text-xs text-ink-3">Opens GPay, PhonePe, Paytm or BHIM with the amount filled in.</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 items-start gap-5 p-4 sm:grid-cols-12 sm:p-5">
                    {/* QR Code Graphic Column */}
                    <div className="flex flex-col items-center gap-2 sm:col-span-5">
                      <div className="relative bg-white p-3">
                        {upiQrDataUrl ? (
                          <img src={upiQrDataUrl} alt={`UPI QR Code ₹${fee}`} className="h-44 w-44 object-contain" />
                        ) : (
                          <div className="flex h-44 w-44 items-center justify-center font-mono text-xs text-on-accent">
                            Generating QR...
                          </div>
                        )}
                        {/* Center badge */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="flex h-9 w-9 items-center justify-center border border-white bg-navy">
                            <span className="text-[9px] font-semibold text-white">P2P</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-center text-xs text-ink-2">
                        Scan with any UPI App to Pay <strong className="num text-ink">₹{fee}</strong>
                      </span>
                    </div>

                    {/* UPI Details & Actions Column */}
                    <div className="space-y-3 sm:col-span-7">
                      {/* UPI ID: tap to open a UPI app, or copy */}
                      <div className="rounded-xl border border-line bg-paper p-3">
                        <span className="cell-label block">Official UPI ID</span>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={openUpiApp}
                            title="Open in a UPI app"
                            className="min-w-0 break-all text-left font-mono text-sm font-bold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                          >
                            {upiId}
                          </button>
                          <button type="button" onClick={handleCopyUpi} className="btn btn-sm flex-shrink-0" aria-live="polite">
                            {copiedUpi ? (
                              <>
                                <Check className="h-4 w-4 text-ok" aria-hidden="true" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" aria-hidden="true" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Fee Breakdown Info */}
                      <dl className="divide-y divide-rule rounded-xl border border-line bg-paper text-sm overflow-hidden">
                        <div className="flex justify-between gap-3 px-3 py-2">
                          <dt className="text-ink-2">Tier</dt>
                          <dd className="text-right font-bold">
                            {isIsteMember ? "ISTE Student Subsidized" : "Non-ISTE Student"}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3 px-3 py-2">
                          <dt className="text-ink-2">Amount</dt>
                          <dd className="num font-semibold">₹{fee}.00</dd>
                        </div>
                        <div className="space-y-1.5 px-3 py-2">
                          <dt className="text-ink-2">Payment Note</dt>
                          <dd className="flex items-center justify-between gap-2">
                            <span className="min-w-0 break-all font-mono text-xs font-bold text-ink">
                              {dynamicUpiNote}
                            </span>
                            <button type="button" onClick={handleCopyNote} className="btn flex-shrink-0 px-3">
                              {copiedNote ? "Copied!" : "Copy"}
                            </button>
                          </dd>
                        </div>
                      </dl>

                      {/* Pay via UPI app (phones: direct; desktop: confirm first) */}
                      {upiPaymentUri && (
                        <button type="button" onClick={openUpiApp} className="btn hidden sm:inline-flex w-full whitespace-normal text-center">
                          <Smartphone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                          <span>Pay ₹{fee} with a UPI app</span>
                        </button>
                      )}

                      {upiConfirmOpen && createPortal(
                        <div
                          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[rgba(17,17,19,0.55)] p-4"
                          onClick={() => setUpiConfirmOpen(false)}
                        >
                          <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="upi-confirm-title"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-2xl border border-line bg-paper p-6 shadow-[0_24px_60px_-20px_rgba(17,17,19,0.5)]"
                          >
                            <h2 id="upi-confirm-title" className="text-lg font-semibold tracking-tight">Open a UPI app on this computer?</h2>
                            <p className="mt-2 text-sm leading-relaxed text-ink-2">
                              UPI apps (Paytm, PhonePe, GPay) open on phones. On a computer your browser may ask to open an
                              app or do nothing. The easiest way is to scan the QR code with your phone, or copy the UPI ID
                              into your UPI app.
                            </p>
                            <div className="mt-5 grid gap-2">
                              <button type="button" onClick={() => { handleCopyUpi(); setUpiConfirmOpen(false); }} className="btn btn-primary">
                                <Copy className="h-4 w-4" aria-hidden="true" /> Copy UPI ID
                              </button>
                              <button type="button" onClick={confirmUpiOnDesktop} className="btn">
                                Open UPI app anyway
                              </button>
                              <button type="button" onClick={() => setUpiConfirmOpen(false)} className="btn btn-quiet">
                                I&apos;ll scan the QR with my phone
                              </button>
                            </div>
                          </div>
                        </div>,
                        document.body,
                      )}

                      <PaymentHelp name={name} context="The payment is not going through / not accepted" className="w-full" />

                      {/* Anti-Fraud UTR Alert Notice */}
                      <div className="space-y-1 rounded-xl border border-[#efc98f] bg-sun-soft p-3 text-sm">
                        <div className="flex items-start gap-2 font-bold text-accent">
                          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span>Anti-Fraud Notice: One-Time UTR Upload Only</span>
                        </div>
                        <p className="text-xs leading-relaxed text-ink">
                          Every payment is checked by the organizers. A UTR can be used for only one registration; re-used or
                          duplicate UTR numbers are rejected.
                        </p>
                      </div>

                      {/* UTR / Ref No Input (Mandatory *) */}
                      <div>
                        <label htmlFor="reg-utr" className="field-label">
                          Transaction UTR / Reference No. <span className="text-alert">*</span>
                        </label>
                        <input
                          id="reg-utr"
                          type="text"
                          inputMode="numeric"
                          maxLength={14}
                          placeholder="12-digit UTR, e.g. 427819284910"
                          value={utrNumber}
                          onChange={(e) => {
                            setUtrNumber(e.target.value.replace(/[^\d\s]/g, ""));
                            clearError("utrNumber");
                          }}
                          aria-invalid={invalid("utrNumber")}
                          aria-describedby={errId("utrNumber")}
                          className="field font-mono"
                          required
                        />
                        {errors.utrNumber && (
                          <p id="err-utrNumber" role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-alert">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>{errors.utrNumber}</span>
                          </p>
                        )}
                      </div>

                      {/* Payment screenshot (Mandatory *) */}
                      <div>
                        <label htmlFor="reg-proof" className="field-label">
                          Payment Screenshot <span className="text-alert">*</span>
                        </label>
                        <label
                          htmlFor="reg-proof"
                          className="flex min-h-11 cursor-pointer items-center gap-3 border border-dashed border-line bg-paper px-3 py-3 text-sm hover:border-ink-3"
                        >
                          <Upload className="h-4 w-4 flex-shrink-0 text-ink-2" />
                          <span className="min-w-0 flex-1 break-all">
                            {proofFile ? proofFile.name : "Choose a PNG, JPG, WEBP or PDF (max 5 MB)"}
                          </span>
                          {proofFile && <span className="tag">{(proofFile.size / 1024 / 1024).toFixed(1)} MB</span>}
                        </label>
                        <input
                          id="reg-proof"
                          type="file"
                          accept="image/png,image/jpeg,image/webp,application/pdf"
                          onChange={handleProofChange}
                          aria-invalid={invalid("proof")}
                          aria-describedby={errors.proof ? "err-proof reg-proof-hint" : "reg-proof-hint"}
                          className="sr-only"
                        />
                        <p id="reg-proof-hint" className="field-hint">
                          Upload the payment confirmation screen showing the amount and UTR.
                        </p>
                        {errors.proof && (
                          <p id="err-proof" role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-alert">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>{errors.proof}</span>
                          </p>
                        )}
                        {proofFile && (
                          <div className="mt-2 border border-line bg-paper p-2">
                            {proofPreviewUrl ? (
                              <img
                                src={proofPreviewUrl}
                                alt="Payment screenshot preview"
                                className="mx-auto max-h-64 w-auto object-contain"
                              />
                            ) : (
                              <p className="flex items-center gap-2 text-sm text-ink-2">
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <span className="break-all">PDF attached: {proofFile.name}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-stretch">
                  <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-lg w-full sm:w-auto">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToAccount}
                    className="btn btn-primary btn-lg w-full whitespace-normal py-3 text-center sm:flex-1"
                  >
                    <span>I have paid ₹{fee} · Continue to account setup</span>
                    <ArrowRight className="h-4 w-4 flex-shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            {orderSummary}
          </div>
        )}

        {/* STEP 3: ACCOUNT CREATION + SUBMIT */}
        {showForm && currentStep === 3 && (
          <form
            onSubmit={handleSubmitRegistration}
            className="frame mx-auto max-w-lg bg-paper"
            aria-describedby={errors.account ? "err-account" : undefined}
          >
            <div className="rule-b flex items-start gap-3 px-5 py-5 sm:px-8">
              <Lock className="mt-1 h-5 w-5 flex-shrink-0 text-ink-2" />
              <div>
                <h2 className="text-xl font-semibold wide">Create Your Account</h2>
                <p className="mt-1 text-sm text-ink-2">
                  You will use this to sign in, follow your payment verification and get your ticket.
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-8">
              {errors.account && (
                <div
                  id="err-account"
                  role="alert"
                  className="flex items-start gap-2.5 border border-alert bg-alert-soft p-3.5 text-sm font-semibold text-alert"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{errors.account}</span>
                </div>
              )}

              <div>
                <label htmlFor="acct-email" className="field-label">Email (Pre-filled from Registration)</label>
                <input
                  id="acct-email"
                  type="email"
                  disabled
                  value={email}
                  autoComplete="username"
                  className="field cursor-not-allowed bg-paper-2 text-ink-2"
                />
              </div>

              <div>
                <label htmlFor="acct-password" className="field-label">Create Password *</label>
                <div className="relative">
                  <input
                    id="acct-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError("password");
                    }}
                    aria-invalid={invalid("password")}
                    aria-describedby={errId("password")}
                    className="field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-ink-2 hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="err-password" className="mt-1.5 text-sm font-semibold text-alert">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="acct-confirm" className="field-label">Confirm Password *</label>
                <input
                  id="acct-confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError("confirmPassword");
                  }}
                  aria-invalid={invalid("confirmPassword")}
                  aria-describedby={errId("confirmPassword")}
                  className="field"
                />
                {errors.confirmPassword && (
                  <p id="err-confirmPassword" className="mt-1.5 text-sm font-semibold text-alert">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer text-[0.9375rem] text-ink-2">
                  <input
                    type="checkbox"
                    checked={acceptedRules}
                    onChange={(e) => {
                      setAcceptedRules(e.target.checked);
                      clearError("rules");
                    }}
                    aria-invalid={invalid("rules")}
                    aria-describedby={errId("rules")}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#111113]"
                  />
                  <span>
                    I have read and agree to the{" "}
                    <a href="/rules" target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline underline-offset-4">
                      event rules
                    </a>
                    , including that my ticket is issued only after payment verification and that certificates require attendance.
                  </span>
                </label>
                {errors.rules && (
                  <p id="err-rules" className="mt-1.5 text-sm font-semibold text-alert">{errors.rules}</p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-stretch">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={isSubmitting}
                  className="btn btn-lg w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="btn btn-primary btn-lg w-full whitespace-normal py-3 text-center sm:flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                      <span>Submitting registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Create account &amp; submit registration</span>
                      <ArrowRight className="h-4 w-4 flex-shrink-0" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 4: SUBMITTED, PAYMENT UNDER VERIFICATION */}
        {currentStep === 4 && (
          <div className="frame mx-auto max-w-2xl bg-paper">
            <div className="rule-b flex items-start gap-4 bg-ok-soft px-5 py-5 sm:px-8">
              <CheckCircle2 className="mt-1 h-7 w-7 flex-shrink-0 text-ok" />
              <div>
                <h2 className="text-2xl font-semibold wide">Registration Submitted</h2>
                <p className="mt-1 text-sm text-ink-2">Your payment is under verification.</p>
              </div>
            </div>

            <dl className="grid grid-cols-1 divide-y divide-rule sm:grid-cols-2 sm:divide-y-0">
              <div className="px-5 py-4 sm:px-8">
                <dt className="cell-label">Registration Number</dt>
                <dd className="mt-1 break-all font-mono text-xl font-bold">{createdRegNumber}</dd>
              </div>
              <div className="px-5 py-4 sm:px-8">
                <dt className="cell-label">Amount</dt>
                <dd className="num mt-1 text-xl font-semibold">₹{submittedFee}</dd>
              </div>
              <div className="px-5 py-4 sm:border-t sm:border-rule sm:px-8">
                <dt className="cell-label">Payment Status</dt>
                <dd className="mt-1.5">
                  <span className="tag tag-pending inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    Payment under verification
                  </span>
                </dd>
              </div>
              <div className="px-5 py-4 sm:border-t sm:border-rule sm:px-8">
                <dt className="cell-label">UTR</dt>
                <dd className="mt-1 break-all font-mono font-bold">{utrNumber.replace(/\s/g, "")}</dd>
              </div>
            </dl>

            <div className="rule-t space-y-3 px-5 py-5 sm:px-8">
              <h3 className="font-semibold">What happens next</h3>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-2">
                <li>An organizer checks your UTR and payment screenshot against the received payments.</li>
                <li>Once approved, your QR ticket appears in your dashboard.</li>
                <li>If there is a problem with the payment, the dashboard shows the reason and lets you resubmit.</li>
              </ol>
              {loginWarning && (
                <p role="alert" className="flex items-start gap-2 text-sm font-semibold text-alert">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{loginWarning}</span>
                </p>
              )}
            </div>

            <div className="rule-t p-5 sm:px-8">
              <Link
                href={loginWarning ? "/login?next=/dashboard" : "/dashboard"}
                className="btn btn-primary btn-lg w-full whitespace-normal py-3 text-center"
              >
                <span>Go to dashboard</span>
                <ArrowRight className="h-4 w-4 flex-shrink-0" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
