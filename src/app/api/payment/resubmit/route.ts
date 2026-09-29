import { NextRequest } from "next/server";
import { getCaller } from "@/lib/server/auth";
import { resubmitPayment } from "@/lib/server/registration";
import { handle } from "../../_handle";

export async function POST(req: NextRequest) {
  return handle(async () => resubmitPayment(await getCaller(req), await req.formData()));
}
