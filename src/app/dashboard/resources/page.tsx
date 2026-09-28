"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Download, ExternalLink, FileText, Code, Presentation, Link as LinkIcon, Sparkles } from "lucide-react";
import { loadStore } from "@/lib/store";
import { EventResource } from "@/lib/types";

export default function ResourcesPage() {
  const [resources, setResources] = useState<EventResource[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const store = loadStore();
    // Section 31 & 43: Participants only see published resources
    setResources(store.resources.filter((r) => r.published));
  }, []);

  const filtered = resources.filter((r) => {
    if (filter === "all") return true;
    return r.resource_type === filter;
  });

  const getIcon = (type: EventResource["resource_type"]) => {
    switch (type) {
      case "presentation":
        return Presentation;
      case "code":
        return Code;
      case "guide":
      case "pdf":
        return FileText;
      case "link":
      default:
        return LinkIcon;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Workshop Resources</h1>
          <p className="text-xs text-slate-400">
            Curated slides, Prompt Engineering cheat sheets, starter templates, and API keys.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["all", "presentation", "guide", "code", "pdf", "link"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === t
                  ? "bg-cyan-500 text-slate-950 shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((res) => {
          const IconComp = getIcon(res.resource_type);
          return (
            <div
              key={res.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {res.resource_type}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {res.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  {res.file_size || "Cloud Hosted"}
                </span>

                <a
                  href={res.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs transition-colors"
                >
                  {res.resource_type === "link" || res.resource_type === "code" ? (
                    <>
                      <span>Open Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Download</span>
                      <Download className="w-3.5 h-3.5" />
                    </>
                  )}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
