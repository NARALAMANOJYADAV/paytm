"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Award, Sparkles, ExternalLink, GitBranch, Medal, Flame } from "lucide-react";
import { loadStore } from "@/lib/store";
import { ProjectSubmission } from "@/lib/types";

export default function LeaderboardPage() {
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);

  useEffect(() => {
    const store = loadStore();
    // Sort submissions by total score descending
    const sorted = [...store.submissions].sort((a, b) => {
      const scoreA = a.scores?.total ?? -1;
      const scoreB = b.scores?.total ?? -1;
      return scoreB - scoreA;
    });
    setSubmissions(sorted);
  }, []);

  const topThree = submissions.slice(0, 3);
  const remaining = submissions.slice(3);

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Hackathon Standings</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Build Challenge Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Prompt to Production – Paytm AI Workshop. Scores evaluated across Innovation, AI Prompting, Tech Execution, and Live Defense.
          </p>
        </div>

        {/* Podium for Top 3 */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
            
            {/* 2nd Place */}
            <div className="rounded-3xl bg-slate-900 border border-slate-700/80 p-6 space-y-3 text-center order-2 md:order-1 relative shadow-xl">
              <div className="w-12 h-12 rounded-full bg-slate-700/50 border-2 border-slate-400 text-slate-200 font-black text-lg mx-auto flex items-center justify-center">
                2
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                Runner Up
              </span>
              <h3 className="font-extrabold text-white text-lg">{topThree[1].team_name}</h3>
              <p className="text-xs text-cyan-300 font-semibold">{topThree[1].project_name}</p>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-2xl font-black text-white">{topThree[1].scores?.total ?? 92}</span>
                <span className="text-xs text-slate-400"> / 100</span>
              </div>
            </div>

            {/* 1st Place (Center & Taller) */}
            <div className="rounded-3xl bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-900 border-2 border-amber-400 p-8 space-y-4 text-center order-1 md:order-2 relative shadow-2xl shadow-amber-500/10">
              <div className="absolute -top-4 inset-x-0 flex justify-center">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-lg">
                  ★ WINNER ★
                </span>
              </div>
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 font-black text-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/30">
                1
              </div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
                1st Place Champion
              </span>
              <h3 className="font-black text-white text-xl">{topThree[0].team_name}</h3>
              <p className="text-xs text-cyan-300 font-semibold">{topThree[0].project_name}</p>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-3xl font-black text-amber-400">{topThree[0].scores?.total ?? 96}</span>
                <span className="text-xs text-slate-400"> / 100</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="rounded-3xl bg-slate-900 border border-slate-700/80 p-6 space-y-3 text-center order-3 relative shadow-xl">
              <div className="w-12 h-12 rounded-full bg-amber-900/30 border-2 border-amber-700 text-amber-400 font-black text-lg mx-auto flex items-center justify-center">
                3
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                3rd Place
              </span>
              <h3 className="font-extrabold text-white text-lg">{topThree[2].team_name}</h3>
              <p className="text-xs text-cyan-300 font-semibold">{topThree[2].project_name}</p>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-2xl font-black text-white">{topThree[2].scores?.total ?? 88}</span>
                <span className="text-xs text-slate-400"> / 100</span>
              </div>
            </div>

          </div>
        )}

        {/* Detailed Full Standings Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Full Challenge Standings</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Team Name</th>
                  <th className="p-3.5">Project Title</th>
                  <th className="p-3.5">Innovation (25)</th>
                  <th className="p-3.5">AI Prompting (25)</th>
                  <th className="p-3.5">Execution (25)</th>
                  <th className="p-3.5">Presentation (25)</th>
                  <th className="p-3.5 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {submissions.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold font-mono text-cyan-400">
                      #{idx + 1}
                    </td>
                    <td className="p-3.5 font-bold text-white">
                      {sub.team_name}
                    </td>
                    <td className="p-3.5 text-cyan-300">
                      {sub.project_name}
                    </td>
                    <td className="p-3.5 font-mono">{sub.scores?.innovation ?? "-"}</td>
                    <td className="p-3.5 font-mono">{sub.scores?.ai_prompting ?? "-"}</td>
                    <td className="p-3.5 font-mono">{sub.scores?.tech_execution ?? "-"}</td>
                    <td className="p-3.5 font-mono">{sub.scores?.presentation ?? "-"}</td>
                    <td className="p-3.5 text-right font-black text-amber-400 font-mono text-sm">
                      {sub.scores?.total ?? "Under Review"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
