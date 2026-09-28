"use client";

import React from "react";
import { Clock, Calendar, MapPin, Sparkles, Video, Coffee, Utensils, Award, Sun, Trophy } from "lucide-react";
import { downloadIcsFile } from "@/lib/ics";

export default function SchedulePage() {
  const day1MorningItems = [
    { time: "9:00 – 9:15 AM", title: "Registration and Seating", category: "Check-in", type: "onsite", desc: "Desk opens at 8:45 AM. QR badge verification and workshop kit distribution." },
    { time: "9:15 – 9:25 AM", title: "Welcome Address", category: "Inauguration", type: "keynote", desc: "Opening remarks by Head of Department, IT & AI&DS, NBKRIST." },
    { time: "9:25 – 9:35 AM", title: "Prompt to Production Introduction", category: "Orientation", type: "keynote", desc: "Overview of workshop goals, day agenda, and ISTE collaboration." },
    { time: "9:35 – 10:50 AM", title: "Expert Session – Mr. Suman Mandal", category: "Keynote 1", type: "virtual", desc: "Head of Partnerships & AI Workshops, Paytm. Deep dive into Generative AI in Production (1h 15m virtual masterclass)." },
    { time: "10:50 – 11:00 AM", title: "Interaction / Q&A", category: "Interactive", type: "virtual", desc: "Open floor Q&A with Mr. Suman Mandal on industry practices and career pathways." },
    { time: "11:00 – 11:15 AM", title: "Tea Break & Networking", category: "Break", type: "break", desc: "Refreshments provided in the foyer." },
    { time: "11:15 AM – 12:30 PM", title: "Expert Session – Mr. Shivam Behl", category: "Keynote 2", type: "virtual", desc: "SDE-II at Microsoft. Advanced AI-Assisted Development & Agentic Systems (1h 15m masterclass)." },
    { time: "12:30 – 12:40 PM", title: "Q&A Session", category: "Interactive", type: "virtual", desc: "Direct interactive discussion with Mr. Shivam Behl." },
    { time: "12:40 – 1:30 PM", title: "Lunch Break", category: "Dining", type: "lunch", desc: "Special lunch provided for all registered participants at New CSE Block dining hall." },
  ];

  const day1AfternoonItems = [
    { time: "1:30 – 1:45 PM", title: "Build Challenge Introduction", category: "Hackathon", type: "challenge", desc: "Problem statement reveal, judging criteria announcement, and sandbox API distribution." },
    { time: "1:45 – 3:15 PM", title: "Hands-on AI Build", category: "Hackathon", type: "challenge", desc: "Intensive 90-minute hands-on build challenge in teams. Faculty and mentors on floor." },
    { time: "3:15 – 3:45 PM", title: "Project Demonstrations & Submissions", category: "Showcase", type: "showcase", desc: "Live project demonstrations, testing, and team code repository submissions." },
    { time: "3:45 – 4:00 PM", title: "Day 1 Wrap-up & Briefing", category: "Wrap-up", type: "onsite", desc: "Review of Day 1 code submissions and briefing for next day's Grand Finale." },
  ];

  const day2Items = [
    { time: "10:00 – 11:30 AM", title: "Jury Evaluation", category: "Judging", type: "judging", desc: "Grand jury panel evaluation on Innovation, Prompting, Technical Execution, and Presentation." },
    { time: "11:30 AM – 12:30 PM", title: "Prize Distribution & Vote of Thanks", category: "Grand Finale", type: "awards", desc: "Awarding winner & runner-up trophies, surprise cash awards, certificates of merit, mementos, and closing remarks." },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Workshop Agenda & Schedule</h1>
          <p className="text-xs text-slate-400">
            2-Day Event Schedule: Wednesday, 30 Sep & Thursday, 1 Oct 2026 • Seminar Hall, New CSE Block
          </p>
        </div>

        <button
          onClick={() => downloadIcsFile()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Add to Calendar (.ics)</span>
        </button>
      </div>

      {/* DAY 1 CONTAINER: EQUAL SIDE-BY-SIDE TRACKS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Day 1: Workshop & Hands-on Build Challenge</h2>
              <p className="text-[11px] text-slate-400">Wednesday, 30 September 2026 • 9:00 AM – 4:00 PM</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold self-start sm:self-auto">
            13 Total Sessions
          </span>
        </div>

        {/* Side-by-Side Equal Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1: Morning Track */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">Part 1 • 9:00 AM – 1:30 PM</span>
                <h3 className="text-sm font-extrabold text-white">Morning Track: Keynotes & Masterclasses</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px] font-bold border border-cyan-500/20">
                9 Sessions
              </span>
            </div>

            <div className="space-y-2.5">
              {day1MorningItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-3 hover:border-cyan-500/30 transition-all space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                      {item.time}
                    </span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Afternoon Track */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">Part 2 • 1:30 PM – 4:00 PM</span>
                  <h3 className="text-sm font-extrabold text-white">Afternoon Track: AI Build Hackathon & Wrap-up</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-bold border border-purple-500/20">
                  4 Sessions
                </span>
              </div>

              <div className="space-y-2.5">
                {day1AfternoonItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-3 hover:border-purple-500/30 transition-all space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="font-mono text-[11px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20">
                        {item.time}
                      </span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanatory callouts for equal visual height */}
            <div className="space-y-3 pt-4">
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">90-Minute Intensive Build</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">Teams 1–4</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Design, prompt, test, and ship your functional AI application with real-time mentor support.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Code Freezing & Demonstration
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Repository commit freezing at 3:45 PM followed by project demonstration briefing for the jury round.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DAY 2 (NEXT DAY) SECTION: GRAND FINALE */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-3 pb-3 border-b border-amber-500/30">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">Day 2 (Next Day): Grand Finale, Jury Evaluation & Awards</h2>
            <p className="text-[11px] text-amber-400 font-semibold">Thursday, 1 October 2026 • 10:00 AM – 12:30 PM</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {day2Items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 p-5 hover:border-amber-500/60 transition-all space-y-2 shadow-lg shadow-amber-500/5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-500/30">
                    {item.time}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Official Ceremony
                </span>
                <span className="text-[11px] text-slate-400">Seminar Hall</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
