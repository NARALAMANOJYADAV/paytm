"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Send, CheckCircle2, AlertCircle, GitBranch, Globe, Presentation, FileCode, Award, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { loadStore, saveProjectSubmission } from "@/lib/store";
import { Team, ProjectSubmission, SubmissionStatus } from "@/lib/types";

export default function SubmissionPage() {
  const { currentProfile } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);

  // Form State
  const [projectName, setProjectName] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("Next.js, OpenAI API, Tailwind CSS");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [presentationUrl, setPresentationUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileId = currentProfile?.id || "profile-1";

  useEffect(() => {
    const store = loadStore();
    const myTeam = store.teams.find((t) =>
      t.members.some((m) => m.participant_id === profileId)
    );
    setTeam(myTeam || null);

    if (myTeam) {
      const sub = store.submissions.find((s) => s.team_id === myTeam.id);
      if (sub) {
        setSubmission(sub);
        setProjectName(sub.project_name);
        setProblemStatement(sub.problem_statement);
        setDescription(sub.description);
        setTechnologies(sub.technologies.join(", "));
        setGithubUrl(sub.github_url || "");
        setDemoUrl(sub.demo_url || "");
        setPresentationUrl(sub.presentation_url || "");
        setFileUrl(sub.file_url || "");
      }
    }
  }, [profileId]);

  const handleSubmit = (statusToSave: SubmissionStatus) => {
    if (!team) return;
    if (!projectName.trim() || !problemStatement.trim() || !description.trim()) {
      setStatusMessage("Please fill in Project Name, Problem Statement, and Description.");
      return;
    }

    setIsSubmitting(true);
    const techArray = technologies.split(",").map((t) => t.trim()).filter(Boolean);

    const saved = saveProjectSubmission({
      teamId: team.id,
      projectName,
      problemStatement,
      description,
      technologies: techArray,
      githubUrl: githubUrl || undefined,
      demoUrl: demoUrl || undefined,
      presentationUrl: presentationUrl || undefined,
      fileUrl: fileUrl || undefined,
      status: statusToSave,
    });

    setSubmission(saved);
    setIsSubmitting(false);
    setStatusMessage(statusToSave === "draft" ? "Draft saved successfully!" : "Project successfully submitted for evaluation!");
  };

  if (!team) {
    return (
      <div className="max-w-2xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Team Joined Yet</h2>
        <p className="text-xs text-slate-400">
          Project submissions are team-based. Please create or join a team first to submit your Build Challenge prototype.
        </p>
        <Link
          href="/dashboard/team"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
        >
          <span>Go to Team Setup</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Project Submission</h1>
          <p className="text-xs text-slate-400">
            Team: <strong className="text-cyan-400">{team.name}</strong> • AI Build Challenge (1:45 PM – 3:15 PM)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {submission?.status || "Not Started"}
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Jury Scores display if evaluated */}
      {submission?.scores && (
        <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-white text-base">Jury Evaluation & Score Card</h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-400">{submission.scores.total}</span>
              <span className="text-xs text-slate-400"> / 100 Points</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Innovation</span>
              <span className="font-bold text-white text-sm">{submission.scores.innovation} / 25</span>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">AI Prompting</span>
              <span className="font-bold text-white text-sm">{submission.scores.ai_prompting} / 25</span>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Tech Execution</span>
              <span className="font-bold text-white text-sm">{submission.scores.tech_execution} / 25</span>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Presentation</span>
              <span className="font-bold text-white text-sm">{submission.scores.presentation} / 25</span>
            </div>
          </div>

          {submission.scores.feedback && (
            <p className="text-xs text-slate-300 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              “{submission.scores.feedback}”
            </p>
          )}
        </div>
      )}

      {/* Main Form */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              placeholder="e.g. HealthGen AI Triage"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Problem Statement *
            </label>
            <textarea
              rows={2}
              placeholder="What real-world challenge does your application solve?"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project Description & Prompt Architecture *
            </label>
            <textarea
              rows={4}
              placeholder="Describe your technical architecture, models utilized, and prompt engineering strategy..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Technologies Used * (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Next.js, OpenAI API, LangChain, Tailwind CSS"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GitHub Repository URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                />
                <GitBranch className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Live Demo URL (Vercel / Netlify / Render)
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://..."
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                />
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Presentation / Slides URL (Google Slides / Canva)
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://slides..."
                  value={presentationUrl}
                  onChange={(e) => setPresentationUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                />
                <Presentation className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project ZIP / Documentation Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="Google Drive / Cloud storage link"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                />
                <FileCode className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs transition-colors"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit("submitted")}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit for Evaluation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
