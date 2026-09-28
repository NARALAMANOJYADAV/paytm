"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Code,
  Cpu,
  Brain,
  Zap,
  Users,
  Award,
  Laptop,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Gift,
  Flame,
  Layers,
  ShieldCheck,
  Building,
  Target,
  Smartphone,
  Maximize2,
  X,
  QrCode,
  Check,
  Share2,
  Sun,
  Rocket,
  Coffee,
  Utensils,
  Download
} from "lucide-react";
import { loadStore } from "@/lib/store";
import { generateQrDataUrl } from "@/lib/qr";
import { downloadIcsFile } from "@/lib/ics";

function LinkedInIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.3a1.5 1.5 0 0 0-1.5 1.5c0 .83.67 1.5 1.5 1.5a1.5 1.5 0 0 0 1.5-1.5c0-.83-.67-1.5-1.5-1.5Z" />
    </svg>
  );
}

export default function HomePage() {
  const [seatsLeft, setSeatsLeft] = useState(18);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [heroViewMode, setHeroViewMode] = useState<"poster" | "mobile">("poster");
  const [posterModalOpen, setPosterModalOpen] = useState(false);
  const [speakerModal, setSpeakerModal] = useState<{
    name: string;
    role: string;
    image: string;
  } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    generateQrDataUrl("P2P-2026-00042").then(url => setQrDataUrl(url));

    const store = loadStore();
    const registeredCount = store.registrations.filter(r => r.payment_status === "success").length;
    setSeatsLeft(Math.max(0, store.eventConfig.capacity - registeredCount));

    // Target date: September 30, 2026 09:00:00 IST
    const targetDate = new Date("2026-09-30T09:00:00+05:30").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const highlights = [
    { title: "Generative AI", desc: "Core foundation of LLMs, multimodal systems, and real-world architectures.", icon: Brain, color: "from-cyan-500 to-blue-500" },
    { title: "Prompt Engineering", desc: "Few-shot, ReAct frameworks, structured JSON schemas & function calling.", icon: Code, color: "from-blue-500 to-indigo-500" },
    { title: "AI-Assisted Dev", desc: "Copilots, agentic tooling, and accelerating prototype development 10x.", icon: Zap, color: "from-indigo-500 to-violet-500" },
    { title: "Hands-on AI Build", desc: "Live 90-minute hackathon build challenge with mentor assistance.", icon: Laptop, color: "from-cyan-500 to-teal-500" },
    { title: "Industry Interaction", desc: "Live sessions with engineering leadership from Paytm & Microsoft.", icon: Users, color: "from-teal-500 to-emerald-500" },
    { title: "Team Collaboration", desc: "Form teams of up to 4 peers to brainstorm, build, and pitch solutions.", icon: Target, color: "from-blue-500 to-cyan-500" },
    { title: "Project Demonstration", desc: "Showcase your functional AI application to faculty & peer audience.", icon: Layers, color: "from-violet-500 to-purple-500" },
    { title: "Surprise Prizes", desc: "Cash awards, merchandise, and certificates of merit for top teams.", icon: Gift, color: "from-amber-400 to-orange-500" },
  ];

  const learningTopics = [
    { title: "Generative AI Fundamentals", desc: "Understanding transformer architectures, tokenization, embeddings, and context windows." },
    { title: "Prompt Engineering Mastery", desc: "Zero-shot, Few-shot, Chain-of-Thought, and system prompt guardrailing techniques." },
    { title: "AI-Assisted Development", desc: "Utilizing modern AI developer environments, automated test generation, and refactoring." },
    { title: "Rapid Prototyping", desc: "Going from idea to running MVP within hours using modern full-stack frameworks." },
    { title: "AI Application Development", desc: "Integrating streaming LLM responses, vector search, and API integrations." },
    { title: "Team-Based Development", desc: "Collaborative Git workflows, task delegation, and effective sprint execution." },
    { title: "Project Demonstration", desc: "Structuring impactful tech pitches, live demo defense, and value articulation." },
    { title: "Production-Oriented AI", desc: "Latency optimization, cost management, safety guardrails, and model evaluation." },
  ];

  const scheduleDay1 = [
    { time: "9:00 – 9:15 AM", title: "Registration and Seating", category: "Check-in", desc: "Desk opens at 8:45 AM. QR badge verification and workshop kit distribution." },
    { time: "9:15 – 9:25 AM", title: "Welcome Address", category: "Inauguration", desc: "Opening remarks by Head of Department, IT & AI&DS, NBKRIST." },
    { time: "9:25 – 9:35 AM", title: "Prompt to Production Introduction", category: "Orientation", desc: "Overview of workshop goals, day agenda, and ISTE collaboration." },
    { time: "9:35 – 10:50 AM", title: "Expert Session – Mr. Suman Mandal", category: "Keynote 1", desc: "Head of Partnerships & AI Workshops, Paytm. Deep dive into Generative AI in Production (1h 15m virtual masterclass)." },
    { time: "10:50 – 11:00 AM", title: "Interaction / Q&A", category: "Interactive", desc: "Open floor Q&A with Mr. Suman Mandal on industry practices and career pathways." },
    { time: "11:00 – 11:15 AM", title: "Tea Break & Networking", category: "Break", desc: "Refreshments provided in the foyer." },
    { time: "11:15 AM – 12:30 PM", title: "Expert Session – Mr. Shivam Behl", category: "Keynote 2", desc: "SDE-II at Microsoft. Advanced AI-Assisted Development & Agentic Systems (1h 15m masterclass)." },
    { time: "12:30 – 12:40 PM", title: "Q&A Session", category: "Interactive", desc: "Direct interactive discussion with Mr. Shivam Behl." },
    { time: "12:40 – 1:30 PM", title: "Lunch Break", category: "Dining", desc: "Special lunch provided for all registered participants at New CSE Block dining hall." },
    { time: "1:30 – 1:45 PM", title: "Build Challenge Introduction", category: "Hackathon", desc: "Problem statement reveal, judging criteria announcement, and sandbox API distribution." },
    { time: "1:45 – 3:15 PM", title: "Hands-on AI Build", category: "Hackathon", desc: "Intensive 90-minute hands-on build challenge in teams. Faculty and mentors on floor." },
    { time: "3:15 – 3:45 PM", title: "Project Demonstrations & Submissions", category: "Showcase", desc: "Live project demonstrations, testing, and team code repository submissions." },
    { time: "3:45 – 4:00 PM", title: "Day 1 Wrap-up & Briefing", category: "Wrap-up", desc: "Review of Day 1 code submissions and briefing for next day's Grand Finale." },
  ];

  const scheduleDay2 = [
    { time: "10:00 – 11:30 AM", title: "Jury Evaluation", category: "Judging", desc: "Grand jury panel evaluation on Innovation, Prompting, Technical Execution, and Presentation." },
    { time: "11:30 AM – 12:30 PM", title: "Prize Distribution & Vote of Thanks", category: "Grand Finale", desc: "Awarding winner & runner-up trophies, surprise cash awards, certificates of merit, mementos, and closing remarks." },
  ];

  const faqs = [
    {
      q: "Who is eligible to participate in the Prompt to Production workshop?",
      a: "Engineering students across all branches (AI&DS, IT, CSE, ECE, EEE, Mech, Civil) of NBKRIST are eligible. The content is tailored to bring beginners up to speed and provide advanced takeaways for experienced builders."
    },
    {
      q: "What are the registration fees for ISTE vs Non-ISTE members?",
      a: "ISTE Student Members pay a subsidized fee of ₹50. Non-ISTE participants pay ₹100. Verification of ISTE membership is verified using your Student Membership number."
    },
    {
      q: "What should I bring to the workshop?",
      a: "Please bring your laptop with charger, extension board (optional), college ID card, and your digital event ticket (accessible on your phone or printed pass)."
    },
    {
      q: "How does the team formation work for the Build Challenge?",
      a: "Teams can have 1 to 4 members. You can create or join a team using an invite code directly from your participant dashboard before or during the lunch break."
    },
    {
      q: "Will I receive an official certificate?",
      a: "Yes! All verified participants receive an official Certificate of Participation recognized by NBKRIST and ISTE with online QR verification. Winners will receive Certificates of Merit along with surprise cash awards."
    },
    {
      q: "What happens after I complete payment via Razorpay?",
      a: "Immediately upon successful payment, you will set up your password, your registration is confirmed, and your unique digital QR ticket with Apple/Google wallet and calendar reminders is generated."
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* HERO SECTION */}
      <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-6 sm:pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        {/* Futuristic glowing gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none"></div>
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 -right-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto w-full flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Mobile-Only Top Visual Showcase: Appears FIRST on phones */}
          <div className="w-full lg:hidden flex flex-col items-center">
            {/* View Switcher Pill */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-lg mb-3">
              <button
                type="button"
                onClick={() => setHeroViewMode("poster")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  heroViewMode === "poster"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Official Poster
              </button>
              <button
                type="button"
                onClick={() => setHeroViewMode("mobile")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  heroViewMode === "mobile"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Pass</span>
              </button>
            </div>

            {/* Mobile Visual Container */}
            {heroViewMode === "poster" ? (
              <div 
                onClick={() => setPosterModalOpen(true)}
                className="w-full relative group rounded-2xl overflow-hidden bg-slate-900 border border-cyan-500/40 shadow-2xl cursor-pointer"
              >
                <div className="relative w-full aspect-[16/9] bg-slate-950">
                  <Image
                    src="/images/poster.jpg"
                    alt="Prompt to Production - Paytm AI Workshop Official Poster"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 text-cyan-300 border border-cyan-500/30 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5" /> Tap to view full screen
                    </span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-300">
                    Conducted by <strong className="text-cyan-400">Paytm ❤️ Ai</strong>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" /> Zoom
                  </span>
                </div>
              </div>
            ) : (
              /* Mobile View / Smartphone Mockup */
              <div className="w-[300px] rounded-[36px] border-[5px] border-slate-700 bg-slate-950 p-3 shadow-2xl shadow-cyan-500/20 relative animate-in fade-in duration-300">
                {/* Dynamic island notch */}
                <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700"></div>
                </div>
                {/* Mini mobile screen header */}
                <div className="text-center pb-2 border-b border-slate-800/80">
                  <div className="text-[9px] font-bold uppercase text-cyan-400 tracking-wider">
                    Prompt to Production Pass
                  </div>
                  <div className="text-xs font-black text-white">NBKRIST • Paytm AI</div>
                </div>
                {/* Mini Ticket Card */}
                <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/40 text-center space-y-2">
                  <div className="flex justify-between items-center text-[9px] text-slate-400">
                    <span className="font-mono text-cyan-300">#P2P-2026-00042</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">PAID ₹50</span>
                  </div>
                  <div className="py-1">
                    <div className="text-sm font-black text-white">Manoj Narala</div>
                    <div className="text-[10px] text-slate-400">23KB1A3064 • AI & DS (4th Year)</div>
                  </div>
                  <div className="w-24 h-24 mx-auto bg-white rounded-lg p-1.5 flex items-center justify-center shadow-md">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Ticket"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-cyan-400 font-mono text-[9px] font-bold">
                        P2P QR
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-300 pt-1">
                    📍 Seminar Hall, New CSE Block
                  </div>
                  <Link
                    href="/dashboard"
                    className="block w-full py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow"
                  >
                    Open Live Mobile Pass
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Left Column: Details (Main Content) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Institution Badge */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-300 shadow-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="font-bold text-cyan-300">N.B.K.R. INSTITUTE OF SCIENCE & TECHNOLOGY</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">DEPARTMENT OF IT & AI&DS</span>
              <span className="text-slate-400">•</span>
              <span className="text-blue-400 font-semibold">ISTE</span>
            </div>

            {/* Title & Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.05]">
                PROMPT TO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                  PRODUCTION
                </span>
              </h1>
              <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
                <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-300 font-extrabold text-sm sm:text-base tracking-wider uppercase">
                  Paytm AI Workshop
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Conducted by Paytm ❤️ Ai
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Master state-of-the-art Generative AI and prompt engineering directly from Paytm and Microsoft software leaders. Build, collaborate, and compete in our hands-on AI Build Challenge.
            </p>

            {/* Event Key Badges: Date, Time, Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-xl mx-auto lg:mx-0 text-left">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Date</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">30 Sept 2026</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
                <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Time</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">9:00 AM – 4:00 PM</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Venue</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">Seminar Hall, New CSE</div>
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-slate-900/90 border border-cyan-500/20 rounded-2xl p-4 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  Workshop Countdown
                </span>
                <span className="text-[11px] font-medium text-emerald-400">
                  {seatsLeft} Seats Remaining of 100
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800">
                  <span className="font-mono text-xl sm:text-2xl font-black text-white">{timeLeft.days}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Days</span>
                </div>
                <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800">
                  <span className="font-mono text-xl sm:text-2xl font-black text-white">{timeLeft.hours}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Hours</span>
                </div>
                <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800">
                  <span className="font-mono text-xl sm:text-2xl font-black text-white">{timeLeft.minutes}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Mins</span>
                </div>
                <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800">
                  <span className="font-mono text-xl sm:text-2xl font-black text-cyan-400">{timeLeft.seconds}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Secs</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>REGISTER NOW</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="#schedule"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm tracking-wide transition-all"
              >
                <span>VIEW SCHEDULE</span>
              </Link>
            </div>

            {/* Fee Note */}
            <p className="text-xs text-slate-400">
              Registration Fee: <span className="text-emerald-400 font-bold">₹50 for ISTE Members</span> • <span className="text-slate-300 font-bold">₹100 for Non-ISTE</span>
            </p>
          </div>

          {/* Right Column: Visual Poster / Mobile Pass Showcase (Desktop view) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center">
            {/* View Switcher Controls */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-700 shadow-lg mb-4">
              <button
                type="button"
                onClick={() => setHeroViewMode("poster")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  heroViewMode === "poster"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Official Poster
              </button>
              <button
                type="button"
                onClick={() => setHeroViewMode("mobile")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  heroViewMode === "mobile"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Pass View</span>
              </button>
            </div>

            {heroViewMode === "poster" ? (
              <div className="relative group w-full max-w-md">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition duration-500"></div>
                
                <div 
                  onClick={() => setPosterModalOpen(true)}
                  className="relative rounded-2xl overflow-hidden bg-slate-900 border border-cyan-500/40 shadow-2xl cursor-pointer"
                >
                  <div className="relative w-full aspect-[16/9] bg-slate-950">
                    <Image
                      src="/images/poster.jpg"
                      alt="Prompt to Production - Paytm AI Workshop Official Poster"
                      fill
                      sizes="480px"
                      priority
                      className="object-contain group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/90 text-cyan-300 border border-cyan-500/40 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-2xl">
                        <Maximize2 className="w-3.5 h-3.5" /> Click to view full poster
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">Official Event Poster</span>
                      <span className="text-slate-400 text-[10px]">Conducted by Paytm ❤️ Ai</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPosterModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold hover:bg-cyan-500/20 transition-colors"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Full Poster</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Realistic Smartphone Mockup Showcase */
              <div className="w-[320px] rounded-[44px] border-[6px] border-slate-700 bg-slate-950 p-3.5 shadow-2xl shadow-cyan-500/20 relative animate-in fade-in zoom-in-95 duration-300">
                {/* Dynamic island notch */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700"></div>
                </div>

                {/* Mobile screen content */}
                <div className="space-y-3">
                  <div className="text-center pb-2 border-b border-slate-800/80">
                    <div className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">
                      Prompt to Production
                    </div>
                    <div className="text-xs font-black text-white">Official Mobile Pass</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-cyan-950/50 via-slate-900 to-slate-950 border border-cyan-500/40 text-center space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-mono text-cyan-300">#P2P-2026-00042</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">PAID ₹50</span>
                    </div>

                    <div>
                      <div className="text-base font-black text-white">Manoj Narala</div>
                      <div className="text-[11px] text-slate-400">23KB1A3064 • AI & DS (4th Year)</div>
                    </div>

                    <div className="w-28 h-28 mx-auto bg-white rounded-xl p-2 shadow-lg flex items-center justify-center">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-cyan-400 font-mono text-[10px] font-bold">
                          P2P QR
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-300">
                      📍 Seminar Hall, New CSE Block
                    </div>

                    <div className="pt-1">
                      <Link
                        href="/dashboard"
                        className="block w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all active:scale-95"
                      >
                        Open Live Pass Portal
                      </Link>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-500">
                    Auto-synced with Apple & Google Wallet
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FULL POSTER LIGHTBOX MODAL */}
      {posterModalOpen && (
        <div 
          onClick={() => setPosterModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-slate-900 rounded-2xl border border-cyan-500/50 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
          >
            <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Workshop on PROMPT TO PRODUCTION — Official Poster
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-400">
                  N.B.K.R. Institute of Science & Technology • Department of IT & AI&DS
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPosterModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 min-h-[300px] sm:min-h-[500px] w-full bg-black overflow-auto p-2 flex items-center justify-center">
              <Image
                src="/images/poster.jpg"
                alt="Prompt to Production Official Poster Full View"
                width={1200}
                height={675}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            </div>

            <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 text-xs">
                Wednesday, 30 September 2026 • 9:00 AM • Seminar Hall, New CSE Block
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="/images/poster.jpg"
                  download="P2P-Paytm-AI-Workshop-Poster.jpg"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
                >
                  Download Poster
                </a>
                <Link
                  href="/register"
                  onClick={() => setPosterModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/25 transition-all"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL FOR SPEAKER FULL UNCHOPPED PHOTO */}
      {speakerModal && (
        <div 
          role="dialog"
          aria-modal="true"
          onClick={() => setSpeakerModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-slate-900 rounded-3xl border border-cyan-500/50 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          >
            <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  {speakerModal.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-cyan-400 font-semibold">
                  {speakerModal.role}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={speakerModal.image}
                  download={`${speakerModal.name.replace(/[^a-zA-Z0-9]/g, "_")}.png`}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Download Photo"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setSpeakerModal(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Close Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 min-h-[380px] sm:min-h-[500px] w-full bg-slate-950 p-3 flex items-center justify-center">
              <Image
                src={speakerModal.image}
                alt={speakerModal.name}
                fill
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-contain p-2"
                priority
              />
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-400">
                Official Speaker Portrait • Prompt to Production 2026 • Click anywhere outside to close
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 9: EVENT HIGHLIGHTS */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Comprehensive Immersion</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              EVENT HIGHLIGHTS
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Carefully engineered to bridge classroom AI theory with production-grade engineering practices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="relative group rounded-2xl bg-slate-900/60 border border-slate-800 p-6 hover:border-cyan-500/40 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} p-[1px] shadow-lg flex items-center justify-center`}>
                      <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                        <IconComp className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-800/60 mt-4 flex items-center text-[11px] font-semibold text-cyan-400 opacity-80 group-hover:opacity-100">
                    <span>Feature 0{idx + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 10: KEYNOTE SPEAKERS */}
      <section id="speakers" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Industry Leadership</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              KEYNOTE SPEAKERS
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Learn directly from distinguished tech leaders driving AI development at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Speaker 1: Mr. Suman Mandal */}
            <div className="relative group rounded-3xl bg-slate-900/90 border border-cyan-500/30 overflow-hidden shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-12 flex-1">
                <div 
                  onClick={() => setSpeakerModal({
                    name: "Mr. Suman Mandal",
                    role: "Head of Partnerships & AI Workshops, Paytm",
                    image: "/images/suman_mandal.png"
                  })}
                  className="sm:col-span-5 relative min-h-[340px] sm:min-h-[420px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-3 flex flex-col items-center justify-center cursor-pointer group/img"
                  title="Click to view full photo"
                >
                  <div className="relative w-full h-full min-h-[320px] sm:min-h-[400px]">
                    <Image
                      src="/images/suman_mandal.png"
                      alt="Mr. Suman Mandal - Program Lead, Paytm"
                      fill
                      sizes="(max-width: 640px) 100vw, 360px"
                      className="object-contain object-bottom group-hover/img:scale-[1.02] transition-transform duration-300 drop-shadow-2xl"
                      priority
                    />
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-slate-950/85 border border-slate-700/80 text-[10px] font-bold text-cyan-300 flex items-center gap-1 opacity-90 group-hover/img:opacity-100 shadow-lg backdrop-blur-sm">
                    <Maximize2 className="w-3 h-3 text-cyan-400" />
                    <span>View Full Image</span>
                  </div>
                </div>

                <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Keynote Speaker • Paytm
                      </div>
                      <a
                        href="https://www.linkedin.com/in/suman-mandal-join/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-semibold transition-all group/link"
                        title="View Suman Mandal on LinkedIn"
                      >
                        <LinkedInIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover/link:text-blue-300" />
                      </a>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white">
                        Mr. Suman Mandal
                      </h3>
                      <p className="text-sm font-bold text-cyan-400">
                        Head of Partnerships & AI Workshops, Paytm
                      </p>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        About Speaker
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Leads strategic nationwide developer partnerships and AI workshops at Paytm, driving student and engineer empowerment in Agentic AI, Computer Vision, and production deployment architectures. An accomplished cybersecurity researcher and ethical hacker who has presented at international forums including THREAT CON on ML-driven automated security systems and CAPTCHA bypass mechanisms, with recognized vulnerability disclosures across premier tech platforms.
                      </p>
                    </div>

                    {/* Expertise Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["Agentic AI", "Computer Vision", "AI Security", "Paytm Platforms"].map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-medium text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-xs space-y-1.5 text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Format:</span>
                      <span className="text-cyan-300 font-medium">Virtual Interactive Masterclass</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Duration:</span>
                      <span className="text-white font-mono font-bold">1 Hour 15 Minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Session:</span>
                      <span className="text-slate-200">Day 1 • 9:35 AM – 10:50 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Speaker 2: Mr. Shivam Behl */}
            <div className="relative group rounded-3xl bg-slate-900/90 border border-cyan-500/30 overflow-hidden shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-12 flex-1">
                <div 
                  onClick={() => setSpeakerModal({
                    name: "Mr. Shivam Behl",
                    role: "Software Development Engineer II (SDE-II), Microsoft",
                    image: "/images/shivam_behl.png"
                  })}
                  className="sm:col-span-5 relative min-h-[340px] sm:min-h-[420px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-3 flex flex-col items-center justify-center cursor-pointer group/img"
                  title="Click to view full photo"
                >
                  <div className="relative w-full h-full min-h-[320px] sm:min-h-[400px]">
                    <Image
                      src="/images/shivam_behl.png"
                      alt="Mr. Shivam Behl - SDE-II, Microsoft"
                      fill
                      sizes="(max-width: 640px) 100vw, 360px"
                      className="object-contain object-bottom group-hover/img:scale-[1.02] transition-transform duration-300 drop-shadow-2xl"
                      priority
                    />
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-slate-950/85 border border-slate-700/80 text-[10px] font-bold text-cyan-300 flex items-center gap-1 opacity-90 group-hover/img:opacity-100 shadow-lg backdrop-blur-sm">
                    <Maximize2 className="w-3 h-3 text-cyan-400" />
                    <span>View Full Image</span>
                  </div>
                </div>

                <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Keynote Speaker • Microsoft
                      </div>
                      <a
                        href="https://www.linkedin.com/in/shivam1103/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-semibold transition-all group/link"
                        title="View Shivam Behl on LinkedIn"
                      >
                        <LinkedInIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover/link:text-blue-300" />
                      </a>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white">
                        Mr. Shivam Behl
                      </h3>
                      <p className="text-sm font-bold text-cyan-400">
                        Software Development Engineer II (SDE-II), Microsoft
                      </p>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        About Speaker
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Software Development Engineer (SDE-II) at Microsoft (TIET alumnus, 2021) building resilient cloud services and high-throughput distributed systems. Specializes in cloud infrastructure, agentic workflows, sentiment analysis, and explainable AI (XAI). A dedicated technical mentor who has empowered thousands of aspiring engineers on Data Structures, Algorithms, scalable System Design, and succeeding in tier-1 product engineering roles.
                      </p>
                    </div>

                    {/* Expertise Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["Distributed Cloud", "Agentic Workflows", "System Design", "Developer Velocity"].map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-medium text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-xs space-y-1.5 text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Format:</span>
                      <span className="text-cyan-300 font-medium">Virtual Interactive Masterclass</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Duration:</span>
                      <span className="text-white font-mono font-bold">1 Hour 15 Minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Session:</span>
                      <span className="text-slate-200">Day 1 • 11:15 AM – 12:30 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION: INSTITUTIONAL PATRONS & ORGANIZING LEADERSHIP (From Official Poster) */}
      <section id="leadership" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Institutional Leadership</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              PATRONS & ORGANIZING COMMITTEE
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Organized by Department of IT and AI&DS, N.B.K.R. Institute of Science & Technology in association with ISTE.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2 hover:border-cyan-500/30 transition-all">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 font-bold text-sm">
                NR
              </div>
              <h3 className="text-base font-extrabold text-white">Sri. N. Ramkumar</h3>
              <p className="text-xs text-cyan-400 font-semibold">Correspondent</p>
              <p className="text-[11px] text-slate-400">N.B.K.R. Institute of Science & Technology</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2 hover:border-cyan-500/30 transition-all">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 font-bold text-sm">
                MS
              </div>
              <h3 className="text-base font-extrabold text-white">Dr. M. Sreenivasulu</h3>
              <p className="text-xs text-blue-400 font-semibold">Principal (i/c)</p>
              <p className="text-[11px] text-slate-400">N.B.K.R. Institute of Science & Technology</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2 hover:border-cyan-500/30 transition-all">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 font-bold text-sm">
                AN
              </div>
              <h3 className="text-base font-extrabold text-white">Dr. A. Narayana Rao</h3>
              <p className="text-xs text-indigo-400 font-semibold">HOD, Department of IT & AI&DS</p>
              <p className="text-[11px] text-slate-400">Program Convener</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2 hover:border-cyan-500/30 transition-all">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 font-bold text-sm">
                SR
              </div>
              <h3 className="text-base font-extrabold text-white">Mr. M. Sivapratap Reddy</h3>
              <p className="text-xs text-emerald-400 font-semibold">Program Coordinator</p>
              <p className="text-[11px] text-slate-400">Department of IT & AI&DS</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11: WHAT YOU WILL LEARN */}
      <section id="learn" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              <span>Curriculum & Takeaways</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              WHAT YOU WILL LEARN
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              A progressive 8-tier curriculum taking you from foundational prompt mechanics to full production readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningTopics.map((topic, i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 hover:border-cyan-500/30 transition-all space-y-3"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-bold text-white text-base">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {topic.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 12: EVENT SCHEDULE (2-DAY TIMELINE: WORKSHOP & NEXT DAY FINALE) */}
      <section id="schedule" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>2-Day Event Schedule</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              EVENT SCHEDULE
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              Wednesday, 30 September 2026 & Thursday, 1 October 2026 (Next Day) • Seminar Hall, New CSE Block, NBKRIST
            </p>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => downloadIcsFile()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Add Workshop to Calendar (.ics)</span>
              </button>
            </div>
          </div>

          {/* Side by Side Grid: Day 1 vs Day 2 (Next Day) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* COLUMN 1: Day 1 - Wednesday, 30 September 2026 */}
            <div className="rounded-3xl bg-slate-900/70 border border-cyan-500/30 p-5 sm:p-7 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Day 1 • Wednesday, 30 Sep 2026 • 9:00 AM – 4:00 PM</span>
                    <h3 className="text-lg font-black text-white">Workshop & AI Build Hackathon</h3>
                  </div>
                </div>
                <span className="hidden sm:inline px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold">
                  {scheduleDay1.length} Sessions
                </span>
              </div>

              <div className="relative border-l-2 border-cyan-500/30 ml-3 sm:ml-4 space-y-4">
                {scheduleDay1.map((item, index) => {
                  const isKeynote = item.category.includes("Keynote");
                  const isBreak = item.category === "Break" || item.category === "Dining";
                  const isHackathon = item.category === "Hackathon";

                  return (
                    <div key={index} className="relative pl-5 sm:pl-6 group">
                      {/* Timeline node */}
                      <div className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 transition-all ${
                        isKeynote 
                          ? "bg-cyan-400 border-white ring-4 ring-cyan-500/20" 
                          : isHackathon
                          ? "bg-purple-400 border-white ring-4 ring-purple-500/20"
                          : isBreak
                          ? "bg-amber-400 border-slate-900"
                          : "bg-slate-950 border-cyan-400 group-hover:bg-cyan-400"
                      }`}></div>

                      <div className={`rounded-xl p-3.5 sm:p-4 border transition-all ${
                        isKeynote
                          ? "bg-cyan-950/30 border-cyan-500/40 shadow-md shadow-cyan-500/10"
                          : isHackathon
                          ? "bg-purple-950/30 border-purple-500/40 shadow-md shadow-purple-500/10"
                          : isBreak
                          ? "bg-amber-950/20 border-amber-500/30"
                          : "bg-slate-950/60 border-slate-800/80 hover:border-cyan-500/30"
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                          <span className="font-mono text-xs font-extrabold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20">
                            {item.time}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            isKeynote 
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" 
                              : isHackathon
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : isBreak
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-slate-800 text-slate-300"
                          }`}>
                            {item.category}
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-sm sm:text-base">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Day 1 Callout Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-black text-white block">90-Minute Live Build Challenge</span>
                  <span className="text-slate-400 text-[11px]">Teams of 1–4 • Mentors on floor • Live API sandboxes</span>
                </div>
                <Link
                  href="/register"
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] uppercase tracking-wider transition-all"
                >
                  Register Now
                </Link>
              </div>
            </div>

            {/* COLUMN 2: Day 2 (Next Day) - Thursday, 1 October 2026 */}
            <div className="rounded-3xl bg-slate-900/70 border border-amber-500/30 p-5 sm:p-7 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Day 2 (Next Day) • Thursday, 1 Oct 2026 • 10:00 AM – 12:30 PM</span>
                    <h3 className="text-lg font-black text-white">Grand Finale: Jury Evaluation & Awards</h3>
                  </div>
                </div>
                <span className="hidden sm:inline px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold">
                  Grand Finale
                </span>
              </div>

              <div className="relative border-l-2 border-amber-500/30 ml-3 sm:ml-4 space-y-5">
                {scheduleDay2.map((item, index) => {
                  const isFinale = item.category === "Grand Finale";

                  return (
                    <div key={index} className="relative pl-5 sm:pl-6 group">
                      {/* Timeline node */}
                      <div className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 transition-all ${
                        isFinale 
                          ? "bg-amber-400 border-white ring-4 ring-amber-500/20" 
                          : "bg-indigo-400 border-white ring-4 ring-indigo-500/20"
                      }`}></div>

                      <div className={`rounded-xl p-4 sm:p-5 border transition-all ${
                        isFinale
                          ? "bg-gradient-to-br from-amber-950/30 via-slate-900 to-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/10"
                          : "bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-500/40"
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                          <span className="font-mono text-xs font-extrabold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/20">
                            {item.time}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${
                            isFinale 
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                              : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          }`}>
                            {item.category}
                          </span>
                        </div>

                        <h4 className="font-black text-white text-base sm:text-lg">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grand Finale Callout Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-yellow-950/30 border border-amber-500/40 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Grand Valedictory & Prize Distribution</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Join institutional dignitaries, keynote faculty, and fellow student engineers for the ceremonial award distribution, memento presentation, and crowning of the hackathon champions.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-amber-200/90 font-mono">
                  <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30">🏆 Winner & Runner-up Trophies</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30">💰 Surprise Cash Awards</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION: BUILD CHALLENGE & PRIZES */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Competition & Awards</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              HANDS-ON AI BUILD CHALLENGE
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Apply prompt engineering and generative agents live. Form a team of up to 4 peers, build a prototype within 90 minutes, and pitch to judges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-900 border border-amber-500/30 p-6 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 mx-auto flex items-center justify-center font-black text-amber-400 text-lg">
                1st
              </div>
              <h3 className="font-black text-white text-lg">Winner - AI Build Challenge</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cash prize, Paytm developer goodies, 1st Place Certificate of Merit, and fast-track mentorship opportunities.
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-900 border border-slate-700 p-6 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-700/40 border border-slate-400/40 mx-auto flex items-center justify-center font-black text-slate-200 text-lg">
                2nd
              </div>
              <h3 className="font-black text-white text-lg">Runner Up</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cash prize, 2nd Place Certificate of Merit, and official recognition from NBKRIST IT & AI&DS department.
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-b from-cyan-950/30 to-slate-900 border border-cyan-500/30 p-6 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/40 mx-auto flex items-center justify-center font-black text-cyan-400 text-lg">
                All
              </div>
              <h3 className="font-black text-white text-lg">Participation Credentials</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every verified participant receives a tamper-evident digital certificate with unique verification QR recognized by ISTE.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900/60 border-b border-slate-800/80">
        <div className="max-w-3xl mx-auto space-y-10">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Everything you need to know about the registration, payment, and workshop day.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = faqOpen === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 text-white font-bold text-sm sm:text-base focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION: VENUE & CONTACT */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              <span>Campus Venue</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              SEMINAR HALL, NEW CSE BLOCK
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Equipped with high-definition projection, multi-directional audio, dedicated charging docks for student laptops, and high-speed campus Wi-Fi network.
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span>N.B.K.R. Institute of Science & Technology, Vidyanagar - 524413, Tirupati District, A.P.</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span>Wednesday, 30 September 2026 (9:00 AM – 4:00 PM)</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 space-y-6 text-center">
            <h3 className="text-xl font-black text-white">
              Ready to build the future of AI?
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Limited to 100 students to ensure hands-on mentorship during the build challenge. Claim your seat before registration closes.
            </p>

            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-cyan-500/25 hover:from-cyan-300 hover:to-blue-400 transition-all active:scale-95"
              >
                <span>REGISTER NOW (₹50 / ₹100)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
