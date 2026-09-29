"use client";

import React, { useState } from "react";
import { Download, ExternalLink, FileText, Code, Presentation, Link as LinkIcon } from "lucide-react";
import { isStoreReady, useStore } from "@/lib/store";
import { EventResource } from "@/lib/types";

export default function ResourcesPage() {
  const store = useStore();
  const [filter, setFilter] = useState<string>("all");

  // Participants only see published resources (the server already filters; this is a second guard)
  const resources: EventResource[] = store.resources.filter((r) => r.published);

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
    <div className="space-y-6">
      <header className="frame bg-paper">
        <div className="px-5 py-5 sm:px-6">
          <h1 className="page-title text-ink">Workshop Resources</h1>
          <p className="text-sm text-ink-2 mt-2">
            Slides, prompt engineering guides, and starter code published by the organisers.
          </p>
        </div>

        {/* Filter rail */}
        <div role="group" aria-label="Filter by type" className="rule-t flex overflow-x-auto px-1">
          {["all", "presentation", "guide", "code", "pdf", "link"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              data-active={filter === t ? "true" : undefined}
              aria-pressed={filter === t}
              className="rail-item capitalize shrink-0"
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {!isStoreReady() ? (
        <div className="frame bg-paper p-8 text-center text-sm text-ink-2" aria-busy="true">
          Loading resources…
        </div>
      ) : filtered.length === 0 ? (
        <div className="frame bg-paper p-8 text-center text-sm text-ink-2">
          {resources.length === 0
            ? "The organisers have not published any resources yet. Check back closer to the event."
            : "No resources published in this category yet."}
        </div>
      ) : (
        <div className="planes grid-cols-1 md:grid-cols-2">
          {filtered.map((res) => {
            const IconComp = getIcon(res.resource_type);
            return (
              <div
                key={res.id}
                className="p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <IconComp className="w-5 h-5 text-ink-2" aria-hidden="true" />
                    <span className="tag tag-info">{res.resource_type}</span>
                  </div>
                  <h2 className="font-semibold text-ink text-base">{res.title}</h2>
                  <p className="text-sm text-ink-2 leading-relaxed">{res.description}</p>
                </div>

                <div className="pt-3 border-t border-rule flex items-center justify-between gap-3">
                  <span className="text-xs text-ink-3 num">
                    {res.file_size || "Cloud Hosted"}
                  </span>

                  <a
                    href={res.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                  >
                    {res.resource_type === "link" || res.resource_type === "code" ? (
                      <>
                        <span>Open Link</span>
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        <span>Download</span>
                        <Download className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </a>
                </div>
              </div>
            );
          })}
          {filtered.length % 2 === 1 && <div className="hidden md:block" aria-hidden="true" />}
        </div>
      )}
    </div>
  );
}
