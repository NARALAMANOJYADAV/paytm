"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  CreditCard,
  UserCheck,
  Shield,
  Layers,
  Send,
  Megaphone,
  HelpCircle,
  Settings,
  Award,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { isStoreReady, refreshStore, useStore } from "@/lib/store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, role, currentUser } = useAuth();
  const store = useStore();
  const [retrying, setRetrying] = useState(false);
  const [loadError, setLoadError] = useState("");

  const isAdmin = role === "admin";

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`);
    }
  }, [loading, isAdmin, pathname, router]);

  const pendingCount = store.registrations.filter((r) => r.payment_status === "pending").length;

  const navItems = [
    { name: "Executive Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Event Management", href: "/admin/event", icon: Calendar },
    { name: "Participants", href: "/admin/participants", icon: Users },
    { name: "Payments to verify", href: "/admin/payments", icon: CreditCard, badge: pendingCount },
    { name: "Gate Attendance", href: "/admin/attendance", icon: UserCheck },
    { name: "Coordinators & Roles", href: "/admin/coordinators", icon: Shield },
    { name: "Teams & Roster", href: "/admin/teams", icon: Layers },
    { name: "Judging & Submissions", href: "/admin/submissions", icon: Send },
    { name: "Certificates", href: "/admin/certificates", icon: Award },
    { name: "Event Resources", href: "/admin/resources", icon: BookOpen },
    { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { name: "Support Desk", href: "/admin/support", icon: HelpCircle },
    { name: "Platform Settings", href: "/admin/settings", icon: Settings },
  ];

  const isActiveHref = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  const retry = async () => {
    setRetrying(true);
    setLoadError("");
    try {
      await refreshStore();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load event data.");
    } finally {
      setRetrying(false);
    }
  };

  // Guard: skeleton while the session resolves, nothing while redirecting.
  if (loading || !isAdmin) {
    return (
      <div className="flex-1 min-h-screen bg-field p-4 sm:p-6 lg:p-8" role="status" aria-live="polite">
        <div className="max-w-6xl mx-auto space-y-4" aria-hidden="true">
          <div className="frame bg-paper p-6 space-y-3">
            <div className="h-6 w-64 max-w-full bg-field-2 animate-pulse" />
            <div className="h-4 w-96 max-w-full bg-field-2 animate-pulse" />
          </div>
          <div className="planes grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="p-5 space-y-3">
                <div className="h-3 w-20 bg-field-2 animate-pulse" />
                <div className="h-8 w-16 bg-field-2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <span className="sr-only">{loading ? "Loading admin console…" : "Redirecting to sign in…"}</span>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-field flex flex-col lg:flex-row rule-t">

      {/* Admin navigation plane */}
      <aside className="w-full lg:w-72 flex-shrink-0 bg-paper rule-b lg:border-b-0 lg:border-r lg:border-line">
        {/* Full-height panel; only its contents stick while the page scrolls */}
        <div className="flex flex-col lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-4.5rem)] lg:overflow-y-auto">

        {/* Identity strip */}
        <div className="px-4 sm:px-6 lg:px-5 py-4 rule-b flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-base font-semibold wide text-ink leading-tight">
              Admin console
            </span>
            <span className="block text-xs text-ink-2 truncate">
              {currentUser?.name || currentUser?.email || "Administrator"}
            </span>
          </div>
          <span className="tag tag-info flex-shrink-0">Administrator</span>
        </div>

        {/* Mobile / tablet: horizontal rail */}
        <nav
          aria-label="Admin modules"
          className="lg:hidden flex overflow-x-auto bg-paper"
        >
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = isActiveHref(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="rail-item flex-shrink-0"
              >
                <IconComp className="w-4 h-4" aria-hidden="true" />
                <span>{item.name}</span>
                {!!item.badge && (
                  <span className="tag tag-pending num" aria-label={`${item.badge} pending`}>{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop: module list */}
        <nav aria-label="Admin modules" className="hidden lg:block flex-1 py-2">
          <ul>
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = isActiveHref(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex items-center gap-3 min-h-11 pl-5 pr-4 text-sm transition-colors ${
                      isActive
                        ? "font-semibold text-ink bg-paper-2"
                        : "font-semibold text-ink-2 hover:text-ink hover:bg-paper-2"
                    }`}
                  >
                    {isActive && (
                      <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-sky" />
                    )}
                    <IconComp className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-ink" : "text-ink-2"}`} aria-hidden="true" />
                    <span className="flex-1">{item.name}</span>
                    {!!item.badge && (
                      <span className="tag tag-pending num" aria-label={`${item.badge} pending`}>{item.badge}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        {!isStoreReady() && (
          <div
            role="alert"
            className="mb-6 frame bg-alert-soft p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-ink"
          >
            <span>
              Event data could not be loaded from the server. {loadError && <span className="text-alert">{loadError}</span>}
            </span>
            <button
              type="button"
              onClick={retry}
              disabled={retrying}
              aria-busy={retrying}
              className="btn btn-ink btn-sm min-h-11 self-start sm:self-auto"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>{retrying ? "Retrying…" : "Retry"}</span>
            </button>
          </div>
        )}

        {children}

      </div>

    </div>
  );
}
