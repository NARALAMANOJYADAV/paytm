"use client";

import React from "react";
import { useStore } from "@/lib/store";

const SUB_LABEL: Record<string, { text: string; cls: string }> = {
  draft: { text: "Draft", cls: "tag-pending" },
  submitted: { text: "Submitted", cls: "tag-info" },
  under_review: { text: "Under review", cls: "tag-info" },
  evaluated: { text: "Evaluated", cls: "tag-ok" },
};

export default function AdminTeamsPage() {
  const store = useStore();
  const teams = store.teams;
  const maxSize = store.eventConfig.max_team_size;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="frame bg-paper p-5 sm:p-6">
        <h1 className="page-title text-ink">Hackathon Teams &amp; Roster</h1>
        <p className="mt-2 text-sm text-ink-2">
          Showing <span className="num font-bold text-ink">{teams.length}</span> registered build teams across
          college branches.
        </p>
      </header>

      {teams.length === 0 ? (
        <div className="frame bg-paper p-10 text-center text-sm text-ink-2">No teams have been formed yet.</div>
      ) : (
        <div className="planes grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <section key={t.id} className="flex flex-col">
              <div className="p-5 rule-b flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold wide text-ink text-lg leading-tight">{t.name}</h2>
                  <p className="mt-1 text-xs text-ink-2">
                    Code: <span className="font-mono font-bold text-accent">{t.invite_code}</span>
                  </p>
                </div>
                <span className="flex flex-col items-end gap-1">
                  <span className={`tag ${t.members.length >= maxSize ? "tag-ok" : "tag-pending"} num`}>
                    {t.members.length} / {maxSize} members
                  </span>
                  {(() => {
                    const sub = store.submissions.find((x) => x.team_id === t.id);
                    const lbl = sub ? SUB_LABEL[sub.status] : undefined;
                    return lbl ? <span className={`tag ${lbl.cls}`}>{lbl.text}</span> : <span className="tag">No submission</span>;
                  })()}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <span className="cell-label block">Roster</span>
                <ul className="divide-y divide-rule border border-rule">
                  {t.members.map((m) => (
                    <li key={m.id} className="bg-field-2 px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-ink">{m.name}</span>
                        {m.is_leader && <span className="tag tag-info">Lead</span>}
                      </span>
                      <span className="font-mono text-xs text-ink-2">
                        {m.roll_number} / {m.branch}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
