"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, UserPlus, Sparkles, CheckCircle2, Copy, Shield, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { loadStore, createTeam, joinTeam } from "@/lib/store";
import { Team, ProjectSubmission } from "@/lib/types";

export default function TeamPage() {
  const { currentProfile, currentUser } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  
  // Modals / forms
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const profileId = currentProfile?.id || "profile-1";

  const refreshTeam = () => {
    const store = loadStore();
    setAllTeams(store.teams);
    
    // Find team where current profile is a member
    const myTeam = store.teams.find((t) =>
      t.members.some((m) => m.participant_id === profileId)
    );
    setTeam(myTeam || null);

    if (myTeam) {
      const sub = store.submissions.find((s) => s.team_id === myTeam.id);
      setSubmission(sub || null);
    }
  };

  useEffect(() => {
    refreshTeam();
  }, [profileId]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    try {
      const created = createTeam(teamName.trim(), profileId);
      setMessage({ text: `Team "${created.name}" created successfully! Invite code: ${created.invite_code}`, type: "success" });
      setTeamName("");
      refreshTeam();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to create team", type: "error" });
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      const joined = joinTeam(joinCode.trim(), profileId);
      setMessage({ text: `Successfully joined ${joined.name}!`, type: "success" });
      setJoinCode("");
      refreshTeam();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to join team", type: "error" });
    }
  };

  const copyInviteCode = () => {
    if (!team) return;
    navigator.clipboard.writeText(team.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Build Challenge Team</h1>
        <p className="text-xs text-slate-400">
          Form teams of 1 to 4 members for the hands-on AI Build Challenge.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* If User has a team */}
      {team ? (
        <div className="rounded-3xl bg-slate-900 border border-cyan-500/30 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2">
                Active Build Team
              </div>
              <h2 className="text-2xl font-black text-white">{team.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Leader: <strong className="text-slate-200">{team.leader_name}</strong>
              </p>
            </div>

            {/* Invite Code Box */}
            <div className="bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-400 block">Team Invite Code</span>
                <span className="font-mono text-base font-black text-cyan-400">{team.invite_code}</span>
              </div>
              <button
                onClick={copyInviteCode}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700"
                title="Copy code"
              >
                {copiedCode ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Team Members ({team.members.length} / 4)
              </h3>
              <span className="text-[11px] text-slate-400">
                {4 - team.members.length > 0 ? `${4 - team.members.length} slots remaining` : "Full Roster"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {team.members.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      {m.name[0]}
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">{m.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{m.roll_number} • {m.branch}</span>
                    </div>
                  </div>
                  {m.is_leader && (
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Leader
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Project Submission Status Box */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-300 block">Challenge Submission</span>
              <p className="text-xs text-slate-400 mt-0.5">
                {submission ? (
                  <span>
                    Project: <strong className="text-cyan-300">{submission.project_name}</strong> • Status:{" "}
                    <span className="text-emerald-400 uppercase font-bold">{submission.status}</span>
                  </span>
                ) : (
                  "No project submitted yet. Submissions open during the AI Build session."
                )}
              </p>
            </div>

            <Link
              href="/dashboard/submission"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors self-start sm:self-auto"
            >
              {submission ? "View / Edit Submission" : "Submit Project"}
            </Link>
          </div>
        </div>
      ) : (
        /* If user doesn't have a team yet: Create or Join */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Create Team Form */}
          <form
            onSubmit={handleCreate}
            className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">Create a New Team</h3>
            </div>
            <p className="text-xs text-slate-400">
              You will be registered as Team Leader and receive a 6-character invite code to share with your teammates.
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Team Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PromptCrafters"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Create Team
            </button>
          </form>

          {/* Join Team Form */}
          <form
            onSubmit={handleJoin}
            className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <UserPlus className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">Join an Existing Team</h3>
            </div>
            <p className="text-xs text-slate-400">
              Enter the invite code shared by your Team Leader (e.g. P2P-AI42).
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Team Invite Code *
              </label>
              <input
                type="text"
                required
                placeholder="P2P-XXXX"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none uppercase font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700"
            >
              Join Team
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
