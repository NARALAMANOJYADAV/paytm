"use client";

import React from "react";
import { Clock, Calendar, MapPin, Sparkles, Video, Coffee, Utensils, Award, Sun, Trophy } from "lucide-react";
import { downloadIcsFile } from "@/lib/ics";

export default function SchedulePage() {
  const day1Items = [
    { time: "9:00 – 9:15 AM", title: "Registration and Seating", category: "Check-in", type: "onsite", desc: "Desk opens at 8:45 AM. QR badge verification and workshop kit distribution." },
    { time: "9:15 – 9:25 AM", title: "Welcome Address", category: "Inauguration", type: "keynote", desc: "Opening remarks by Head of Department, IT & AI&DS, NBKRIST." },
    { time: "9:25 – 9:35 AM", title: "Prompt to Production Introduction", category: "Orientation", type: "keynote", desc: "Overview of workshop goals, day agenda, and ISTE collaboration." },
    { time: "9:35 – 10:50 AM", title: "Expert Session – Mr. Suman Mandal", category: "Keynote 1", type: "virtual", desc: "Head of Partnerships & AI Workshops, Paytm. Deep dive into Generative AI in Production (1h 15m virtual masterclass)." },
    { time: "10:50 – 11:00 AM", title: "Interaction / Q&A", category: "Interactive", type: "virtual", desc: "Open floor Q&A with Mr. Suman Mandal on industry practices and career pathways." },
    { time: "11:00 – 11:15 AM", title: "Tea Break & Networking", category: "Break", type: "break", desc: "Refreshments provided in the foyer." },
    { time: "11:15 AM – 12:30 PM", title: "Expert Session – Mr. Shivam Behl", category: "Keynote 2", type: "virtual", desc: "SDE-II at Microsoft. Advanced AI-Assisted Development & Agentic Systems (1h 15m masterclass)." },
    { time: "12:30 – 12:40 PM", title: "Q&A Session", category: "Interactive", type: "virtual", desc: "Direct interactive discussion with Mr. Shivam Behl." },
    { time: "12:40 – 1:30 PM", title: "Lunch Break", category: "Dining", type: "lunch", desc: "Special lunch provided for all registered participants at New CSE Block dining hall." },
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
    <div className="max-w-4xl mx-auto space-y-8">
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

      {/* DAY 1 SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">Day 1: Workshop & AI Build Challenge</h2>
            <p className="text-[11px] text-slate-400">Wednesday, 30 September 2026 • 9:00 AM – 4:00 PM</p>
          </div>
        </div>

        <div className="space-y-3">
          {day1Items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-500/20">
                    {item.time}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base mt-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0">
                {item.type === "virtual" && (
                  <span className="inline-flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-1 rounded text-[11px] font-medium border border-blue-500/20">
                    <Video className="w-3.5 h-3.5" />
                    Live Virtual
                  </span>
                )}
                {item.type === "lunch" && (
                  <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-1 rounded text-[11px] font-medium border border-amber-500/20">
                    <Utensils className="w-3.5 h-3.5" />
                    Meal Provided
                  </span>
                )}
                {item.type === "challenge" && (
                  <span className="inline-flex items-center gap-1 text-purple-400 bg-purple-500/10 px-2 py-1 rounded text-[11px] font-medium border border-purple-500/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    Hands-on Build
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DAY 2 (NEXT DAY) SECTION */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">Day 2 (Next Day): Grand Finale & Awards</h2>
            <p className="text-[11px] text-amber-400 font-semibold">Thursday, 1 October 2026 • 10:00 AM – 12:30 PM</p>
          </div>
        </div>

        <div className="space-y-3">
          {day2Items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-slate-900 border border-amber-500/30 p-4 sm:p-5 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-500/30">
                    {item.time}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base mt-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0">
                <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded text-[11px] font-semibold border border-amber-500/30">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Grand Finale
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
