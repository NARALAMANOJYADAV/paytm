// LOCAL TESTING ONLY: creates one account per role and registration state so every screen can be
// checked by hand. Refuses to run against a non-local Supabase URL.
// Usage: node --env-file=.env.local scripts/seed-demo.mjs
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!/127\.0\.0\.1|localhost/.test(URL_)) {
  console.error(`Refusing to seed demo accounts into ${URL_} (not local).`);
  process.exit(1);
}
const db = createClient(URL_, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const PW = "Demo-pass-2026";
const code = (n) => randomBytes(n).toString("hex").slice(0, n).toUpperCase();

async function authUser(email) {
  const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
  const found = list.users.find((u) => u.email === email);
  if (found) { await db.auth.admin.updateUserById(found.id, { password: PW, email_confirm: true }); return found.id; }
  const { data, error } = await db.auth.admin.createUser({ email, password: PW, email_confirm: true });
  if (error) throw error;
  return data.user.id;
}
async function staff(email, name, role, permissions) {
  const id = await authUser(email);
  await db.from("app_users").upsert({ id, name, email, role, status: "active" });
  if (role === "coordinator") await db.from("coordinators").upsert({ user_id: id, employee_or_student_id: `DEMO-${code(3)}`, status: "active", permissions }, { onConflict: "user_id" });
}
async function student(email, name, roll, state) {
  const id = await authUser(email);
  await db.from("app_users").upsert({ id, name, email, phone: "9876543210", role: "user", status: "active" });
  const { data: prof } = await db.from("participant_profiles").upsert(
    { user_id: id, certificate_name: name, mobile: "9876543210", roll_number: roll, year: "3rd Year", branch: "AI & DS", section: "A", iste_member: state !== "pending", iste_sm_number: state !== "pending" ? "SM-DEMO-1" : null },
    { onConflict: "user_id" }).select().single();
  const { data: existing } = await db.from("registrations").select("id").eq("participant_id", prof.id).maybeSingle();
  if (existing) return;
  const fee = state === "pending" ? 100 : 50;
  const confirmed = state === "confirmed" || state === "checkedin";
  const { data: reg } = await db.from("registrations").insert({
    registration_number: `P2P-2026-${code(6)}`, participant_id: prof.id, registration_type: fee === 50 ? "iste" : "non-iste", fee,
    utr_number: String(Date.now()).slice(-9) + String(Math.floor(Math.random() * 900) + 100),
    payment_status: confirmed ? "success" : state === "rejected" ? "failed" : "pending",
    registration_status: confirmed ? "confirmed" : "reserved",
    rejection_reason: state === "rejected" ? "UTR not found in bank statement" : null,
  }).select().single();
  if (confirmed) {
    await db.from("payments").insert({ registration_id: reg.id, amount: fee, status: "success", utr_number: reg.utr_number });
    const { data: t } = await db.from("tickets").insert({ registration_id: reg.id, ticket_number: reg.registration_number, qr_token: randomBytes(18).toString("base64url") }).select().single();
    if (state === "checkedin") await db.from("attendance").insert({ registration_id: reg.id, ticket_id: t.id, checked_in_by_name: "Demo Gate" });
  }
}

await staff("admin@nbkrist.org", "Dr. A. Narayana Rao (demo)", "admin");
await staff("coordinator@nbkrist.org", "K. V. Chaitanya (demo)", "coordinator", ["CHECKIN_VIEW", "CHECKIN_MANAGE", "PARTICIPANT_VIEW", "REGISTRATION_VERIFY", "SUPPORT_VIEW", "SUPPORT_REPLY"]);
await staff("gate@nbkrist.org", "Gate Volunteer (demo)", "coordinator", ["CHECKIN_VIEW", "CHECKIN_MANAGE"]);
await student("pending@demo.nbkrist.org", "Priya Pending", "23KB1A0001", "pending");
await student("rejected@demo.nbkrist.org", "Ravi Rejected", "23KB1A0002", "rejected");
await student("confirmed@demo.nbkrist.org", "Chandu Confirmed", "23KB1A0003", "confirmed");
await student("checkedin@demo.nbkrist.org", "Kiran CheckedIn", "23KB1A0004", "checkedin");
console.log(`Demo accounts ready (password for all: ${PW})`);
