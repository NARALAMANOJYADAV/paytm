"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";

export default function BroadcastBanner() {
  // Public/participant state already holds only published announcements; staff state holds all of them.
  const announcements = useStore().announcements.filter((a) => a.published);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  if (dismissed || announcements.length === 0) return null;

  const current = announcements[currentIndex % announcements.length];
  const isUrgent = current.priority === "urgent";

  return (
    <div className="relative z-50 plane-ink text-white" role="status" aria-live="polite">
      <div className="max-w-[1280px] mx-auto pl-4 sm:pl-6 pr-1 sm:pr-3 min-h-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0 py-2">
          <span className="w-2.5 h-2.5 bg-sun shrink-0" aria-hidden="true" />
          <span className="shrink-0 px-1.5 py-px text-[0.6875rem] font-bold uppercase tracking-[0.08em] border-[1.5px] border-sun text-accent">
            {isUrgent ? "Live" : "Update"}
          </span>
          <p className="truncate text-sm text-white">
            <strong className="font-bold">{current.title}</strong>
            <span className="hidden md:inline text-[#d4d5d8]"> · {current.content}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 w-11 h-10 flex items-center justify-center text-white hover:bg-[#26272b] transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
