import "server-only";
import { NextRequest } from "next/server";
import { db } from "./supabase";
import { ApiError } from "./errors";
import type { CoordinatorPermission, UserRole } from "@/lib/types";

export interface Caller {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileId: string | null;
  permissions: CoordinatorPermission[];
}

// Short-lived cache: each request would otherwise make 3 remote round-trips just to identify
// the caller. 15s keeps role/permission/disable changes effectively immediate.
const CACHE_MS = 15_000;
const cache = new Map<string, { at: number; caller: Caller | null }>();

/** Resolve the signed-in caller from the Bearer token, or null for anonymous requests. */
export async function getCaller(req: NextRequest): Promise<Caller | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const hit = cache.get(token);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.caller;
  const caller = await resolve(token);
  if (cache.size > 2000) cache.clear();
  cache.set(token, { at: Date.now(), caller });
  return caller;
}

/** Drop cached identities (after role, permission or status changes). */
export function clearCallerCache() {
  cache.clear();
}

async function resolve(token: string): Promise<Caller | null> {
  const { data, error } = await db().auth.getUser(token);
  if (error || !data.user) return null;
  const id = data.user.id;
  const [{ data: u }, { data: p }, { data: c }] = await Promise.all([
    db().from("app_users").select("*").eq("id", id).maybeSingle(),
    db().from("participant_profiles").select("id").eq("user_id", id).maybeSingle(),
    db().from("coordinators").select("permissions,status").eq("user_id", id).maybeSingle(),
  ]);
  if (!u || u.status !== "active") return null;
  if (u.role === "coordinator" && (!c || c.status !== "active")) return null;
  return {
    id: u.id, name: u.name, email: u.email, role: u.role,
    profileId: u.role === "user" ? p?.id ?? null : null,
    permissions: u.role === "coordinator" ? (c!.permissions as CoordinatorPermission[]) : [],
  };
}

export function requireRole(caller: Caller | null, ...roles: UserRole[]): Caller {
  if (!caller) throw new ApiError(401, "Please sign in.");
  if (!roles.includes(caller.role)) throw new ApiError(403, "You do not have access to this action.");
  return caller;
}

/** Admins always pass; coordinators need the specific permission. */
export function requirePermission(caller: Caller | null, perm: CoordinatorPermission): Caller {
  const c = requireRole(caller, "admin", "coordinator");
  if (c.role === "coordinator" && !c.permissions.includes(perm)) {
    throw new ApiError(403, `Your coordinator account lacks the ${perm} permission.`);
  }
  return c;
}
