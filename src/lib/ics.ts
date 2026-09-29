/**
 * Generates an RFC 5545 compliant iCalendar (.ics) string
 * Including a 30-minute VALARM reminder as requested.
 */
export function generateIcsContent(options?: {
  title?: string;
  description?: string;
  location?: string;
  startDate?: string; // YYYYMMDDTHHmmss
  endDate?: string;   // YYYYMMDDTHHmmss
  alarmDescription?: string;
}): string {
  const title = options?.title || "Prompt to Production – Paytm AI Workshop";
  const description = options?.description || 
    "Prompt to Production – Paytm AI Workshop organized by Department of IT & AI&DS, N.B.K.R. Institute of Science & Technology in association with ISTE.";
  const location = options?.location || "Seminar Hall-1, New CSE Block, NBKRIST";
  // Workshop date: 30 September 2026, 9:00 AM to 4:00 PM (IST = UTC+5:30 -> UTC 03:30 to 10:30)
  // In local calendar format: 20260930T090000 / 20260930T160000
  const dtStart = options?.startDate || "20260930T090000";
  const dtEnd = options?.endDate || "20260930T160000";
  const alarmDesc = options?.alarmDescription || "Prompt to Production workshop starts in 30 minutes.";
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = `p2p-workshop-2026-${Date.now()}@nbkrist.org`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NBKRIST IT & AIDS//Prompt to Production 2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${alarmDesc}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

export function downloadIcsFile(filename = "prompt-to-production-2026.ics") {
  const content = generateIcsContent();
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
