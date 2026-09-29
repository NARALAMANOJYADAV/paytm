import type { EventConfig } from "../types";

/** Fallback shown before /api/state responds; the live values come from the event_config table. */
export const initialEventConfig: EventConfig = {
  name: "Prompt to Production",
  subtitle: "Paytm AI Workshop",
  organized_by: "Department of IT & AI&DS, N.B.K.R. Institute of Science & Technology",
  associated_with: "ISTE (Indian Society for Technical Education)",
  date: "2026-09-30",
  date_formatted: "30 September 2026",
  time: "9:00 AM – 4:00 PM",
  venue: "Seminar Hall, New CSE Block",
  capacity: 100,
  registration_open: true,
  iste_fee: 50,
  non_iste_fee: 100,
  max_team_size: 4,
  description:
    "An intensive full-day hands-on workshop and build challenge bridging cutting-edge Generative AI and production engineering, featuring virtual masterclasses by tech leaders from Paytm and Microsoft.",
};
