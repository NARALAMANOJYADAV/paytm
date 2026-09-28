"use client";

import React, { useState, useEffect } from "react";
import { Megaphone, X, Sparkles, AlertCircle } from "lucide-react";
import { loadStore } from "@/lib/store";
import { Announcement } from "@/lib/types";

export default function BroadcastBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const store = loadStore();
    const published = store.announcements.filter((a) => a.published);
    setAnnouncements(published);

    const handleUpdate = () => {
      const s = loadStore();
      setAnnouncements(s.announcements.filter((a) => a.published));
    };

    window.addEventListener("store_updated", handleUpdate);
    return () => window.removeEventListener("store_updated", handleUpdate);
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  if (dismissed || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  return (
    <div className="relative bg-gradient-to-r from-blue-950 via-cyan-950 to-slate-950 text-cyan-200 border-b border-cyan-500/30 px-4 py-2.5 text-xs sm:text-sm z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="flex h-2 w-2 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex-shrink-0">
            {current.priority === "urgent" ? (
              <>
                <AlertCircle className="w-3 h-3 text-amber-400" />
                Live Broadcast
              </>
            ) : (
              <>
                <Megaphone className="w-3 h-3 text-cyan-400" />
                Announcement
              </>
            )}
          </span>
          <p className="truncate font-medium text-slate-100">
            <strong className="text-cyan-300 mr-1.5">{current.title}</strong>
            <span className="text-slate-300 hidden sm:inline">— {current.content}</span>
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
