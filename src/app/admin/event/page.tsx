"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Save, CheckCircle2, ShieldCheck, ToggleLeft, ToggleRight, DollarSign } from "lucide-react";
import { loadStore, saveStore } from "@/lib/store";
import { EventConfig } from "@/lib/types";

export default function AdminEventPage() {
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const store = loadStore();
    setConfig(store.eventConfig);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    const store = loadStore();
    store.eventConfig = config;
    saveStore(store);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  if (!config) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-red-400" />
          <span>Event Management & Settings</span>
        </h1>
        <p className="text-xs text-slate-400">
          Configure workshop schedule, capacity, registration fees, and public registration status.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Event configuration saved and updated across all portals!</span>
        </div>
      )}

      {/* Form matching Section 42 */}
      <form onSubmit={handleSave} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        
        {/* Registration Toggle Banner */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">
              Public Registration Status
            </span>
            <p className="text-[11px] text-slate-400">
              {config.registration_open ? "Registration is OPEN for students" : "Registration is CLOSED (Capacity met)"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setConfig({ ...config, registration_open: !config.registration_open })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              config.registration_open
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
            }`}
          >
            {config.registration_open ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-rose-400" />}
            <span>{config.registration_open ? "OPEN" : "CLOSED"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Subtitle / Workshop Brand *
            </label>
            <input
              type="text"
              required
              value={config.subtitle}
              onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={config.date}
              onChange={(e) => setConfig({ ...config, date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Display Time *
            </label>
            <input
              type="text"
              required
              value={config.time}
              onChange={(e) => setConfig({ ...config, time: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Venue Location *
            </label>
            <input
              type="text"
              required
              value={config.venue}
              onChange={(e) => setConfig({ ...config, venue: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Attendee Capacity Cap *
            </label>
            <input
              type="number"
              required
              value={config.capacity}
              onChange={(e) => setConfig({ ...config, capacity: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Max Team Size for Build Challenge
            </label>
            <input
              type="number"
              required
              min={1}
              max={6}
              value={config.max_team_size}
              onChange={(e) => setConfig({ ...config, max_team_size: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
            />
          </div>

          {/* Pricing Controls */}
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1">
              ISTE Member Registration Fee (INR) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                value={config.iste_fee}
                onChange={(e) => setConfig({ ...config, iste_fee: Number(e.target.value) })}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-white text-xs focus:border-emerald-400 focus:outline-none font-bold"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cyan-400 mb-1">
              Non-ISTE Registration Fee (INR) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                value={config.non_iste_fee}
                onChange={(e) => setConfig({ ...config, non_iste_fee: Number(e.target.value) })}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-white text-xs focus:border-cyan-400 focus:outline-none font-bold"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Workshop Public Description
            </label>
            <textarea
              rows={3}
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-500/25 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
