"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, GitBranch, CheckCircle2, Trophy } from "lucide-react";
import { useStore, scoreSubmission } from "@/lib/store";
import { ProjectSubmission } from "@/lib/types";

const QUICK_SCORES = [0, 5, 10, 15, 20, 25];

function RubricRow({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  const set = (n: number) => onChange(Number.isFinite(n) ? Math.max(0, Math.min(25, Math.round(n))) : 0);
  return (
    <div className="p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-bold text-ink">
          {label} <span className="font-normal text-ink-3">(0–25)</span>
        </label>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={25}
          value={value}
          disabled={disabled}
          onChange={(e) => set(Number(e.target.value))}
          className="field num font-mono font-bold text-center w-20 flex-shrink-0"
        />
      </div>
      <div className="grid grid-cols-6 gap-1" role="group" aria-label={`${label} quick scores`}>
        {QUICK_SCORES.map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => set(n)}
              aria-pressed={selected}
              className={`min-h-11 border num font-mono text-sm font-bold transition-colors ${
                selected ? "plane-sun border-sun" : "border-line bg-field-2 text-ink-2 hover:text-ink hover:bg-paper-2"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const STATUS_ORDER: Record<string, number> = { submitted: 0, under_review: 1, evaluated: 2, draft: 3, not_started: 4 };

export default function AdminSubmissionsPage() {
  const store = useStore();
  const submissions = useMemo(
    () => [...store.submissions].sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)),
    [store],
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeSub = submissions.find((s) => s.id === activeId) ?? null;

  // Scoring rubric state (each 0 - 25)
  const [innovation, setInnovation] = useState<number>(0);
  const [aiPrompting, setAiPrompting] = useState<number>(0);
  const [techExecution, setTechExecution] = useState<number>(0);
  const [presentation, setPresentation] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSelectSub = (sub: ProjectSubmission) => {
    setActiveId(sub.id);
    setNotice(null);
    setInnovation(sub.scores?.innovation ?? 0);
    setAiPrompting(sub.scores?.ai_prompting ?? 0);
    setTechExecution(sub.scores?.tech_execution ?? 0);
    setPresentation(sub.scores?.presentation ?? 0);
    setFeedback(sub.scores?.feedback ?? "");
  };

  const isDraft = activeSub ? activeSub.status === "draft" || activeSub.status === "not_started" : false;

  const handleSaveScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSub || isDraft) return;
    setSaving(true);
    setNotice(null);
    try {
      await scoreSubmission(activeSub.id, {
        innovation,
        ai_prompting: aiPrompting,
        tech_execution: techExecution,
        presentation,
        feedback: feedback.trim() || undefined,
      });
      setNotice({ ok: true, text: "Scores saved. The leaderboard now shows this team as evaluated." });
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : "Could not save scores." });
    } finally {
      setSaving(false);
    }
  };

  const total = innovation + aiPrompting + techExecution + presentation;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="frame bg-paper p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title text-ink">Build Challenge Judging Console</h1>
          <p className="mt-2 text-sm text-ink-2">
            Score hackathon projects on Innovation, AI Prompting, Tech Execution, and Presentation (100 total pts).
          </p>
        </div>
        <Link href="/leaderboard" target="_blank" className="btn self-start sm:self-auto">
          <Trophy className="w-4 h-4" aria-hidden="true" />
          <span>Open Live Leaderboard</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Submissions Queue */}
        <section className="lg:col-span-5 frame bg-paper" aria-labelledby="queue-heading">
          <h2 id="queue-heading" className="px-4 py-3 rule-b text-base font-semibold wide text-ink">
            Team Submissions <span className="num text-ink-3">({submissions.length})</span>
          </h2>
          <ul className="divide-y-2 divide-line">
            {submissions.map((sub) => {
              const isSelected = activeSub?.id === sub.id;
              return (
                <li key={sub.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectSub(sub)}
                    aria-current={isSelected ? "true" : undefined}
                    className={`relative w-full text-left p-4 pl-5 min-h-11 transition-colors ${
                      isSelected ? "bg-paper-2" : "hover:bg-paper-2"
                    }`}
                  >
                    {isSelected && <span className="absolute left-0 top-0 bottom-0 w-1 bg-sky" aria-hidden="true" />}
                    <span className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-ink">{sub.team_name}</span>
                      {sub.status === "evaluated" && sub.scores ? (
                        <span className="tag tag-ok num">Evaluated / {sub.scores.total} pts</span>
                      ) : sub.status === "draft" || sub.status === "not_started" ? (
                        <span className="tag tag-off">Draft</span>
                      ) : (
                        <span className="tag tag-pending">Awaiting score</span>
                      )}
                    </span>
                    <span className="block text-sm font-semibold text-accent">{sub.project_name}</span>
                    <span className="block text-xs text-ink-2 line-clamp-2 mt-1">{sub.problem_statement}</span>
                  </button>
                </li>
              );
            })}
            {submissions.length === 0 && <li className="p-6 text-sm text-ink-2">No submissions yet.</li>}
          </ul>
        </section>

        {/* Right Column: Scoring Form & Details */}
        <div className="lg:col-span-7">
          {activeSub ? (
            <section className="frame bg-paper" aria-labelledby="scoring-heading">
              <div className="p-5 sm:p-6 rule-b">
                <p className="text-sm text-ink-2">
                  Team: <span className="font-bold text-ink">{activeSub.team_name}</span>
                </p>
                <h2 id="scoring-heading" className="text-2xl font-semibold wide text-ink mt-1 leading-tight">
                  {activeSub.project_name}
                </h2>
                {activeSub.problem_statement && (
                  <p className="text-sm text-ink mt-3 leading-relaxed">
                    <span className="font-bold">Problem: </span>
                    {activeSub.problem_statement}
                  </p>
                )}
                <p className="text-sm text-ink-2 mt-3 leading-relaxed">{activeSub.description}</p>

                {/* Tech & Links */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {activeSub.technologies.map((t, idx) => (
                    <span key={idx} className="tag tag-info">
                      {t}
                    </span>
                  ))}
                </div>
                {(activeSub.github_url || activeSub.demo_url || activeSub.presentation_url || activeSub.file_url) && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {activeSub.github_url && (
                      <a href={activeSub.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm min-h-11">
                        <GitBranch className="w-4 h-4" aria-hidden="true" />
                        Repo
                      </a>
                    )}
                    {activeSub.demo_url && (
                      <a href={activeSub.demo_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm min-h-11">
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                        Live Demo
                      </a>
                    )}
                    {activeSub.presentation_url && (
                      <a href={activeSub.presentation_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm min-h-11">
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                        Slides
                      </a>
                    )}
                    {activeSub.file_url && (
                      <a href={activeSub.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm min-h-11">
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                        File
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Scoring Rubric */}
              <form onSubmit={handleSaveScores}>
                <div className="planes grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] border-x-0 border-t-0">
                  <div className="p-5 flex flex-col justify-center">
                    <h3 className="text-lg font-semibold wide text-ink">Jury Evaluation Rubric</h3>
                    <p className="text-sm text-ink-2 mt-1">Four criteria, 25 points each.</p>
                  </div>
                  <div className="plane-navy p-5 flex flex-col justify-center sm:min-w-[12rem]" aria-live="polite">
                    <span className="cell-label">Total</span>
                    <p className="mt-1">
                      <span className="display num text-5xl">{total}</span>
                      <span className="num text-lg font-bold text-[rgba(255,255,255,0.7)]"> / 100</span>
                    </p>
                  </div>
                </div>

                {isDraft && (
                  <p role="status" className="bg-sun-soft px-5 py-3 text-sm text-ink rule-b">
                    This team has only saved a draft. Drafts cannot be scored until the team makes its final submission.
                  </p>
                )}
                <div className="divide-y divide-rule rule-b">
                  <RubricRow id="score-innovation" label="1. Innovation & Novelty" value={innovation} onChange={setInnovation} disabled={isDraft} />
                  <RubricRow
                    id="score-ai"
                    label="2. Prompt Engineering & AI Safety"
                    value={aiPrompting}
                    onChange={setAiPrompting}
                    disabled={isDraft}
                  />
                  <RubricRow
                    id="score-tech"
                    label="3. Technical Execution & Code Quality"
                    value={techExecution}
                    onChange={setTechExecution}
                    disabled={isDraft}
                  />
                  <RubricRow
                    id="score-presentation"
                    label="4. Presentation & Live Demo Defense"
                    value={presentation}
                    onChange={setPresentation}
                    disabled={isDraft}
                  />
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <label htmlFor="jury-feedback" className="field-label">
                      Jury Feedback &amp; Commendation
                    </label>
                    <textarea
                      id="jury-feedback"
                      rows={2}
                      placeholder="e.g. Robust latency management, elegant prompt chaining..."
                      value={feedback}
                      maxLength={2000}
                      disabled={isDraft}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="field"
                    />
                  </div>

                  {notice && (
                    <p
                      role={notice.ok ? "status" : "alert"}
                      className={`frame px-3 py-2 text-sm font-semibold flex items-center gap-2 ${notice.ok ? "bg-ok-soft text-ok" : "bg-alert-soft text-alert"}`}
                    >
                      {notice.ok && <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
                      <span>{notice.text}</span>
                    </p>
                  )}

                  <button type="submit" disabled={saving || isDraft} aria-busy={saving} className="btn btn-primary btn-lg w-full">
                    {saving ? "Saving…" : "Save & Publish Scores"}
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <div className="frame bg-paper p-12 text-center text-sm text-ink-2">
              Select a team project from the queue to evaluate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
