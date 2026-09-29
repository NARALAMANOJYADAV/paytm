"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { useStore } from "@/lib/store";

/** WhatsApp link to the admin-set payment help contact, pre-filled with the participant's details. */
export default function PaymentHelp({
  registrationNumber,
  utr,
  name,
  context = "My payment is not going through",
  className = "",
}: {
  registrationNumber?: string;
  utr?: string;
  name?: string;
  context?: string;
  className?: string;
}) {
  const { eventConfig } = useStore();
  const number = eventConfig.support_whatsapp?.replace(/\D/g, "");
  if (!number) return null;
  const contact = eventConfig.support_contact_name?.trim() || "the payment desk";
  const lines = [
    `Hi, this is about Prompt to Production registration. ${context}.`,
    name && `Name: ${name}`,
    registrationNumber && `Registration: ${registrationNumber}`,
    utr && `UTR: ${utr}`,
  ].filter(Boolean);
  const href = `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`btn h-auto min-h-11 whitespace-normal py-2.5 text-center leading-snug ${className}`}>
      <MessageCircle className="h-4 w-4 shrink-0 text-[#1f9d55]" aria-hidden="true" />
      Payment problem? WhatsApp {contact}
    </a>
  );
}
