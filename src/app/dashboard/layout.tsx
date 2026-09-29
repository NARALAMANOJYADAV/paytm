"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Ticket,
  User,
  Calendar,
  BookOpen,
  Users,
  Send,
  Award,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useStore } from "@/lib/store";

function DashboardSkeleton() {
  return (
    <div className="flex-1 flex flex-col" aria-busy="true" aria-live="polite">
      <div className="bg-paper rule-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <span className="h-5 w-40 bg-field-2 animate-pulse" />
          <span className="h-4 w-28 bg-field-2 animate-pulse" />
          <span className="h-4 w-24 bg-field-2 animate-pulse" />
        </div>
      </div>
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        <div className="frame bg-paper px-5 py-5 sm:px-6 space-y-3">
          <span className="block h-7 w-64 max-w-full bg-field-2 animate-pulse" />
          <span className="block h-4 w-80 max-w-full bg-field-2 animate-pulse" />
        </div>
        <div className="frame bg-paper h-40 animate-pulse" />
        <span className="sr-only">Loading your participant dashboard…</span>
      </div>
    </div>
  );
}

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, role, currentProfile, currentUser, currentRegistration } = useAuth();
  const { eventConfig } = useStore();

  const authorized = role === "user";

  useEffect(() => {
    if (!loading && !authorized) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [loading, authorized, pathname, router]);

  if (loading || !authorized) return <DashboardSkeleton />;

  const navItems = [
    { name: "Overview & Ticket", href: "/dashboard", icon: Ticket },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
    { name: "Event Schedule", href: "/dashboard/schedule", icon: Calendar },
    { name: "Resources", href: "/dashboard/resources", icon: BookOpen },
    { name: "My Team", href: "/dashboard/team", icon: Users },
    { name: "Project Submission", href: "/dashboard/submission", icon: Send },
    { name: "Certificate", href: "/dashboard/certificate", icon: Award },
    { name: "Support Desk", href: "/dashboard/support", icon: HelpCircle },
  ];

  const participantName = currentProfile?.certificate_name || currentUser?.name || "Participant";
  const rollNumber = currentProfile?.roll_number;
  const ticketId = currentRegistration?.registration_number;

  // Status tag for the identity strip, driven by the real registration
  let statusLabel = "Not registered";
  let statusClass = "tag-off";
  if (currentRegistration) {
    if (currentRegistration.registration_status === "cancelled") {
      statusLabel = "Cancelled";
      statusClass = "tag-off";
    } else if (currentRegistration.payment_status === "failed") {
      statusLabel = "Payment rejected";
      statusClass = "tag-alert";
    } else if (currentRegistration.payment_status === "refunded") {
      statusLabel = "Refunded";
      statusClass = "tag-off";
    } else if (currentRegistration.payment_status === "success" && currentRegistration.registration_status === "confirmed") {
      statusLabel = "Paid";
      statusClass = "tag-ok";
    } else {
      statusLabel = "Payment under verification";
      statusClass = "tag-pending";
    }
  }

  return (
    <div className="flex-1 flex flex-col">

      {/* Identity strip */}
      <div className="bg-paper rule-b print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="min-w-0 flex-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-semibold wide text-ink text-base truncate max-w-full">
              {participantName}
            </span>
            {rollNumber && (
              <span className="text-xs text-ink-2">
                Roll <span className="font-mono text-ink">{rollNumber}</span>
              </span>
            )}
            {ticketId && (
              <span className="text-xs text-ink-2">
                Ticket <span className="font-mono font-bold text-ink">{ticketId}</span>
              </span>
            )}
            <span className={`tag ${statusClass}`}>{statusLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-2 hidden sm:inline">
              Event date <span className="font-bold text-ink num">{eventConfig.date_formatted}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Section rail */}
      <nav aria-label="Participant sections" className="bg-paper rule-b print:hidden">
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
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </div>

    </div>
  );
}
