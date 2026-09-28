"use client";

import React, { useState, useEffect } from "react";
import { Layers, Users, Trophy } from "lucide-react";
import { loadStore } from "@/lib/store";
import { Team } from "@/lib/types";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const store = loadStore();
    setTeams(store.teams);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-red-400" />
          <span>Hackathon Teams & Roster</span>
        </h1>
        <p className="text-xs text-slate-400">
          Showing {teams.length} registered build teams across college branches.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                  Code: {t.invite_code}
                </span>
                <h3 className="font-bold text-white text-base">{t.name}</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {t.members.length} / 4 members
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                Roster:
              </span>
              {t.members.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{m.name}</span>
                    {m.is_leader && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                        Lead
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {m.roll_number} • {m.branch}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
