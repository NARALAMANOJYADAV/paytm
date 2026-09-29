import { NextRequest, NextResponse } from "next/server";
import { buildWalletPassData } from "@/lib/wallet";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await params;

  const pass = buildWalletPassData({
    registrationId: ticketId,
    participantName: "Workshop Participant",
    rollNumber: "NBKRIST-STUDENT",
    branch: "IT / AI&DS",
    venue: "Seminar Hall-1, New CSE Block, NBKRIST",
    eventDate: "30 September 2026",
  });

  return NextResponse.json(pass, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.apple.pkpass+json",
      "Content-Disposition": `attachment; filename="${ticketId}-pass.json"`,
    },
  });
}
