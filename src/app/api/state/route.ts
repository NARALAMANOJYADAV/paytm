import { NextRequest } from "next/server";
import { getCaller } from "@/lib/server/auth";
import { buildState } from "@/lib/server/state";
import { handle } from "../_handle";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const caller = await getCaller(req);
    const state = await buildState(caller);
    return { state, me: caller };
  });
}
