"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Lock,
  Smartphone,
  ExternalLink,
  Laptop,
  GraduationCap,
  Building,
  User,
  Mail,
  Phone,
  FileBadge,
  Eye,
  EyeOff
} from "lucide-react";
import TicketCard from "@/components/TicketCard";
import { 
  registerParticipant, 
  completePaymentAndIssueTicket, 
  loadStore 
} from "@/lib/store";
import { useAuth } from "@/lib/context/AuthContext";
import { ParticipantProfile } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Wizard Steps: 1: Form, 2: Summary & Payment, 3: Payment Success, 4: Account Setup, 5: Ticket Generated
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [year, setYear] = useState<ParticipantProfile["year"]>("4th Year");
  const [branch, setBranch] = useState<ParticipantProfile["branch"]>("AI & DS");
  const [section, setSection] = useState<ParticipantProfile["section"]>("A");
  
  // Conditional ISTE
  const [isIsteMember, setIsIsteMember] = useState<boolean>(true);
  const [isteSmNumber, setIsteSmNumber] = useState<string>("");
  
  // Laptop info
  const [hasLaptop, setHasLaptop] = useState<boolean>(true);
  
  // LinkedIn / Portfolio
  const [linkedinUrl, setLinkedinUrl] = useState<string>("");

  // Payment & Account states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [activePaymentMethod, setActivePaymentMethod] = useState<string>("upi");
  
  // Stored registration record
  const [createdRegId, setCreatedRegId] = useState<string>("");
  const [createdRegNumber, setCreatedRegNumber] = useState<string>("");
  const [paymentTransactionId, setPaymentTransactionId] = useState<string>("");
  const [verifiedAmount, setVerifiedAmount] = useState<number>(50);

  // Account creation state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  // Fee calculation: ISTE = ₹50, Non-ISTE = ₹100
  const fee = isIsteMember ? 50 : 100;

  // Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name for certificate is required";
    if (!email.trim() || !email.includes("@")) errs.email = "Valid email is required";
    if (!mobile.trim() || mobile.length < 10) errs.mobile = "10-digit mobile number is required";
    if (!rollNumber.trim()) errs.rollNumber = "Roll number is required";
    if (isIsteMember && !isteSmNumber.trim()) {
      errs.isteSmNumber = "ISTE Student Membership Number is required for discount";
    }
    if (linkedinUrl && !linkedinUrl.startsWith("http")) {
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

  // Step 2 -> 3: Razorpay Payment Simulation & Server Verification
  const handleInitiatePayment = () => {
    setIsProcessingPayment(true);

    // Save preliminary registration in store
    const { registration } = registerParticipant({
      name,
      email,
      mobile,
      rollNumber: rollNumber.toUpperCase(),
      year,
      branch,
      section,
      isteMember: isIsteMember,
      isteSmNumber: isIsteMember ? isteSmNumber : undefined,
      hasLaptop,
      linkedinPortfolio: linkedinUrl || undefined,
      fee,
    });

    setCreatedRegId(registration.id);
    setCreatedRegNumber(registration.registration_number);

    // Simulate Razorpay server order creation & checkout callback
    setTimeout(() => {
      const mockPayId = `pay_rzp_${Math.random().toString(36).substring(2, 9)}`;
      const mockOrderId = `order_${Math.random().toString(36).substring(2, 9)}`;
      const mockSig = `sig_${Math.random().toString(36).substring(2, 12)}`;

      // Complete payment & generate ticket on backend
      completePaymentAndIssueTicket(registration.id, {
        razorpayOrderId: mockOrderId,
        razorpayPaymentId: mockPayId,
        razorpaySignature: mockSig,
        amount: fee,
        paymentMethod: activePaymentMethod === "upi" ? "UPI (GPay / PhonePe / Paytm)" : "Card / NetBanking",
      });

      setPaymentTransactionId(mockPayId);
      setVerifiedAmount(fee);
      setIsProcessingPayment(false);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      setCurrentStep(3);
    }, 1500);
  };

  // Step 4: Account Creation Setup
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setAccountCreated(true);
    login(email, "user");

    // Celebrate and show digital ticket
    try {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
      });
    } catch {}

    setCurrentStep(5);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-6 sm:py-12 px-3 sm:px-6 lg:px-8 pb-16 sm:pb-24">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
            <span>Official Event Registration</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Prompt to Production
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Paytm AI Workshop • Department of IT & AI&DS, NBKRIST with ISTE
          </p>
        </div>

        {/* Mobile-Friendly Stepper (< sm) */}
        <div className="sm:hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                {currentStep}
              </span>
              <span>
                {currentStep === 1 && "Personal Information"}
                {currentStep === 2 && "Summary & Review"}
                {currentStep === 3 && "Payment Confirmed"}
                {currentStep === 4 && "Account Password Setup"}
                {currentStep === 5 && "Digital Event Ticket"}
              </span>
            </span>
            <span className="font-mono text-cyan-400 font-bold text-[11px]">
              Step {currentStep} of 5
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop Stepper (sm:flex) */}
        <div className="hidden sm:flex items-center justify-between max-w-xl mx-auto px-4">
          {[
            { step: 1, label: "Details" },
            { step: 2, label: "Summary" },
            { step: 3, label: "Payment" },
            { step: 4, label: "Account" },
            { step: 5, label: "Ticket" },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  currentStep >= item.step
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {currentStep > item.step ? <CheckCircle2 className="w-4 h-4" /> : item.step}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        {/* STEP 1: REGISTRATION FORM */}
        {currentStep === 1 && (
          <form
            onSubmit={handleProceedToSummary}
            className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-xl"
          >
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                <span>Personal Information</span>
              </h2>
              <p className="text-xs text-slate-400">
                Ensure details match your college records for certificate issuance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name for Certificate */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Name for Certificate *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manoj N"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
                {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email ID *
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@nbkrist.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
                {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
                {errors.mobile && <p className="text-[11px] text-rose-400 mt-1">{errors.mobile}</p>}
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22011A3142"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none uppercase"
                />
                {errors.rollNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.rollNumber}</p>}
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Year of Study *
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Branch *
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Section *
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>
            </div>

            {/* SECTION 15: ISTE INFORMATION */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Are you an ISTE Member? *
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => setIsIsteMember(true)}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                    isIsteMember
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  Yes (₹50 Fee)
                </button>
                <button
                  type="button"
                  onClick={() => setIsIsteMember(false)}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                    !isIsteMember
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  No (₹100 Fee)
                </button>
              </div>

              {/* Conditional ISTE Student Membership Number Field */}
              {isIsteMember && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <label className="block text-xs font-semibold text-cyan-300 mb-1">
                    ISTE Student Membership Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ISTE-STU-2023-8942"
                    value={isteSmNumber}
                    onChange={(e) => setIsteSmNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  />
                  {errors.isteSmNumber && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.isteSmNumber}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter your valid ISTE ID to claim the ₹50 subsidized ticket.
                  </p>
                </div>
              )}
            </div>

            {/* SECTION 16: LAPTOP INFORMATION */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Do you have a laptop for the hands-on session? *
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => setHasLaptop(true)}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                    hasLaptop
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  Yes, I have a laptop
                </button>
                <button
                  type="button"
                  onClick={() => setHasLaptop(false)}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                    !hasLaptop
                      ? "bg-slate-800 text-white border-slate-600"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  No laptop
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                This helps organizers arrange lab terminals and power extension cords for the AI Build Challenge.
              </p>
            </div>

            {/* SECTION 17: PROFESSIONAL PROFILE */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                LinkedIn Profile / Portfolio URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourname"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
              />
              {errors.linkedinUrl && (
                <p className="text-[11px] text-rose-400">{errors.linkedinUrl}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>CONTINUE TO REGISTRATION SUMMARY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: REGISTRATION SUMMARY & PAYMENT */}
        {currentStep === 2 && (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Registration Summary</h2>
                <p className="text-xs text-slate-400">Review your information before payment</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                Step 2 of 5
              </span>
            </div>

            {/* Summary Details Grid matching Section 18 */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/60 rounded-2xl p-5 border border-slate-800">
              <div>
                <span className="text-slate-400 block font-semibold">Name:</span>
                <span className="text-white font-bold text-sm">{name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Email:</span>
                <span className="text-white font-mono">{email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Roll Number:</span>
                <span className="text-cyan-300 font-mono font-bold">{rollNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Branch:</span>
                <span className="text-white font-medium">{branch}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Year & Section:</span>
                <span className="text-white font-medium">{year} • Sec {section}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">ISTE Member:</span>
                <span className={`font-bold ${isIsteMember ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {isIsteMember ? `Yes (${isteSmNumber})` : "No"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Laptop:</span>
                <span className="text-white">{hasLaptop ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Mobile:</span>
                <span className="text-white font-mono">{mobile}</span>
              </div>
            </div>

            {/* Dynamic Fee Box */}
            <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 rounded-2xl p-5 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-cyan-300 font-bold uppercase tracking-wider block">
                  Registration Fee
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isIsteMember ? "ISTE Student Member Subsidized Rate" : "Standard Non-ISTE Rate"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-white">₹{fee}</span>
                <span className="text-[10px] text-emerald-400 block font-medium">All taxes included</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Select Razorpay Payment Gateway Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActivePaymentMethod("upi")}
                  className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    activePaymentMethod === "upi"
                      ? "bg-blue-500/20 text-blue-300 border-blue-400 shadow-md shadow-blue-500/20"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>UPI (GPay / PhonePe / Paytm)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePaymentMethod("card")}
                  className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    activePaymentMethod === "card"
                      ? "bg-blue-500/20 text-blue-300 border-blue-400 shadow-md shadow-blue-500/20"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span>Debit / Credit Card / NetBanking</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs"
              >
                Back to Edit
              </button>

              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleInitiatePayment}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>VERIFYING RAZORPAY SIGNATURE...</span>
                  </>
                ) : (
                  <>
                    <span>PAY ₹{fee} VIA RAZORPAY</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT SUCCESS */}
        {currentStep === 3 && (
          <div className="rounded-3xl bg-slate-900 border border-emerald-500/40 p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Payment Successful</h2>
              <p className="text-xs text-slate-400 mt-1">
                Server-side payment signature verified and registration recorded.
              </p>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono text-cyan-300 font-bold break-all">{paymentTransactionId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-white">₹{verifiedAmount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Registration Status:</span>
                <span className="font-bold text-emerald-400">Confirmed</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Registration ID:</span>
                <span className="font-mono text-white font-bold">{createdRegNumber}</span>
              </div>
            </div>

            <div className="pt-2 pb-2">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/30 transition-all inline-flex items-center justify-center gap-2 active:scale-98"
              >
                <span>SETUP LOGIN ACCOUNT (PASSWORD)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: LOGIN CREDENTIAL CREATION (Section 21) */}
        {currentStep === 4 && (
          <form
            onSubmit={handleCreateAccount}
            className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl max-w-md mx-auto"
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white">Create Your Account</h2>
              <p className="text-xs text-slate-400">
                Secure your dashboard access to download ticket, access resources, and submit projects.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Email (Pre-filled from Registration)
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono cursor-not-allowed opacity-80"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>CREATE ACCOUNT & GENERATE TICKET</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 5: TICKET GENERATED */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Account Setup Complete</span>
              </div>
              <h2 className="text-2xl font-black text-white">Here is Your Digital Event Ticket</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Save this ticket to your Apple / Google Wallet or download the calendar event with 30-minute reminder.
              </p>
            </div>

            {/* Digital Ticket Card */}
            <TicketCard
              registrationId={createdRegNumber || "P2P-2026-A8F92X"}
              name={name || "Manoj N"}
              rollNumber={rollNumber || "22011A3142"}
              branch={branch || "AI & DS"}
              year={year}
              section={section}
              isteMember={isIsteMember}
              status="Confirmed"
            />

            <div className="text-center pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-cyan-500/25"
              >
                <span>ENTER PARTICIPANT DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
