"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, UserPlus, CheckCircle2, Copy, ArrowRight, AlertCircle, Lock, LogOut } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useStore, createTeam, joinTeam, leaveTeam } from "@/lib/store";

type Busy = "create" | "join" | "leave" | null;

export default function TeamPage() {
  const { currentProfile, currentRegistration: reg } = useAuth();
  const store = useStore();
  const maxTeam = store.eventConfig.max_team_size;

  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const profileId = currentProfile?.id;
  const team = profileId ? store.teams.find((t) => t.members.some((m) => m.participant_id === profileId)) ?? null : null;
  const submission = team ? store.submissions.find((s) => s.team_id === team.id) ?? null : null;
  const me = team?.members.find((m) => m.participant_id === profileId);

  const confirmed = !!reg && reg.registration_status === "confirmed" && reg.payment_status === "success";
  const locked = !!submission && submission.status !== "draft" && submission.status !== "not_started";
  const leaderMustWait = !!me?.is_leader && (team?.members.length ?? 0) > 1;

  const run = async (kind: Exclude<Busy, null>, fn: () => Promise<string>) => {
    setBusy(kind);
    setMessage(null);
    try {
      const text = await fn();
      setMessage({ text, type: "success" });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Something went wrong.", type: "error" });
    } finally {
      setBusy(null);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = teamName.trim();
    if (!name) return;
    run("create", async () => {
      const created = await createTeam(name);
      setTeamName("");
      return `Team "${name}" created. Share invite code ${created.inviteCode} with your teammates.`;
    });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    run("join", async () => {
      await joinTeam(code);
      setJoinCode("");
      return "You joined the team.";
    });
  };

  const handleLeave = () => {
    if (!team) return;
    const lastOne = team.members.length === 1;
    const ok = window.confirm(
      lastOne
        ? `You are the only member. Leaving deletes "${team.name}". Continue?`
        : `Leave "${team.name}"?`
    );
    if (!ok) return;
    run("leave", async () => {
      await leaveTeam();
      return lastOne ? `Team "${team.name}" was deleted.` : `You left "${team.name}".`;
    });
  };

  const copyInviteCode = async () => {
    if (!team) return;
    try {
      await navigator.clipboard.writeText(team.invite_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      setMessage({ text: "Could not copy automatically. Select the code and copy it manually.", type: "error" });
    }
  };

  const subTag =
    submission?.status === "submitted" || submission?.status === "evaluated"
      ? "tag-ok"
      : submission?.status === "draft" || submission?.status === "under_review"
        ? "tag-pending"
        : "";

  const formsDisabled = !confirmed || busy !== null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="frame bg-paper px-5 py-5 sm:px-6">
        <h1 className="page-title text-ink">Build Challenge Team</h1>
        <p className="text-sm text-ink-2 mt-2">
          Form teams of 1 to {maxTeam} members for the hands-on AI Build Challenge.
        </p>
      </header>

      {message && (
        <div
          role={message.type === "success" ? "status" : "alert"}
          className={`px-4 py-3 border text-sm text-ink flex items-start gap-2 ${
            message.type === "success" ? "border-ok bg-ok-soft" : "border-alert bg-alert-soft"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-ok flex-shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-5 h-5 text-alert flex-shrink-0" aria-hidden="true" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {team ? (
        <div className="planes grid-cols-1">
          {/* Team identity */}
          <div className="plane-navy px-5 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold wide break-words">{team.name}</h2>
              <p className="text-sm text-[rgba(255,255,255,0.7)] mt-1">
                Leader: <strong className="text-white">{team.leader_name}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <span className="cell-label block">Team Invite Code</span>
                <span className="font-mono text-xl font-bold tracking-wider select-all">{team.invite_code}</span>
              </div>
              <button
                onClick={copyInviteCode}
                className="btn btn-sm min-h-11 min-w-11 px-3"
                title="Copy code"
                aria-label={copiedCode ? "Invite code copied" : "Copy invite code"}
              >
                {copiedCode ? <CheckCircle2 className="w-4 h-4 text-ok" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {locked && (
            <div className="plane-sun px-5 py-3 sm:px-6 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>Your team has submitted its project, so the roster is locked.</span>
            </div>
          )}

          {/* Members List */}
          <div className="px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
              <h3 className="font-semibold text-ink">
                Team Members <span className="num">({team.members.length} / {maxTeam})</span>
              </h3>
              <span className="text-sm text-ink-2">
                {maxTeam - team.members.length > 0 ? `${maxTeam - team.members.length} slots remaining` : "Full Roster"}
              </span>
            </div>

            <ul className="divide-y divide-rule border-t border-rule">
              {team.members.map((m) => (
                <li key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 border border-line bg-field-2 text-ink flex items-center justify-center font-bold text-sm flex-shrink-0" aria-hidden="true">
                      {m.name[0]}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-ink text-sm block truncate">
                        {m.name}
                        {m.participant_id === profileId && <span className="text-ink-3 font-normal"> (you)</span>}
                      </span>
                      <span className="text-xs text-ink-2"><span className="font-mono">{m.roll_number}</span> · {m.branch}</span>
                    </div>
                  </div>
                  {m.is_leader && <span className="tag tag-info">Leader</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Project Submission Status */}
          <div className="px-5 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-semibold text-ink block">Challenge Submission</span>
              {submission ? (
                <p className="text-sm text-ink-2 flex flex-wrap items-center gap-2">
                  <span>Project: <strong className="text-ink">{submission.project_name}</strong></span>
                  <span className={`tag ${subTag}`}>{submission.status.replace("_", " ")}</span>
                </p>
              ) : (
                <p className="text-sm text-ink-2">No project submitted yet. Submissions open during the AI Build session.</p>
              )}
            </div>

            <Link
              href="/dashboard/submission"
              className="btn btn-primary self-start sm:self-auto"
            >
              <span>{submission ? "View / Edit Submission" : "Submit Project"}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Leave */}
          {!locked && (
            <div className="px-5 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-ink-2">
                {leaderMustWait
                  ? "As team leader you can leave only after the other members have left."
                  : me?.is_leader
                    ? "You are the only member; leaving deletes the team."
                    : "You can leave this team until it submits its project."}
              </p>
              <button
                type="button"
                onClick={handleLeave}
                disabled={busy !== null || leaderMustWait}
                aria-busy={busy === "leave"}
                className="btn self-start sm:self-auto"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>{busy === "leave" ? "Leaving…" : "Leave Team"}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {!confirmed && (
            <div className="plane-sun frame px-4 py-3 text-sm flex items-start gap-2">
              <Lock className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span>
                Teams open once your payment is verified.{" "}
                {reg?.payment_status === "failed"
                  ? "Your payment was rejected; resubmit it from the overview page."
                  : reg
                    ? "Your payment is still under verification."
                    : "We could not find a registration for your account."}{" "}
                <Link href="/dashboard" className="font-bold underline decoration-2 underline-offset-4">Check status</Link>
              </span>
            </div>
          )}

          {/* Create or Join */}
          <div className="planes grid-cols-1 md:grid-cols-2">

            <form onSubmit={handleCreate} className="p-5 sm:p-6 space-y-4 flex flex-col">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-ink-2" aria-hidden="true" />
                <h2 className="font-semibold text-ink text-lg">Create a New Team</h2>
              </div>
              <p className="text-sm text-ink-2">
                You will be registered as Team Leader and receive an invite code to share with your teammates.
              </p>

              <div className="mt-auto">
                <label htmlFor="team-name" className="field-label">Team Name *</label>
                <input
                  id="team-name"
                  type="text"
                  required
                  maxLength={60}
                  placeholder="e.g. PromptCrafters"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  disabled={!confirmed}
                  className="field"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={formsDisabled} aria-busy={busy === "create"}>
                {busy === "create" ? "Creating…" : "Create Team"}
              </button>
            </form>

            <form onSubmit={handleJoin} className="p-5 sm:p-6 space-y-4 flex flex-col">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-ink-2" aria-hidden="true" />
                <h2 className="font-semibold text-ink text-lg">Join an Existing Team</h2>
              </div>
              <p className="text-sm text-ink-2">
                Enter the invite code shared by your Team Leader (e.g. <span className="font-mono">P2P-AB3CD</span>).
              </p>

              <div className="mt-auto">
                <label htmlFor="join-code" className="field-label">Team Invite Code *</label>
                <input
                  id="join-code"
                  type="text"
                  required
                  maxLength={20}
                  placeholder="P2P-XXXXX"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  disabled={!confirmed}
                  className="field uppercase font-mono"
                />
              </div>

              <button type="submit" className="btn w-full" disabled={formsDisabled} aria-busy={busy === "join"}>
                {busy === "join" ? "Joining…" : "Join Team"}
              </button>
            </form>

          </div>
        </>
      )}
    </div>
  );
}
