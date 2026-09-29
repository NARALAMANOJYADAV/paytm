/**
 * Digital Wallet Pass Generator
 * Prepares payload compliant with Apple Wallet Event Ticket / Google Wallet Pass schemas
 * and provides simulated .pkpass / pass json download.
 */

export interface WalletPassPayload {
  formatVersion: number;
  passTypeIdentifier: string;
  serialNumber: string;
  teamIdentifier: string;
  organizationName: string;
  description: string;
  foregroundColor: string;
  backgroundColor: string;
  labelColor: string;
  eventTicket: {
    primaryFields: Array<{ key: string; label: string; value: string }>;
    secondaryFields: Array<{ key: string; label: string; value: string }>;
    auxiliaryFields: Array<{ key: string; label: string; value: string }>;
    backFields: Array<{ key: string; label: string; value: string }>;
  };
  barcode: {
    message: string;
    format: string;
    messageEncoding: string;
    altText: string;
  };
}

export function buildWalletPassData(ticket: {
  registrationId: string;
  participantName: string;
  rollNumber: string;
  branch: string;
  venue: string;
  eventDate: string;
}): WalletPassPayload {
  return {
    formatVersion: 1,
    passTypeIdentifier: "pass.org.nbkrist.prompt2production",
    serialNumber: ticket.registrationId,
    teamIdentifier: "NBKRIST-ISTE",
    organizationName: "N.B.K.R. Institute of Science & Technology",
    description: "Prompt to Production – Paytm AI Workshop Ticket",
    foregroundColor: "rgb(255, 255, 255)",
    backgroundColor: "rgb(15, 23, 42)", // Deep slate navy
    labelColor: "rgb(56, 189, 248)", // Electric cyan
    eventTicket: {
      primaryFields: [
        {
          key: "event",
          label: "EVENT",
          value: "PROMPT TO PRODUCTION"
        }
      ],
      secondaryFields: [
        {
          key: "attendee",
          label: "PARTICIPANT",
          value: ticket.participantName
        },
        {
          key: "regId",
          label: "REGISTRATION ID",
          value: ticket.registrationId
        }
      ],
      auxiliaryFields: [
        {
          key: "date",
          label: "DATE & TIME",
          value: "30 SEP 2026 | 9:00 AM"
        },
        {
          key: "venue",
          label: "VENUE",
          value: "Seminar Hall-1, New CSE Block"
        },
        {
          key: "roll",
          label: "ROLL NUMBER",
          value: ticket.rollNumber
        }
      ],
      backFields: [
        {
          key: "instructions",
          label: "WORKSHOP INSTRUCTIONS",
          value: "Bring your laptop and college ID card. Check-in starts at 8:45 AM. Present this QR code at the entrance."
        },
        {
          key: "organizers",
          label: "ORGANIZED BY",
          value: "Department of IT & AI&DS, NBKRIST in association with ISTE."
        }
      ]
    },
    barcode: {
      message: `ticket_id=${ticket.registrationId}`,
      format: "PKBarcodeFormatQR",
      messageEncoding: "iso-8859-1",
      altText: ticket.registrationId
    }
  };
}

export function downloadWalletPassJson(ticket: {
  registrationId: string;
  participantName: string;
  rollNumber: string;
  branch: string;
  venue: string;
  eventDate: string;
}) {
  const passData = buildWalletPassData(ticket);
  const blob = new Blob([JSON.stringify(passData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${ticket.registrationId}-wallet-pass.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
