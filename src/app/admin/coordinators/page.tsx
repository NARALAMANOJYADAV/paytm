"use client";

import React, { useState } from "react";
import { Plus, Check, Lock, CheckCircle2 } from "lucide-react";
import { useStore, toggleCoordinatorPermission, setCoordinatorStatus, createCoordinator } from "@/lib/store";
import { CoordinatorPermission } from "@/lib/types";

const allPermissions: { key: CoordinatorPermission; label: string; desc: string }[] = [
  { key: "CHECKIN_VIEW", label: "Check-in Scanner View", desc: "Access the QR camera scanner interface" },
  { key: "CHECKIN_MANAGE", label: "Confirm Check-ins", desc: "Record and confirm participant attendance" },
  { key: "PARTICIPANT_VIEW", label: "Participant List", desc: "View registered students and search records" },
  { key: "REGISTRATION_VERIFY", label: "Registration Verification", desc: "Approve or reject payment screenshots and issue tickets" },
  { key: "SUPPORT_VIEW", label: "Support Desk View", desc: "Read student queries and issues" },
  { key: "SUPPORT_REPLY", label: "Support Reply", desc: "Send official responses to participant tickets" },
];

const DEFAULT_PERMS: CoordinatorPermission[] = ["CHECKIN_VIEW", "CHECKIN_MANAGE", "PARTICIPANT_VIEW"];

