import { NextRequest } from "next/server";
import { getCaller } from "@/lib/server/auth";
import { ACTIONS } from "@/lib/server/actions";
import { ApiError } from "@/lib/server/errors";
import { handle } from "../_handle";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const body = await req.json().catch(() => null);
    const fn = body && typeof body.action === "string" ? ACTIONS[body.action] : undefined;
    if (!fn) throw new ApiError(400, "Unknown action.");
    return fn(await getCaller(req), body.payload ?? {});
  });
}
