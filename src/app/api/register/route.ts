import { NextRequest } from "next/server";
import { registerParticipant } from "@/lib/server/registration";
import { handle } from "../_handle";

export async function POST(req: NextRequest) {
  return handle(async () => registerParticipant(await req.formData()));
}
