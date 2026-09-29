"use client";

import React, { useState } from "react";
import { Plus, ToggleLeft, ToggleRight, Pencil, Trash2, ExternalLink, CheckCircle2 } from "lucide-react";
import { useStore, saveResource, setResourcePublished, deleteResource } from "@/lib/store";
import { EventResource } from "@/lib/types";

type Draft = {
  id?: string;
  title: string;
  description: string;
  resource_type: EventResource["resource_type"];
  file_url: string;
  file_size: string;
  published: boolean;
};

const emptyDraft = (): Draft => ({
  title: "",
  description: "",
  resource_type: "guide",
  file_url: "",
  file_size: "",
  published: true,
});

export default function AdminResourcesPage() {
  const { resources } = useStore();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const run = async (key: string, fn: () => Promise<unknown>, success: string) => {
    setBusy(key);
    setNotice(null);
    try {
      await fn();
      setNotice({ ok: true, text: success });
      return true;
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : "Request failed." });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const ok = await run(
      "save",
      () =>
        saveResource({
          ...(draft.id ? { id: draft.id } : {}),
          title: draft.title.trim(),
          description: draft.description.trim(),
          resource_type: draft.resource_type,
          file_url: draft.file_url.trim(),
          file_size: draft.file_size.trim() || undefined,
          published: draft.published,
        }),
      draft.id ? "Resource updated." : "Resource added.",
    );
    if (ok) setDraft(null);
  };

  const handleEdit = (res: EventResource) =>
    setDraft({
      id: res.id,
      title: res.title,
      description: res.description ?? "",
      resource_type: res.resource_type,
      file_url: res.file_url,
      file_size: res.file_size ?? "",
      published: res.published,
    });

  const handleDelete = (res: EventResource) => {
    if (!confirm(`Delete "${res.title}"? Participants will no longer see it.`)) return;
    run(`del:${res.id}`, () => deleteResource(res.id), "Resource deleted.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="frame bg-paper p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title text-ink">Event Resource Management</h1>
          <p className="mt-2 text-sm text-ink-2">
            Publish, unpublish, edit and remove slides, PDFs, code templates, and prompt guides shown on participant dashboards.
          </p>
        </div>
        <button
          onClick={() => setDraft(draft && !draft.id ? null : emptyDraft())}
          aria-expanded={!!draft && !draft.id}
          className="btn btn-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Resource</span>
        </button>
      </header>

      {notice && (
        <div
          role={notice.ok ? "status" : "alert"}
          className={`frame p-4 text-sm flex items-center gap-2 ${notice.ok ? "bg-ok-soft text-ink" : "bg-alert-soft text-alert font-semibold"}`}
        >
          {notice.ok && <CheckCircle2 className="w-4 h-4 text-ok flex-shrink-0" aria-hidden="true" />}
          <span>{notice.text}</span>
        </div>
      )}

      {draft && (
        <form onSubmit={handleSave} className="frame bg-paper">
          <h2 className="text-xl font-semibold wide text-ink px-5 sm:px-6 py-4 rule-b">
            {draft.id ? "Edit Workshop Material" : "Add Workshop Material"}
          </h2>
          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="res-title" className="field-label">Title *</label>
              <input
                id="res-title"
                type="text"
                required
                maxLength={150}
                placeholder="e.g. Masterclass Presentation PDF"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="res-type" className="field-label">Resource Type *</label>
              <select
                id="res-type"
                value={draft.resource_type}
                onChange={(e) => setDraft({ ...draft, resource_type: e.target.value as EventResource["resource_type"] })}
                className="field"
              >
                <option value="presentation">Presentation / Slides</option>
                <option value="guide">Prompt Engineering Guide</option>
                <option value="code">Starter Code / Repo</option>
                <option value="pdf">PDF Guidelines</option>
                <option value="video">Video</option>
                <option value="link">API / External Link</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="res-desc" className="field-label">Description</label>
              <textarea
                id="res-desc"
                rows={2}
                maxLength={1000}
                placeholder="Overview of the material..."
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="res-url" className="field-label">File / Download URL *</label>
              <input
                id="res-url"
                type="url"
                required
                placeholder="https://..."
                value={draft.file_url}
                onChange={(e) => setDraft({ ...draft, file_url: e.target.value })}
                className="field font-mono"
              />
            </div>
            <div>
              <label htmlFor="res-size" className="field-label">Size label</label>
              <input
                id="res-size"
                type="text"
                maxLength={20}
                placeholder="e.g. 2.4 MB"
                value={draft.file_size}
                onChange={(e) => setDraft({ ...draft, file_size: e.target.value })}
                className="field"
              />
            </div>
            <label className="sm:col-span-2 inline-flex items-center gap-3 min-h-11 text-sm font-semibold text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
                className="w-5 h-5 accent-sky"
              />
              <span>Published (visible to participants)</span>
            </label>
          </div>
          <div className="flex flex-wrap justify-end gap-2 px-5 sm:px-6 py-4 rule-t bg-field">
            <button type="button" onClick={() => setDraft(null)} className="btn">
              Cancel
            </button>
            <button type="submit" disabled={busy === "save"} aria-busy={busy === "save"} className="btn btn-primary">
              {busy === "save" ? "Saving…" : draft.id ? "Save Changes" : "Add Resource"}
            </button>
          </div>
        </form>
      )}

      <ul className="planes grid-cols-1">
        {resources.map((res) => (
          <li
            key={res.id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="tag tag-info">{res.resource_type}</span>
                <span className={`tag ${res.published ? "tag-ok" : "tag-pending"}`}>
                  {res.published ? "Published" : "Unpublished (Draft)"}
                </span>
                {res.file_size && <span className="tag num">{res.file_size}</span>}
              </div>
              <h3 className="font-semibold text-ink text-base">{res.title}</h3>
              {res.description && <p className="text-sm text-ink-2">{res.description}</p>}
              <a
                href={res.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-mono text-ink-2 underline underline-offset-4 break-all"
              >
                {res.file_url}
                <ExternalLink className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
              </a>
            </div>

            <div className="flex flex-wrap gap-2 flex-shrink-0 self-start sm:self-auto">
              <button
                onClick={() =>
                  run(
                    `pub:${res.id}`,
                    () => setResourcePublished(res.id, !res.published),
                    res.published ? "Resource hidden from participants." : "Resource published.",
                  )
                }
                disabled={busy === `pub:${res.id}`}
                aria-busy={busy === `pub:${res.id}`}
                aria-pressed={res.published}
                className="btn btn-sm min-h-11"
              >
                {res.published ? (
                  <ToggleRight className="w-5 h-5 text-ok" aria-hidden="true" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-ink-3" aria-hidden="true" />
                )}
                <span>{res.published ? "Visible" : "Hidden"}</span>
              </button>
              <button onClick={() => handleEdit(res)} className="btn btn-sm min-h-11" aria-label={`Edit ${res.title}`}>
                <Pencil className="w-4 h-4" aria-hidden="true" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(res)}
                disabled={busy === `del:${res.id}`}
                aria-busy={busy === `del:${res.id}`}
                className="btn btn-sm btn-danger min-h-11"
                aria-label={`Delete ${res.title}`}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>
          </li>
        ))}
        {resources.length === 0 && (
          <li className="p-8 text-center text-sm text-ink-2">No resources added yet.</li>
        )}
      </ul>
    </div>
  );
}
