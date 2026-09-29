import { NextResponse } from "next/server";
import { ApiError } from "@/lib/server/errors";

export async function handle(fn: () => Promise<unknown>) {
  try {
    const data = await fn();
    return NextResponse.json({ ok: true, data: data ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