export default function AdminCoordinatorsPage() {
  const { coordinators } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // New coordinator form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [idNum, setIdNum] = useState("");
  const [perms, setPerms] = useState<CoordinatorPermission[]>(DEFAULT_PERMS);

  const run = async (key: string, fn: () => Promise<unknown>, success?: string) => {
    setBusy(key);
    setNotice(null);
    try {
      await fn();
      if (success) setNotice({ ok: true, text: success });
      return true;
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : "Request failed." });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const handleToggle = (coordId: string, perm: CoordinatorPermission, enabled: boolean) =>
    run(`${coordId}:${perm}`, () => toggleCoordinatorPermission(coordId, perm, enabled));

  const handleToggleStatus = (coordId: string, current: "active" | "disabled") =>
    run(
      `${coordId}:status`,
      () => setCoordinatorStatus(coordId, current === "active" ? "disabled" : "active"),
      current === "active" ? "Coordinator access disabled." : "Coordinator access activated.",
    );

  const handleAddCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setNotice({ ok: false, text: "Password must be at least 8 characters." });
      return;
    }
    const ok = await run(
      "create",
      () =>
        createCoordinator({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          employeeId: idNum.trim() || undefined,
          permissions: perms,
        }),
      `Coordinator ${name.trim()} created. Share the email and password with them securely.`,
    );
    if (ok) {
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setIdNum("");
      setPerms(DEFAULT_PERMS);
      setShowAddModal(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="frame bg-paper p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title text-ink">Coordinator Management & Access Control</h1>
          <p className="mt-2 text-sm text-ink-2">
            Create coordinator accounts and grant granular operational permissions for event day.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          aria-expanded={showAddModal}
          aria-controls="add-coordinator-form"
          className="btn btn-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add New Coordinator</span>
        </button>
      </div>

      {/* Add Coordinator Form */}
      {showAddModal && (
        <form
          id="add-coordinator-form"
          onSubmit={handleAddCoordinator}
          className="frame bg-paper"
        >
          <h2 className="px-5 sm:px-6 py-4 rule-b text-lg font-semibold wide text-ink">
            Register New Event Coordinator
          </h2>
          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="coord-name" className="field-label">Full Name *</label>
              <input
                id="coord-name"
                type="text"
                required
                placeholder="e.g. K. V. Chaitanya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="coord-email" className="field-label">Email ID *</label>
              <input
                id="coord-email"
                type="email"
                required
                placeholder="coordinator@nbkrist.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="coord-password" className="field-label">Initial password *</label>
              <input
                id="coord-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
                aria-describedby="coord-password-hint"
              />
              <p id="coord-password-hint" className="field-hint">At least 8 characters.</p>
            </div>
            <div>
              <label htmlFor="coord-phone" className="field-label">Phone</label>
              <input
                id="coord-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="coord-id" className="field-label">Employee / Student ID</label>
              <input
                id="coord-id"
                type="text"
                placeholder="NBKR-COORD-104"
                value={idNum}
                onChange={(e) => setIdNum(e.target.value)}
                className="field font-mono"
              />
            </div>
            <fieldset className="sm:col-span-3">
              <legend className="field-label">Initial permissions</legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
                {allPermissions.map((perm) => (
                  <label key={perm.key} className="inline-flex items-center gap-3 min-h-11 text-sm text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={perms.includes(perm.key)}
                      onChange={(e) =>
                        setPerms((cur) => (e.target.checked ? [...cur, perm.key] : cur.filter((x) => x !== perm.key)))
                      }
                      className="w-5 h-5 accent-sky"
                    />
                    <span>{perm.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn">
              Cancel
            </button>
            <button type="submit" disabled={busy === "create"} aria-busy={busy === "create"} className="btn btn-primary">
              {busy === "create" ? "Creating…" : "Create Coordinator"}
            </button>
          </div>
        </form>
      )}

      {notice && (
        <div
          role={notice.ok ? "status" : "alert"}
          className={`frame p-4 text-sm flex items-center gap-2 ${notice.ok ? "bg-ok-soft text-ink" : "bg-alert-soft text-alert font-semibold"}`}
        >
          {notice.ok && <CheckCircle2 className="w-4 h-4 text-ok flex-shrink-0" aria-hidden="true" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Permission matrix (Section 45) */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold wide text-ink">Permission matrix</h2>
        <div className="frame bg-paper overflow-x-auto">
          <table className="table-planes">
            <caption className="sr-only">
              Coordinator permissions. Each checkbox grants one permission to one coordinator.
            </caption>
            <thead>
              <tr>
                <th scope="col" className="min-w-[14rem]">Coordinator</th>
                {allPermissions.map((perm) => (
                  <th key={perm.key} scope="col" className="text-center align-bottom min-w-[7.5rem]">
                    <span className="block normal-case tracking-normal text-xs font-bold text-ink">{perm.label}</span>
                    <span className="block font-mono text-[10px] font-medium tracking-normal text-ink-3 mt-0.5">{perm.key}</span>
                  </th>
                ))}
                <th scope="col">Access</th>
              </tr>
            </thead>
            <tbody>
              {coordinators.length === 0 ? (
                <tr>
                  <td colSpan={allPermissions.length + 2} className="text-ink-2">
                    No coordinators yet. Use Add New Coordinator to create one.
                  </td>
                </tr>
              ) : (
                coordinators.map((coord) => (
                  <tr key={coord.id}>
                    <th scope="row" className="!bg-transparent !border-b-rule !border-b font-normal normal-case tracking-normal text-sm align-middle">
                      <span className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-ink">{coord.name}</span>
                        <span className={`tag ${coord.status === "active" ? "tag-ok" : "tag-off"}`}>{coord.status}</span>
                      </span>
                      <span className="block text-xs text-ink-2 mt-1">{coord.email}</span>
                      <span className="block text-xs text-ink-2">
                        ID: <span className="font-mono font-bold text-ink">{coord.employee_or_student_id || "—"}</span>
                        {" • "}
                        <span className="num">{coord.permissions.length}</span> enabled
                      </span>
                    </th>
                    {allPermissions.map((perm) => {
                      const isEnabled = coord.permissions.includes(perm.key);
                      const cellBusy = busy === `${coord.id}:${perm.key}`;
                      return (
                        <td key={perm.key} className="text-center">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={isEnabled}
                            aria-label={`${perm.label} for ${coord.name}`}
                            title={perm.desc}
                            onClick={() => handleToggle(coord.id, perm.key, !isEnabled)}
                            disabled={cellBusy}
                            aria-busy={cellBusy}
                            className={`group inline-flex items-center justify-center w-11 h-11 hover:bg-paper-2 ${cellBusy ? "opacity-50" : ""}`}
                          >
                            <span
                              aria-hidden="true"
                              className={`inline-flex items-center justify-center w-6 h-6 border transition-colors ${
                                isEnabled
                                  ? "bg-sky border-sky text-on-accent"
                                  : "bg-field-2 border-line text-transparent group-hover:border-ink-3"
                              }`}
                            >
                              <Check className="w-4 h-4" strokeWidth={3} />
                            </span>
                          </button>
                        </td>
                      );
                    })}
                    <td>
                      <button
                        onClick={() => handleToggleStatus(coord.id, coord.status)}
                        disabled={busy === `${coord.id}:status`}
                        aria-busy={busy === `${coord.id}:status`}
                        className={`btn btn-sm min-h-11 ${coord.status === "active" ? "btn-danger" : ""}`}
                      >
                        {coord.status === "active" ? "Disable Access" : "Activate Access"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Permission reference */}
      <section aria-label="Permission reference" className="planes grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {allPermissions.map((perm) => (
          <div key={perm.key} className="p-4">
            <span className="block font-bold text-sm text-ink">{perm.label}</span>
            <span className="block text-sm text-ink-2 mt-1">{perm.desc}</span>
            <span className="block font-mono text-xs text-ink-3 mt-2">{perm.key}</span>
          </div>
        ))}
      </section>

      {/* Restricted Areas Notice (Section 44) */}
      <div className="frame bg-paper p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-ink-2">
        <span className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-ink-3 flex-shrink-0" aria-hidden="true" />
          <span>Always admin-only: event settings, coordinator accounts, judging, certificates, resources and announcements.</span>
        </span>
        <span className="tag tag-info self-start sm:self-auto">Enforced by RBAC</span>
      </div>

    </div>
  );
}
