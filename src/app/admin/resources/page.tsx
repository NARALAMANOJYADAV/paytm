"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Plus, ToggleLeft, ToggleRight, ExternalLink, Trash2, CheckCircle2 } from "lucide-react";
import { loadStore, saveStore } from "@/lib/store";
import { EventResource } from "@/lib/types";

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<EventResource[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New resource form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventResource["resource_type"]>("guide");
  const [fileUrl, setFileUrl] = useState("");
  const [published, setPublished] = useState(true);

  const refreshList = () => {
    const store = loadStore();
    setResources(store.resources);
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleTogglePublish = (id: string) => {
    const store = loadStore();
    const res = store.resources.find((r) => r.id === id);
    if (res) {
      res.published = !res.published;
      saveStore(store);
      refreshList();
    }
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const store = loadStore();
    const newRes: EventResource = {
      id: `res-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      resource_type: type,
      file_url: fileUrl.trim() || "#",
      published,
      created_by: "Admin",
      created_at: new Date().toISOString(),
    };

    store.resources.unshift(newRes);
    saveStore(store);

    setTitle("");
    setDescription("");
    setFileUrl("");
    setShowAddModal(false);
    refreshList();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-red-400" />
            <span>Event Resource Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Section 43: Publish, unpublish, and upload slides, PDFs, code templates, and prompts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Resource</span>
        </button>
      </div>

      {showAddModal && (
        <form
          onSubmit={handleAddResource}
          className="rounded-3xl bg-slate-900 border border-slate-700 p-6 space-y-4 shadow-2xl animate-in fade-in duration-150"
        >
          <h3 className="font-bold text-white text-sm">Add Workshop Material</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Masterclass Presentation PDF"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Resource Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
              >
                <option value="presentation">Presentation / Slides</option>
                <option value="guide">Prompt Engineering Guide</option>
                <option value="code">Starter Code / Repo</option>
                <option value="pdf">PDF Guidelines</option>
                <option value="link">API / External Link</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Description *</label>
              <textarea
                rows={2}
                required
                placeholder="Overview of the material..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">File / Download URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-red-400 focus:outline-none font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
            >
              Add Resource
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {resources.map((res) => (
          <div
            key={res.id}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                  {res.resource_type}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  res.published ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-500"
                }`}>
                  {res.published ? "Published" : "Unpublished (Draft)"}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">{res.title}</h3>
              <p className="text-xs text-slate-400">{res.description}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
              <button
                onClick={() => handleTogglePublish(res.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  res.published
                    ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {res.published ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                <span>{res.published ? "Visible" : "Hidden"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
