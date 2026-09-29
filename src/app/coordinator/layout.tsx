"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  QrCode,
  Users,
  SearchCheck,
  HelpCircle,
  LayoutDashboard,
  Lock,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { isStoreReady, refreshStore, useStore } from "@/lib/store";
import type { CoordinatorPermission } from "@/lib/types";

type NavItem = {
  name: string;
  href: string;
  icon: typeof QrCode;
  /** Any one of these grants the section. Empty = every staff member. */
  anyOf: CoordinatorPermission[];
};

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/coordinator", icon: LayoutDashboard, anyOf: [] },
  { name: "QR Check-in Scanner", href: "/coordinator/checkin", icon: QrCode, anyOf: ["CHECKIN_VIEW", "CHECKIN_MANAGE"] },
  { name: "Participant Roster", href: "/coordinator/participants", icon: Users, anyOf: ["PARTICIPANT_VIEW"] },
  { name: "Payment Verification", href: "/coordinator/verify", icon: SearchCheck, anyOf: ["REGISTRATION_VERIFY"] },
  { name: "Support Desk", href: "/coordinator/support", icon: HelpCircle, anyOf: ["SUPPORT_VIEW", "SUPPORT_REPLY"] },
];

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, role, currentUser, permissions } = useAuth();
  const store = useStore();

  const allowed = role === "coordinator" || role === "admin";
  const can = (p: CoordinatorPermission) => role === "admin" || permissions.includes(p);

  useEffect(() => {
    if (!loading && !allowed) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/coordinator")}`);
    }
  }, [loading, allowed, pathname, router]);

  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const retry = async () => {
    setRetrying(true);
    setRetryError(null);
    try {
      await refreshStore();
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Could not load event data.");
    } finally {
      setRetrying(false);
    }
  };

  if (loading || !allowed) {
    return (
      <div className="min-h-screen bg-field flex flex-col" aria-busy="true">
        <div className="plane-navy rule-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <span className="tag tag-info">Coordinator</span>
            <span className="h-4 w-40 bg-[rgba(255,255,255,0.2)] animate-pulse" aria-hidden="true" />
          </div>
        </div>
        <div className="bg-paper rule-b h-12" aria-hidden="true" />
        <div className="flex-1 w-full px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="frame bg-paper p-6 space-y-3">
              <div className="h-6 w-64 bg-field-2 animate-pulse" aria-hidden="true" />
              <div className="h-4 w-80 max-w-full bg-field-2 animate-pulse" aria-hidden="true" />
            </div>
            <p className="text-sm text-ink-2" role="status">
              {loading ? "Loading coordinator desk…" : "Redirecting to sign in…"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const navItems = NAV_ITEMS.filter((item) => item.anyOf.length === 0 || item.anyOf.some(can));
  const current = NAV_ITEMS.find((item) =>
    item.href === "/coordinator" ? pathname === item.href : pathname?.startsWith(item.href)
  );
  const sectionDenied = !!current && current.anyOf.length > 0 && !current.anyOf.some(can);

  const coordinatorRow = currentUser ? store.coordinators.find((c) => c.user_id === currentUser.id) : undefined;
  const canSeeAttendance = can("CHECKIN_VIEW") || can("CHECKIN_MANAGE");
  const storeReady = isStoreReady();

  return (
    <div className="min-h-screen bg-field flex flex-col">
      {/* Identity strip: the one navy plane of every coordinator view */}
      <div className="plane-navy rule-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="tag tag-info">{role === "admin" ? "Admin" : "Coordinator"}</span>
            <span className="font-bold text-white truncate">{currentUser?.name || "Staff member"}</span>
            {coordinatorRow?.employee_or_student_id && (
              <span className="hidden sm:inline font-mono text-xs text-[rgba(255,255,255,0.7)]">
                {coordinatorRow.employee_or_student_id}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {canSeeAttendance && (
              <div className="flex items-baseline gap-2" aria-live="polite">
                <span className="cell-label">Checked in</span>
                <span className="num text-xl font-semibold text-white">
                  {storeReady ? store.attendance.length : "–"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rail sub-nav */}
      <nav aria-label="Coordinator sections" className="bg-paper rule-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex overflow-x-auto">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="rail-item shrink-0"
              >
                <IconComp className="w-4 h-4" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 w-full px-4 sm:px-6 py-6 sm:py-8">
        {!storeReady && (
          <div className="max-w-6xl mx-auto mb-6 frame bg-paper p-4 flex flex-wrap items-center justify-between gap-3" role="alert">
            <p className="text-sm text-alert">
              {retryError || "Event data could not be loaded. Figures below may be empty."}
            </p>
            <button onClick={retry} disabled={retrying} aria-busy={retrying} className="btn btn-sm">
              <RefreshCw className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`} aria-hidden="true" />
              {retrying ? "Retrying…" : "Retry"}
            </button>
          </div>
        )}

        {sectionDenied ? (
          <div className="max-w-3xl mx-auto frame bg-paper p-6 sm:p-8 flex items-start gap-4">
            <Lock className="w-8 h-8 text-ink-2 shrink-0" aria-hidden="true" />
            <div className="space-y-2">
              <h1 className="text-xl font-semibold wide">No access to this section</h1>
              <p className="text-sm text-ink-2">
                Your coordinator account does not have the permission for {current?.name}. Ask the event admin to
                enable it.
              </p>
              <Link href="/coordinator" className="btn btn-sm">
                Back to overview
              </Link>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
