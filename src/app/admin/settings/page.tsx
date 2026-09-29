"use client";

import React, { useState } from "react";
import { Database, Key, Server, RefreshCw, CheckCircle2 } from "lucide-react";
import { useStore, isStoreReady, refreshStore } from "@/lib/store";
import { useAuth } from "@/lib/context/AuthContext";

function StatusRow({ label, ok, okText, offText, detail }: { label: string; ok: boolean; okText: string; offText: string; detail?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div className="min-w-0">
        <span className="block text-sm font-bold text-ink">{label}</span>
        {detail && <span className="block text-xs text-ink-2 mt-0.5">{detail}</span>}
      </div>
      <span className={`tag ${ok ? "tag-ok" : "tag-alert"} self-start sm:self-auto`}>{ok ? okText : offText}</span>
    </div>
  );
}

export default function AdminSettingsPage() {
  const store = useStore();
  const { role, currentUser } = useAuth();
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const ready = isStoreReady();
  const cfg = store.eventConfig;

  const recheck = async () => {
    setChecking(true);
    setNotice(null);
    try {
      await refreshStore();
      setNotice({ ok: true, text: "Connection verified. Data reloaded from the server." });
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : "The server could not be reached." });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="frame bg-paper p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title text-ink">Platform & Integration Status</h1>
          <p className="mt-2 text-sm text-ink-2">
            Read-only status of the services this console depends on. Secrets are configured on the server and are never shown here.
          </p>
        </div>
        <button type="button" onClick={recheck} disabled={checking} aria-busy={checking} className="btn self-start sm:self-auto">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>{checking ? "Checking…" : "Re-check connection"}</span>
        </button>
      </div>

      {notice && (
        <div
          role={notice.ok ? "status" : "alert"}
          className={`frame p-4 text-sm flex items-center gap-2 ${notice.ok ? "bg-ok-soft text-ink" : "bg-alert-soft text-alert font-semibold"}`}
        >
          {notice.ok && <CheckCircle2 className="w-4 h-4 text-ok flex-shrink-0" aria-hidden="true" />}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="frame bg-paper">
        <section className="p-5 sm:p-6 rule-b space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold wide text-ink">
            <Database className="w-5 h-5 text-ink-2" aria-hidden="true" />
            Database & storage (Supabase)
          </h2>
          <StatusRow
            label="Event data API"
            ok={ready}
            okText="Connected"
            offText="Not reachable"
            detail={
              ready ? (
                <>
                  <span className="num">{store.registrations.length}</span> registrations,{" "}
                  <span className="num">{store.coordinators.length}</span> coordinators,{" "}
                  <span className="num">{store.attendance.length}</span> check-ins loaded.
                </>
              ) : (
                "The /api/state endpoint did not return data. Check the Supabase environment variables on the server."
              )
            }
          />
        </section>

        <section className="p-5 sm:p-6 rule-b space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold wide text-ink">
            <Key className="w-5 h-5 text-ink-2" aria-hidden="true" />
            Authentication
          </h2>
          <StatusRow
            label="Admin session"
            ok={role === "admin"}
            okText="Signed in"
            offText="No admin session"
            detail={currentUser ? `${currentUser.name} • ${currentUser.email}` : undefined}
          />
        </section>

        <section className="p-5 sm:p-6 space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold wide text-ink">
            <Server className="w-5 h-5 text-ink-2" aria-hidden="true" />
            Payments (manual UPI verification)
          </h2>
          <StatusRow
            label="UPI ID for registrations"
            ok={!!cfg.upi_id}
            okText="Configured"
            offText="Not set"
            detail={cfg.upi_id ? <span className="font-mono">{cfg.upi_id}</span> : "Set it under Event Management so participants know where to pay."}
          />
          <StatusRow
            label="Public registration"
            ok={cfg.registration_open}
            okText="Open"
            offText="Closed"
            detail={
              <>
                <span className="num">{store.seatsTaken}</span> of <span className="num">{cfg.capacity}</span> seats taken
              </>
            }
          />
        </section>
      </div>
    </div>
  );
}
