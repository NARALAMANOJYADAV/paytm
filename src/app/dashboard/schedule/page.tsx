"use client";

import React from "react";
import { Calendar, Award } from "lucide-react";
import { downloadIcsFile } from "@/lib/ics";

export default function SchedulePage() {
  const day1MorningItems = [
    { time: "9:00 – 9:15 AM", title: "Registration and Seating", category: "Check-in", type: "onsite", desc: "Desk opens at 8:45 AM. QR badge verification and workshop kit distribution." },
    { time: "9:15 – 9:25 AM", title: "Welcome Address", category: "Inauguration", type: "keynote", desc: "Opening remarks by Head of Department, IT & AI&DS, NBKRIST." },
    { time: "9:25 – 9:35 AM", title: "Prompt to Production Introduction", category: "Orientation", type: "keynote", desc: "Overview of workshop goals, day agenda, and ISTE collaboration." },
    { time: "9:35 – 10:50 AM", title: "Expert Session – Mr. Suman Mandal", category: "Keynote 1", type: "virtual", desc: "Program Lead, Paytm. AI as a Mentor: Building with Current AI Tools & Technologies and the Right Way to Use AI (1h 15m virtual masterclass)." },
    { time: "10:50 – 11:00 AM", title: "Interaction / Q&A", category: "Interactive", type: "virtual", desc: "Open floor Q&A with Mr. Suman Mandal on industry practices, AI tools, and career pathways." },
    { time: "11:00 – 11:15 AM", title: "Tea Break & Networking", category: "Break", type: "break", desc: "Refreshments provided in the foyer." },
    { time: "11:15 AM – 12:30 PM", title: "Expert Session – Mr. Shivam Behl", category: "Keynote 2", type: "virtual", desc: "Software Engineer, Microsoft (ex-Zepto, Flipkart). Cracking Tier-1 Tech, Enterprise Production & Career Roadmap for Tier-3 Students (1h 15m masterclass)." },
    { time: "12:30 – 12:40 PM", title: "Q&A Session", category: "Interactive", type: "virtual", desc: "Direct interactive discussion with Mr. Shivam Behl on hiring, enterprise systems, and engineering roadmaps." },
    { time: "12:40 – 1:30 PM", title: "Lunch Break", category: "Dining", type: "lunch", desc: "Special lunch provided for all registered participants at New CSE Block dining hall." },
  ];

  const day1AfternoonItems = [
    { time: "1:30 – 1:45 PM", title: "Build Challenge Introduction", category: "Hackathon", type: "challenge", desc: "Problem statement reveal, judging criteria announcement, and sandbox API distribution." },
    { time: "1:45 – 3:15 PM", title: "Hands-on AI Build", category: "Hackathon", type: "challenge", desc: "Intensive 90-minute hands-on build challenge in teams. Faculty and mentors on floor." },
    { time: "3:15 – 3:45 PM", title: "Project Demonstrations & Submissions", category: "Showcase", type: "showcase", desc: "Live project demonstrations, testing, and team code repository submissions." },
    { time: "3:45 – 4:00 PM", title: "Day 1 Wrap-up & Briefing", category: "Wrap-up", type: "onsite", desc: "Review of Day 1 code submissions and briefing for next day's Winner Announcement." },
  ];

  const day2Items = [
    { time: "10:00 AM", title: "Winners Announcement", category: "Results", type: "virtual", desc: "Official announcement of workshop and build challenge winners published in the WhatsApp group." },
    { time: "12:45 PM", title: "Prize Distribution & Felicitation", category: "Prize Distribution", type: "awards", desc: "Awarding surprise cash awards, certificates of merit, and closing remarks at Principal's Cabin, EEE Block." },
  ];

  type Item = { time: string; title: string; category: string; type: string; desc: string };

  const renderSessions = (items: Item[]) => (
    <ol className="divide-y divide-rule">
      {items.map((item, index) => (
        <li key={index} className="py-3 grid grid-cols-1 sm:grid-cols-[9.5rem_1fr] gap-x-4 gap-y-1">
          <span className="font-mono text-sm font-bold text-ink num">{item.time}</span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-ink text-sm sm:text-base">{item.title}</h4>
              <span className="tag tag-info">{item.category}</span>
            </div>
            <p className="text-sm text-ink-2 leading-relaxed">{item.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="space-y-8">
      <header className="frame bg-paper px-5 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-ink">Workshop Agenda &amp; Schedule</h1>
          <p className="text-sm text-ink-2 mt-2">
            2-Day Event Schedule: Wednesday, 30 Sep (Seminar Hall-1) &amp; Thursday, 1 Oct 2026 (Principal&apos;s Cabin, EEE Block)
          </p>
        </div>

        <button
          onClick={() => downloadIcsFile()}
          className="btn btn-primary self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>Add to Calendar (.ics)</span>
        </button>
      </header>

      {/* DAY 1 */}
      <section className="space-y-3" aria-labelledby="day1">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 id="day1" className="text-xl font-semibold wide text-ink">Day 1: Workshop &amp; Hands-on Build Challenge</h2>
            <p className="text-sm text-ink-2 num">Wednesday, 30 September 2026 · 9:00 AM – 4:00 PM</p>
          </div>
          <span className="tag self-start sm:self-auto">13 Total Sessions</span>
        </div>

        <div className="planes grid-cols-1 lg:grid-cols-2 items-stretch">
          {/* Morning Track */}
          <div className="p-5 space-y-2">
            <div className="flex items-start justify-between gap-3 pb-2 rule-b">
              <div>
                <h3 className="font-semibold text-ink">Morning Track: Keynotes &amp; Masterclasses</h3>
                <p className="text-xs text-ink-3 font-mono mt-0.5">Part 1 · 9:00 AM – 1:30 PM</p>
              </div>
              <span className="tag">9 Sessions</span>
            </div>
            {renderSessions(day1MorningItems)}
          </div>

          {/* Afternoon Track */}
          <div className="p-5 space-y-2 flex flex-col">
            <div className="flex items-start justify-between gap-3 pb-2 rule-b">
              <div>
                <h3 className="font-semibold text-ink">Afternoon Track: AI Build Hackathon &amp; Wrap-up</h3>
                <p className="text-xs text-ink-3 font-mono mt-0.5">Part 2 · 1:30 PM – 4:00 PM</p>
              </div>
              <span className="tag">4 Sessions</span>
            </div>
            {renderSessions(day1AfternoonItems)}

            <div className="mt-auto pt-3 space-y-2">
              <div className="plane-field frame p-4 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-ink text-sm">90-Minute Intensive Build</span>
                  <span className="tag tag-info">Teams 1–4</span>
                </div>
                <p className="text-sm text-ink-2 leading-relaxed">
                  Design, prompt, test, and ship your functional AI application with real-time mentor support.
                </p>
              </div>

              <div className="plane-field frame p-4 space-y-1">
                <span className="font-bold text-ink text-sm block">Code Freezing &amp; Demonstration</span>
                <p className="text-sm text-ink-2 leading-relaxed">
                  Repository commit freezing at 3:45 PM followed by project demonstration briefing for the jury round.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DAY 2 */}
      <section className="space-y-3" aria-labelledby="day2">
        <div>
          <h2 id="day2" className="text-xl font-semibold wide text-ink">Day 2 (Next Day): Winner Announcement &amp; Prize Distribution</h2>
          <p className="text-sm text-ink-2 num">Thursday, 1 October 2026 · 10:00 AM &amp; 12:45 PM · Principal&apos;s Cabin, EEE Block</p>
        </div>

        <div className="planes grid-cols-1 sm:grid-cols-2">
          {day2Items.map((item, index) => (
            <div key={index} className="p-5 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-ink num">{item.time}</span>
                  <span className="tag tag-info">{item.category}</span>
                </div>
                <h3 className="font-semibold text-ink text-base sm:text-lg">{item.title}</h3>
                <p className="text-sm text-ink-2 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-3 border-t border-rule flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 font-bold text-ink">
                  <Award className="w-4 h-4 text-ink-2" aria-hidden="true" />
                  Official Ceremony
                </span>
                <span className="text-ink-2">Principal&apos;s Cabin, EEE Block</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
