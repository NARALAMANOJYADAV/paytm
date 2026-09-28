import { NextRequest, NextResponse } from "next/server";
import { generateIcsContent } from "@/lib/ics";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await params;
  const icsString = generateIcsContent({
    title: "Prompt to Production – Paytm AI Workshop",
    description: `Prompt to Production – Paytm AI Workshop organized by Department of IT & AI&DS, NBKRIST in association with ISTE. Ticket ID: ${ticketId}`,
    location: "Seminar Hall, New CSE Block, NBKRIST Campus, Vidyanagar",
    alarmDescription: "Prompt to Production workshop starts in 30 minutes.",
  });

  return new NextResponse(icsString, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="P2P-${ticketId}.ics"`,
    },
  });
}
