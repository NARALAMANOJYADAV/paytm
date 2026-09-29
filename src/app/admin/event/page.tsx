"use client";

import UpiPreview from "@/components/UpiPreview";
import React, { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { useStore, isStoreReady, updateEventConfig } from "@/lib/store";
import { EventConfig } from "@/lib/types";

const IST_OFFSET_MS = 330 * 60 * 1000;

/** ISO instant -> "YYYY-MM-DDTHH:mm" wall-clock in IST, for <input type="datetime-local">. */
const toISTLocal = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 16);
};
/** "YYYY-MM-DDTHH:mm" read as IST -> ISO instant. */
const fromISTLocal = (v: string) => new Date(`${v}:00+05:30`).toISOString();

type Form = EventConfig & { event_end_local: string; submission_deadline_local: string };

export default function AdminEventPage() {
  const store = useStore();
  const [edited, setConfig] = useState<Form | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const ready = isStoreReady();
  // Until the admin edits something, the form mirrors the live server config.
  const c = store.eventConfig;
  const config: Form | null =
    edited ??
    (ready
      ? {
          ...c,
          upi_id: c.upi_id ?? "",
          upi_payee_name: c.upi_payee_name ?? "",
          support_contact_name: c.support_contact_name ?? "",
          support_whatsapp: c.support_whatsapp ?? "",
          event_end_local: toISTLocal(c.event_end_at),
          submission_deadline_local: toISTLocal(c.submission_deadline_at),
        }
      : null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setError("");
    setSavedNotice(false);
    try {
      const patch: Partial<EventConfig> = {
        name: config.name,
        subtitle: config.subtitle,
        organized_by: config.organized_by,
        associated_with: config.associated_with,
        date: config.date,
        date_formatted: config.date_formatted,
        time: config.time,
        venue: config.venue,
        description: config.description,
        capacity: config.capacity,
        registration_open: config.registration_open,
        iste_fee: config.iste_fee,
        non_iste_fee: config.non_iste_fee,
        max_team_size: config.max_team_size,
        upi_id: config.upi_id ?? "",
        upi_payee_name: config.upi_payee_name ?? "",
        support_contact_name: config.support_contact_name ?? "",
        support_whatsapp: config.support_whatsapp ?? "",
      };
      if (config.event_end_local) patch.event_end_at = fromISTLocal(config.event_end_local);
      if (config.submission_deadline_local) patch.submission_deadline_at = fromISTLocal(config.submission_deadline_local);
      await updateEventConfig(patch);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the event configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="max-w-4xl mx-auto frame bg-paper p-6 text-sm text-ink-2" role="status">
        Loading event configuration…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="frame bg-paper p-5 sm:p-6">
        <h1 className="page-title text-ink">Event Management & Settings</h1>
        <p className="mt-2 text-sm text-ink-2">
          Configure workshop schedule, capacity, registration fees, and public registration status.
        </p>
      </div>

      {error && (
        <div role="alert" className="frame bg-alert-soft p-4 text-sm text-alert font-semibold">
          {error}
        </div>
      )}

      {savedNotice && (
        <div role="status" className="frame bg-ok-soft p-4 text-sm text-ink flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-ok flex-shrink-0" aria-hidden="true" />
          <span>Event configuration saved. All portals now use the new values.</span>
        </div>
      )}

      {/* Form matching Section 42 */}
      <form onSubmit={handleSave} className="frame bg-paper">

        {/* Registration status */}
        <div className="p-5 sm:p-6 rule-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold wide text-ink">Public Registration Status</h2>
            <p className="mt-1 text-sm text-ink-2">
              {config.registration_open ? "Registration is OPEN for students" : "Registration is CLOSED"}
              {" • "}
              <span className="num">{store.seatsTaken}</span> of <span className="num">{config.capacity}</span> seats taken
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={config.registration_open}
            aria-label="Public registration"
            onClick={() => setConfig({ ...config, registration_open: !config.registration_open })}
            className="btn min-h-11 self-start sm:self-auto gap-3"
          >
            <span
              aria-hidden="true"
              className={`relative inline-block w-10 h-5 border border-line ${config.registration_open ? "bg-sky-soft" : "bg-field-2"}`}
            >
              <span
                className={`absolute top-0 bottom-0 w-1/2 transition-[left] duration-150 ${
                  config.registration_open ? "left-1/2 bg-sky" : "left-0 bg-ink-3"
                }`}
              />
            </span>
            <span className={`tag ${config.registration_open ? "tag-ok" : "tag-off"}`}>
              {config.registration_open ? "OPEN" : "CLOSED"}
            </span>
          </button>
        </div>

        {/* Schedule & venue */}
        <section className="p-5 sm:p-6 rule-b">
          <h2 className="text-lg font-semibold wide text-ink mb-4">Schedule & venue</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ev-name" className="field-label">Event Title *</label>
              <input
                id="ev-name"
                type="text"
                required
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="field font-bold"
              />
            </div>

            <div>
              <label htmlFor="ev-subtitle" className="field-label">Subtitle / Workshop Brand *</label>
              <input
                id="ev-subtitle"
                type="text"
                required
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="ev-organized" className="field-label">Organized by *</label>
              <input
                id="ev-organized"
                type="text"
                required
                value={config.organized_by}
                onChange={(e) => setConfig({ ...config, organized_by: e.target.value })}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="ev-associated" className="field-label">In association with *</label>
              <input
                id="ev-associated"
                type="text"
                required
                value={config.associated_with}
                onChange={(e) => setConfig({ ...config, associated_with: e.target.value })}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="ev-date" className="field-label">Date *</label>
              <input
                id="ev-date"
                type="date"
                required
                value={config.date}
                onChange={(e) => setConfig({ ...config, date: e.target.value })}
                className="field font-mono"
              />
            </div>

            <div>
              <label htmlFor="ev-date-formatted" className="field-label">Display Date *</label>
              <input
                id="ev-date-formatted"
                type="text"
                required
                placeholder="30 September 2026"
                value={config.date_formatted}
                onChange={(e) => setConfig({ ...config, date_formatted: e.target.value })}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="ev-time" className="field-label">Display Time *</label>
              <input
                id="ev-time"
                type="text"
                required
                value={config.time}
                onChange={(e) => setConfig({ ...config, time: e.target.value })}
                className="field"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ev-venue" className="field-label">Venue Location *</label>
              <input
                id="ev-venue"
                type="text"
                required
                value={config.venue}
                onChange={(e) => setConfig({ ...config, venue: e.target.value })}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="ev-end" className="field-label">Event ends at (IST)</label>
              <input
                id="ev-end"
                type="datetime-local"
                value={config.event_end_local}
                onChange={(e) => setConfig({ ...config, event_end_local: e.target.value })}
                className="field font-mono"
                aria-describedby="ev-end-hint"
              />
              <p id="ev-end-hint" className="field-hint">Certificates can be issued only after this time.</p>
            </div>

            <div>
              <label htmlFor="ev-deadline" className="field-label">Submission deadline (IST)</label>
              <input
                id="ev-deadline"
                type="datetime-local"
                value={config.submission_deadline_local}
                onChange={(e) => setConfig({ ...config, submission_deadline_local: e.target.value })}
                className="field font-mono"
                aria-describedby="ev-deadline-hint"
              />
              <p id="ev-deadline-hint" className="field-hint">Teams cannot save or submit projects after this time.</p>
            </div>
          </div>
        </section>

        {/* Capacity */}
        <section className="p-5 sm:p-6 rule-b">
          <h2 className="text-lg font-semibold wide text-ink mb-4">Capacity & teams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ev-capacity" className="field-label">Attendee Capacity Cap *</label>
              <input
                id="ev-capacity"
                type="number"
                required
                min={1}
                max={5000}
                value={config.capacity}
                onChange={(e) => setConfig({ ...config, capacity: Number(e.target.value) })}
                className="field num"
              />
            </div>

            <div>
              <label htmlFor="ev-team" className="field-label">Max Team Size for Build Challenge</label>
              <input
                id="ev-team"
                type="number"
                required
                min={1}
                max={10}
                value={config.max_team_size}
                onChange={(e) => setConfig({ ...config, max_team_size: Number(e.target.value) })}
                className="field num"
              />
            </div>
          </div>
        </section>

        {/* Pricing Controls */}
        <section className="p-5 sm:p-6 rule-b">
          <h2 className="text-lg font-semibold wide text-ink mb-4">Registration fees</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ev-iste-fee" className="field-label">ISTE Member Registration Fee (INR) *</label>
              <div className="relative">
                <span aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-2">₹</span>
                <input
                  id="ev-iste-fee"
                  type="number"
                  required
                  min={0}
                  value={config.iste_fee}
                  onChange={(e) => setConfig({ ...config, iste_fee: Number(e.target.value) })}
                  className="field num font-bold pl-8"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ev-non-iste-fee" className="field-label">Non-ISTE Registration Fee (INR) *</label>
              <div className="relative">
                <span aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-2">₹</span>
                <input
                  id="ev-non-iste-fee"
                  type="number"
                  required
                  min={0}
                  value={config.non_iste_fee}
                  onChange={(e) => setConfig({ ...config, non_iste_fee: Number(e.target.value) })}
                  className="field num font-bold pl-8"
                />
              </div>
            </div>

            <div className="sm:col-span-2 rounded-2xl border border-line bg-paper-2 p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">UPI payments</h3>
                {config.upi_id?.trim() ? (
                  <span className="tag tag-ok">Live on registration</span>
                ) : (
                  <span className="tag tag-alert">Not set · registration cannot take payments</span>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="ev-upi" className="field-label">UPI ID</label>
                  <input
                    id="ev-upi"
                    type="text"
                    placeholder="nbkrist@okaxis"
                    value={config.upi_id ?? ""}
                    onChange={(e) => setConfig({ ...config, upi_id: e.target.value })}
                    className="field font-mono"
                    aria-describedby="ev-upi-hint"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <p id="ev-upi-hint" className="field-hint">The account that receives registration fees.</p>
                </div>
                <div>
                  <label htmlFor="ev-upi-name" className="field-label">Payee name (account holder)</label>
                  <input
                    id="ev-upi-name"
                    type="text"
                    placeholder="NBKRIST IT & AI&DS"
                    value={config.upi_payee_name ?? ""}
                    onChange={(e) => setConfig({ ...config, upi_payee_name: e.target.value })}
                    className="field"
                  />
                  <p className="field-hint">Any person or account name — use the name the bank shows for this UPI ID so students trust it.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                <UpiPreview upiId={config.upi_id ?? ""} payeeName={config.upi_payee_name ?? ""} amount={config.iste_fee} label="ISTE" />
                <UpiPreview upiId={config.upi_id ?? ""} payeeName={config.upi_payee_name ?? ""} amount={config.non_iste_fee} label="Non-ISTE" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 rule-t pt-4">
                <div>
                  <label htmlFor="ev-help-name" className="field-label">Payment help contact</label>
                  <input
                    id="ev-help-name"
                    type="text"
                    placeholder="e.g. K. V. Chaitanya (Coordinator)"
                    value={config.support_contact_name ?? ""}
                    onChange={(e) => setConfig({ ...config, support_contact_name: e.target.value })}
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="ev-help-wa" className="field-label">WhatsApp number</label>
                  <input
                    id="ev-help-wa"
                    type="tel"
                    inputMode="tel"
                    placeholder="9876543210"
                    value={config.support_whatsapp ?? ""}
                    onChange={(e) => setConfig({ ...config, support_whatsapp: e.target.value })}
                    className="field num"
                  />
                  <p className="field-hint">Students with a failed or unaccepted payment get a WhatsApp button to this number.</p>
                </div>
              </div>
              <p className="text-xs text-ink-3">
                Test before opening registration: scan a preview with your phone&apos;s UPI app and check the payee name and amount (you
                don&apos;t need to complete the payment).
              </p>
            </div>
          </div>
        </section>

        {/* Description */}
        <div className="p-5 sm:p-6 rule-b">
          <label htmlFor="ev-description" className="field-label">Workshop Public Description *</label>
          <textarea
            id="ev-description"
            required
            rows={3}
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            className="field"
          />
        </div>

        <div className="p-5 sm:p-6 flex justify-end">
          <button type="submit" disabled={saving} aria-busy={saving} className="btn btn-primary w-full sm:w-auto">
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>{saving ? "Saving…" : "Save Configuration Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
