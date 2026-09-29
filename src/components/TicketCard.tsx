"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Calendar,
  Printer,
  Smartphone,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { generateQrDataUrl } from "@/lib/qr";
import { downloadIcsFile } from "@/lib/ics";
import { buildWalletPassData } from "@/lib/wallet";
import { triggerDownload, useStore } from "@/lib/store";

interface TicketCardProps {
  registrationId: string;
  /** The real ticket's QR payload (`ticket.qr_token`, "ticket_id=REG&k=token"). Without it nothing renders. */
  qrToken?: string;
  /** Fee actually paid for this registration. */
  fee?: number;
  name: string;
  rollNumber: string;
  branch: string;
  year?: string;
  section?: string;
  isteMember?: boolean;
  status?: string;
  hideActions?: boolean;
}

function statusTagClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("cancel")) return "tag-off";
  if (s.includes("fail") || s.includes("invalid") || s.includes("duplicate")) return "tag-alert";
  if (s.includes("pending") || s.includes("reserved")) return "tag-pending";
  if (s.includes("confirm") || s.includes("paid") || s.includes("check") || s.includes("active")) return "tag-ok";
  return "tag-info";
}

export default function TicketCard({
  registrationId,
  qrToken,
  fee,
  name,
  rollNumber,
  branch,
  year = "",
  section = "",
  isteMember = false,
  status = "Confirmed",
  hideActions = false,
}: TicketCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const ticketRef = useRef<HTMLDivElement>(null);
  const { eventConfig } = useStore();
  const paidFee = fee ?? (isteMember ? eventConfig.iste_fee : eventConfig.non_iste_fee);
  const weekday = eventConfig.date
    ? new Date(`${eventConfig.date}T00:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" })
    : "";

  useEffect(() => {
    if (!qrToken) return;
    let cancelled = false;
    generateQrDataUrl(qrToken).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [qrToken]);

  // Tickets exist only for approved registrations: no token, no ticket.
  if (!qrToken) return null;

  const handleDownloadCalendar = () => {
    downloadIcsFile(`P2P-Workshop-${registrationId}.ics`);
  };

  const handleDownloadWallet = () => {
    const pass = buildWalletPassData({
      registrationId,
      participantName: name,
      rollNumber,
      branch,
      venue: eventConfig.venue,
      eventDate: eventConfig.date_formatted,
    });
    // The pass must carry the same signed payload as the on-screen QR.
    pass.barcode.message = qrToken;
    triggerDownload(JSON.stringify(pass, null, 2), `${registrationId}-wallet-pass.json`, "application/json");
  };

  const handlePrintTicket = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto w-full">
      {/* Gate ticket: framed planes */}
      <div
        ref={ticketRef}
        className="frame bg-paper text-ink [print-color-adjust:exact] [-webkit-print-color-adjust:exact]"
        aria-label={`Event ticket ${registrationId}`}
        role="group"
      >
        {/* Identity header */}
        <div className="plane-navy px-5 py-4 sm:px-6">
          <p className="font-semibold wide text-lg sm:text-xl leading-tight">
            Prompt to Production · Paytm AI Workshop
          </p>
          <p className="text-xs text-[rgba(255,255,255,0.7)] mt-1 leading-snug">
            N.B.K.R. Institute of Science &amp; Technology · Department of IT &amp; AI&amp;DS · In Association with ISTE
          </p>
        </div>

        {/* Participant */}
        <div className="rule-t px-5 py-5 sm:px-6 space-y-3">
          <div>
            <span className="cell-label block">Participant Name</span>
            <span className="block font-semibold wide text-3xl sm:text-4xl leading-[1.05] text-ink break-words mt-1">
              {name}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-2">
            <span>
              Roll <span className="font-mono font-bold text-ink text-base">{rollNumber}</span>
            </span>
            <span>
              <span className="font-bold text-ink">{branch}</span>
              {year && <> · {year.split(" ")[0]}{section && ` - ${section}`}</>}
            </span>
            <span className={`tag ${isteMember ? "tag-ok" : ""}`}>
              {isteMember ? "ISTE Member" : "Non-ISTE"}
            </span>
          </div>
        </div>

        {/* Facts */}
        <div className="planes grid-cols-2 sm:grid-cols-4 border-x-0 border-b-0">
          <div className="p-4">
            <span className="cell-label block">Date</span>
            <span className="block font-bold text-ink num mt-1">{eventConfig.date_formatted}</span>
            <span className="block text-xs text-ink-2">{weekday}</span>
          </div>
          <div className="p-4">
            <span className="cell-label block">Time</span>
            <span className="block font-bold text-ink num mt-1">{eventConfig.time}</span>
            <span className="block text-xs text-ink-2">Check-in 8:45 AM</span>
          </div>
          <div className="p-4">
            <span className="cell-label block">Venue</span>
            <span className="block font-bold text-ink mt-1">{eventConfig.venue}</span>
            <span className="block text-xs text-ink-2">NBKRIST</span>
          </div>
          <div className="plane-sun p-4">
            <span className="cell-label block">Seat Fee</span>
            <span className="block font-bold text-ink num mt-1">₹{paidFee}</span>
            <span className="block text-xs text-ink-2">{isteMember ? "ISTE rate" : "Standard rate"}</span>
          </div>
        </div>

        {/* Perforation */}
        <div className="rule-t" aria-hidden="true">
          <div className="mx-4 my-3 border-t-2 border-dashed border-ink-3" />
        </div>

        {/* Gate stub: QR + ID + status */}
        <div className="px-5 pb-6 sm:px-6 flex flex-col items-center text-center gap-4">
          <div className="bg-white p-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${registrationId}`}
                width={240}
                height={240}
                className="block w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] object-contain"
              />
            ) : (
              <div className="w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] bg-white flex items-center justify-center text-sm text-[#3a414c]">
                Generating QR...
              </div>
            )}
          </div>

          <div>
            <span className="cell-label block">Ticket ID</span>
            <span className="block font-mono font-bold text-2xl sm:text-3xl tracking-wider text-ink mt-1 break-all">
              {registrationId}
            </span>
          </div>

          <span className={`tag ${statusTagClass(status)} text-sm px-3 py-1`}>{status}</span>

          <p className="text-xs text-ink-2">Scan for instant entry verification</p>
        </div>

        {/* Footer */}
        <div className="rule-t px-5 py-3 sm:px-6 flex items-center justify-between gap-3 text-xs text-ink-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            Tamper-evident QR
          </span>
          <span className="font-mono">P2P-SYS-2026-PASS</span>
        </div>
      </div>

      {/* Actions */}
      {!hideActions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:hidden">
          <button
            onClick={handlePrintTicket}
            className="btn btn-primary w-full sm:col-span-2"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Download / Print Ticket</span>
          </button>

          <button
            onClick={handleDownloadCalendar}
            className="btn w-full"
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>Add to Calendar (.ics)</span>
          </button>

          <button
            onClick={handleDownloadWallet}
            className="btn w-full"
          >
            <Smartphone className="w-4 h-4" aria-hidden="true" />
            <span>Add to Wallet (Pass)</span>
          </button>

          <Link
            href="/dashboard/schedule"
            className="btn btn-quiet w-full sm:col-span-2"
          >
            <span>View Event Schedule</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
