"use client";

import React, { useState } from "react";
import { Plus, ToggleLeft, ToggleRight, AlertCircle, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { useStore, saveAnnouncement, setAnnouncementPublished, deleteAnnouncement } from "@/lib/store";
import { Announcement } from "@/lib/types";

type Draft = {
  id?: string;
  title: string;
  content: string;
  priority: Announcement["priority"];
  category: Announcement["category"];
  published: boolean;
};

const emptyDraft = (): Draft => ({ title: "", content: "", priority: "normal", category: "general", published: true });

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
};

export default function AdminAnnouncementsPage() {
  const { announcements } = useStore();
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
        saveAnnouncement({
          ...(draft.id ? { id: draft.id } : {}),
          title: draft.title.trim(),
          content: draft.content.trim(),
          priority: draft.priority,
          category: draft.category,
          published: draft.published,
        }),
      draft.id ? "Announcement updated." : draft.published ? "Announcement broadcast." : "Announcement saved as draft.",
    );
    if (ok) setDraft(null);
  };

  const handleDelete = (item: Announcement) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    run(`del:${item.id}`, () => deleteAnnouncement(item.id), "Announcement deleted.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="frame bg-paper p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title text-ink">Event Announcements &amp; Live Ticker</h1>
          <p className="mt-2 text-sm text-ink-2">
            Publish broadcasts displayed across the website header and user dashboards.
          </p>
        </div>
        <button
          onClick={() => setDraft(draft && !draft.id ? null : emptyDraft())}
          aria-expanded={!!draft && !draft.id}
          className="btn btn-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New Announcement</span>
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
            {draft.id ? "Edit Announcement" : "Draft Live Broadcast"}
          </h2>
          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ann-title" className="field-label">Headline *</label>
              <input
                id="ann-title"
                type="text"
                required
                maxLength={150}
                placeholder="e.g. Build Challenge Kickoff at 1:30 PM"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="field"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ann-priority" className="field-label">Priority</label>
                <select
                  id="ann-priority"
                  value={draft.priority}
                  onChange={(e) => setDraft({ ...draft, priority: e.target.value as Announcement["priority"] })}
                  className="field"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent / Alert</option>
                </select>
              </div>
              <div>
                <label htmlFor="ann-category" className="field-label">Category</label>
                <select
                  id="ann-category"
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value as Announcement["category"] })}
                  className="field"
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
              <label htmlFor="ann-content" className="field-label">Details Message *</label>
              <textarea
                id="ann-content"
                rows={2}
                required
                maxLength={2000}
                placeholder="Message body shown in top ticker..."
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
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
              <span>Published (broadcast now)</span>
            </label>
          </div>
          <div className="flex flex-wrap justify-end gap-2 px-5 sm:px-6 py-4 rule-t bg-field">
            <button type="button" onClick={() => setDraft(null)} className="btn">
              Cancel
            </button>
            <button type="submit" disabled={busy === "save"} aria-busy={busy === "save"} className="btn btn-primary">
              {busy === "save" ? "Saving…" : draft.id ? "Save Changes" : draft.published ? "Broadcast Now" : "Save Draft"}
            </button>
          </div>
        </form>
      )}

      <ul className="planes grid-cols-1">
        {announcements.map((item) => (
          <li
            key={item.id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {item.priority === "urgent" ? (
                  <span className="tag tag-alert">
                    <AlertCircle className="w-3 h-3" aria-hidden="true" />
                    {item.priority}
                  </span>
                ) : (
                  <span className="tag">{item.priority}</span>
                )}
                <span className="tag tag-info">{item.category}</span>
                <span className={`tag ${item.published ? "tag-ok" : "tag-pending"}`}>
                  {item.published ? "Published" : "Draft"}
                </span>
                <span className="font-mono text-xs text-ink-3">{formatDate(item.created_at)}</span>
              </div>
              <h3 className="font-semibold text-ink text-base">{item.title}</h3>
              <p className="text-sm text-ink-2">{item.content}</p>
            </div>

            <div className="flex flex-wrap gap-2 flex-shrink-0 self-start sm:self-auto">
              <button
                onClick={() =>
                  run(
                    `pub:${item.id}`,
                    () => setAnnouncementPublished(item.id, !item.published),
                    item.published ? "Broadcast paused." : "Announcement published.",
                  )
                }
                disabled={busy === `pub:${item.id}`}
                aria-busy={busy === `pub:${item.id}`}
                aria-pressed={item.published}
                className="btn btn-sm min-h-11"
              >
                {item.published ? (
                  <ToggleRight className="w-5 h-5 text-ok" aria-hidden="true" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-ink-3" aria-hidden="true" />
                )}
                <span>{item.published ? "Broadcasting" : "Paused"}</span>
              </button>
              <button
                onClick={() =>
                  setDraft({
                    id: item.id,
                    title: item.title,
                    content: item.content,
                    priority: item.priority,
                    category: item.category,
                    published: item.published,
                  })
                }
                className="btn btn-sm min-h-11"
                aria-label={`Edit ${item.title}`}
              >
                <Pencil className="w-4 h-4" aria-hidden="true" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(item)}
                disabled={busy === `del:${item.id}`}
                aria-busy={busy === `del:${item.id}`}
                className="btn btn-sm btn-danger min-h-11"
                aria-label={`Delete ${item.title}`}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>
          </li>
        ))}
        {announcements.length === 0 && (
          <li className="p-8 text-center text-sm text-ink-2">No announcements yet.</li>
        )}
      </ul>
    </div>
  );
}
