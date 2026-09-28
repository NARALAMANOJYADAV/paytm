"use client";

import React, { useState, useEffect } from "react";
import { Megaphone, Plus, CheckCircle2, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";
import { loadStore, saveStore } from "@/lib/store";
import { Announcement } from "@/lib/types";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Announcement["priority"]>("normal");
  const [category, setCategory] = useState<Announcement["category"]>("general");

  const refreshList = () => {
    const store = loadStore();
    setAnnouncements(store.announcements);
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleToggle = (id: string) => {
    const store = loadStore();
    const ann = store.announcements.find((a) => a.id === id);
    if (ann) {
      ann.published = !ann.published;
      saveStore(store);
      refreshList();
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const store = loadStore();
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      priority,
      category,
      published: true,
      created_at: new Date().toISOString(),
    };

    store.announcements.unshift(newAnn);
    saveStore(store);
    setTitle("");
    setContent("");
    setShowAdd(false);
    refreshList();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-red-400" />
            <span>Event Announcements & Live Ticker</span>
          </h1>
          <p className="text-xs text-slate-400">
            Publish real-time broadcasts displayed across the website header and user dashboards.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="rounded-3xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl animate-in fade-in duration-150"
        >
          <h3 className="font-bold text-white text-sm">Draft Live Broadcast</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Headline *</label>
              <input
                type="text"
                required
                placeholder="e.g. Build Challenge Kickoff at 1:30 PM"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent / Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="schedule">Schedule</option>
                  <option value="challenge">Challenge</option>
                  <option value="wifi">Wi-Fi & Tech</option>
                  <option value="certificate">Certificates</option>
                </select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Details Message *</label>
              <textarea
                rows={2}
                required
                placeholder="Message body shown in top ticker..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
            >
              Broadcast Now
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    item.priority === "urgent"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-slate-800 text-cyan-300"
                  }`}
                >
                  {item.priority}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {item.category}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">{item.title}</h3>
              <p className="text-xs text-slate-300">{item.content}</p>
            </div>

            <button
              onClick={() => handleToggle(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto ${
                item.published
                  ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {item.published ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
              <span>{item.published ? "Broadcasting" : "Paused"}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
