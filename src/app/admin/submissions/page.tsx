"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Star, ExternalLink, GitBranch, CheckCircle2, Trophy, Sliders } from "lucide-react";
import { loadStore, scoreSubmission } from "@/lib/store";
import { ProjectSubmission } from "@/lib/types";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [activeSub, setActiveSub] = useState<ProjectSubmission | null>(null);

  // Scoring rubric state (each 0 - 25)
  const [innovation, setInnovation] = useState<number>(20);
  const [aiPrompting, setAiPrompting] = useState<number>(20);
  const [techExecution, setTechExecution] = useState<number>(20);
  const [presentation, setPresentation] = useState<number>(20);
  const [feedback, setFeedback] = useState<string>("");
  const [saveNotice, setSaveNotice] = useState(false);

  const refreshList = () => {
    const store = loadStore();
    setSubmissions(store.submissions);
    if (activeSub) {
      const up = store.submissions.find((s) => s.id === activeSub.id);
      setActiveSub(up || null);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleSelectSub = (sub: ProjectSubmission) => {
    setActiveSub(sub);
    setInnovation(sub.scores?.innovation ?? 22);
    setAiPrompting(sub.scores?.ai_prompting ?? 22);
    setTechExecution(sub.scores?.tech_execution ?? 22);
    setPresentation(sub.scores?.presentation ?? 22);
    setFeedback(sub.scores?.feedback ?? "");
  };

  const handleSaveScores = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSub) return;

    scoreSubmission(activeSub.id, {
      innovation,
      ai_prompting: aiPrompting,
      tech_execution: techExecution,
      presentation,
      feedback: feedback.trim() || undefined,
    });

    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
    refreshList();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span>Build Challenge Judging Console</span>
          </h1>
          <p className="text-xs text-slate-400">
            Score hackathon projects on Innovation, AI Prompting, Tech Execution, and Presentation (100 total pts).
          </p>
        </div>

        <Link
          href="/leaderboard"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Trophy className="w-4 h-4" />
          <span>Open Live Leaderboard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Submissions Queue */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Team Submissions ({submissions.length})
          </span>

          <div className="space-y-2.5">
            {submissions.map((sub) => {
              const isSelected = activeSub?.id === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSub(sub)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-amber-950/40 border-amber-500 shadow-md"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-white">
                      {sub.team_name}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        sub.scores
                          ? "bg-emerald-500/20 text-emerald-300 font-mono"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {sub.scores ? `${sub.scores.total} pts` : "Unscored"}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-cyan-300">
                    {sub.project_name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {sub.problem_statement}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Scoring Form & Details */}
        <div className="lg:col-span-7">
          {activeSub ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
              
              <div className="pb-4 border-b border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Team: {activeSub.team_name}
                </span>
                <h2 className="text-xl font-black text-white">{activeSub.project_name}</h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {activeSub.description}
                </p>

                {/* Tech & Links */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {activeSub.technologies.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300">
                      {t}
                    </span>
                  ))}
                  {activeSub.github_url && (
                    <a
                      href={activeSub.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white underline ml-2"
                    >
                      <GitBranch className="w-3 h-3" />
                      Repo
                    </a>
                  )}
                  {activeSub.demo_url && (
                    <a
                      href={activeSub.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline ml-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>

              {saveNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Jury score updated! Leaderboard refreshed in real time.</span>
                </div>
              )}

              {/* Scoring Sliders Rubric */}
              <form onSubmit={handleSaveScores} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Jury Evaluation Rubric</span>
                  </span>
                  <span className="text-lg font-black text-amber-400">
                    Total: {innovation + aiPrompting + techExecution + presentation} / 100
                  </span>
                </div>

                {/* Rubric 1: Innovation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">1. Innovation & Novelty (0–25)</span>
                    <span className="font-mono font-bold text-cyan-300">{innovation} pts</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={innovation}
                    onChange={(e) => setInnovation(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Rubric 2: AI Prompting */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">2. Prompt Engineering & AI Safety (0–25)</span>
                    <span className="font-mono font-bold text-cyan-300">{aiPrompting} pts</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={aiPrompting}
                    onChange={(e) => setAiPrompting(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Rubric 3: Tech Execution */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">3. Technical Execution & Code Quality (0–25)</span>
                    <span className="font-mono font-bold text-cyan-300">{techExecution} pts</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={techExecution}
                    onChange={(e) => setTechExecution(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Rubric 4: Presentation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">4. Presentation & Live Demo Defense (0–25)</span>
                    <span className="font-mono font-bold text-cyan-300">{presentation} pts</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={presentation}
                    onChange={(e) => setPresentation(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Feedback */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jury Feedback & Commendation
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Robust latency management, elegant prompt chaining..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all"
                >
                  Save & Publish Scores
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center text-xs text-slate-400 space-y-2">
              <Award className="w-10 h-10 text-slate-700 mx-auto" />
              <p>Select a team project from the left queue to evaluate.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
