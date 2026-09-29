// Role-access smoke test: every API action × every role, direct-database bypass attempts, and page guards.
// Usage: ADMIN_PW=... node --env-file=.env.local scripts/smoke-roles.mjs [baseUrl]
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright-core";

const BASE = process.argv[2] || "http://localhost:3400";
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL, ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const svc = createClient(URL_, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const run = Date.now().toString(36);
let pass = 0, fail = 0;
const ok = (c, label, extra = "") => { if (c) { pass++; console.log(`  ✓ ${label}`); } else { fail++; console.log(`  ✗ ${label} ${extra}`); } };
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

async function login(email, password) {
  const c = createClient(URL_, ANON, { auth: { persistSession: false } });
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`login ${email}: ${error.message}`);
  return data.session.access_token;
}
async function act(tok, action, payload = {}) {
  const r = await fetch(`${BASE}/api/action`, { method: "POST", headers: { "Content-Type": "application/json", ...(tok ? { Authorization: `Bearer ${tok}` } : {}) }, body: JSON.stringify({ action, payload }) });
  return r.status;
}
async function state(tok) {
  const r = await fetch(`${BASE}/api/state`, { headers: tok ? { Authorization: `Bearer ${tok}` } : {} });
  return (await r.json()).data;
}
async function makeStaff(role, email, pw, perms) {
  const { data } = await svc.auth.admin.createUser({ email, password: pw, email_confirm: true });
  await svc.from("app_users").insert({ id: data.user.id, name: `${role} ${run}`, email, role });
  if (role === "coordinator") await svc.from("coordinators").insert({ user_id: data.user.id, permissions: perms });
  return data.user.id;
}

const temp = [];
// Registration needs a UPI ID configured; use a test one for the run and restore afterwards.
const SMOKE_UPI = (await svc.from("event_config").select("upi_id").single()).data?.upi_id ?? "";
if (!SMOKE_UPI) await svc.from("event_config").update({ upi_id: "smoke.test@okaxis" }).eq("id", 1);
try {
  // ---------- identities
  const pEmail = `roles+p${run}@example.com`, pPw = "Roles-pass-1!";
  const f = new FormData();
  Object.entries({ name: "Role Tester", email: pEmail, password: pPw, mobile: "9876543210", rollNumber: `RL${run}`.toUpperCase(),
    year: "2nd Year", branch: "IT", section: "B", isteMember: "false", hasLaptop: "true", utr: (Date.now() + "").slice(-12) }).forEach(([k, v]) => f.append(k, v));
  f.append("proof", new Blob([PNG], { type: "image/png" }), "p.png");
  const reg = await (await fetch(`${BASE}/api/register`, { method: "POST", body: f })).json();
  if (!reg.ok) throw new Error("setup registration failed: " + reg.error);
  const { data: pu } = await svc.from("app_users").select("id").eq("email", pEmail).single();
  temp.push(pu.id);
  const regRow = (await svc.from("registrations").select("id").eq("registration_number", reg.data.registrationNumber).single()).data;

  const fullEmail = `roles+cf${run}@example.com`, lowEmail = `roles+cl${run}@example.com`, offEmail = `roles+co${run}@example.com`, sPw = "Staff-pass-1!";
  temp.push(await makeStaff("coordinator", fullEmail, sPw, ["CHECKIN_VIEW", "CHECKIN_MANAGE", "PARTICIPANT_VIEW", "REGISTRATION_VERIFY", "SUPPORT_VIEW", "SUPPORT_REPLY"]));
  temp.push(await makeStaff("coordinator", lowEmail, sPw, ["CHECKIN_VIEW"]));
  const offId = await makeStaff("coordinator", offEmail, sPw, ["CHECKIN_MANAGE"]);
  temp.push(offId);

  const T = {
    anon: null,
    participant: await login(pEmail, pPw),
    coordFull: await login(fullEmail, sPw),
    coordCheckinViewOnly: await login(lowEmail, sPw),
    admin: await login("admin@nbkrist.org", process.env.ADMIN_PW),
  };
  const offTok = await login(offEmail, sPw);
  await svc.from("coordinators").update({ status: "disabled" }).eq("user_id", offId);

  // ---------- API matrix
  console.log("\n1. API permission matrix (allowed = not 401/403; denied = 401/403)");
  const ALL = ["participant", "coordFull", "coordCheckinViewOnly", "admin"];
  const matrix = {
    updateProfile: ["participant"], createTeam: ["participant"], joinTeam: ["participant"], leaveTeam: ["participant"], saveSubmission: ["participant"],
    createSupportTicket: ALL,
    replySupportTicket: ["participant", "coordFull", "admin"],
    setSupportStatus: ["coordFull", "admin"],
    reviewPayment: ["coordFull", "admin"], paymentProofUrl: ["coordFull", "admin"],
    checkIn: ["coordFull", "admin"],
    updateEventConfig: ["admin"], createCoordinator: ["admin"], setCoordinatorPermission: ["admin"], setCoordinatorStatus: ["admin"],
    saveResource: ["admin"], setResourcePublished: ["admin"], deleteResource: ["admin"],
    saveAnnouncement: ["admin"], setAnnouncementPublished: ["admin"], deleteAnnouncement: ["admin"],
    scoreSubmission: ["admin"], issueCertificates: ["admin"], revokeCertificate: ["admin"],
    verifyCertificate: ["anon", ...ALL],
  };
  // payloads chosen so an ALLOWED call fails validation (400/404/409) instead of changing data
  const payload = {
    updateEventConfig: { capacity: 0 }, replySupportTicket: { ticketId: "00000000-0000-0000-0000-000000000000", message: "x" },
    setSupportStatus: { ticketId: "00000000-0000-0000-0000-000000000000", status: "bogus" },
    reviewPayment: { registrationId: "00000000-0000-0000-0000-000000000000", decision: "approve" },
    paymentProofUrl: { registrationId: "00000000-0000-0000-0000-000000000000" }, checkIn: { query: "P2P-2026-NOPE00" },
    scoreSubmission: { submissionId: "00000000-0000-0000-0000-000000000000" }, revokeCertificate: {}, deleteResource: {}, deleteAnnouncement: {},
    setResourcePublished: {}, setAnnouncementPublished: {}, setCoordinatorPermission: { permission: "BOGUS" }, setCoordinatorStatus: {},
    createSupportTicket: {}, verifyCertificate: { certificateId: "CERT-NONE" },
  };
  for (const [action, allowed] of Object.entries(matrix)) {
    const results = [];
    for (const who of ["anon", ...ALL]) {
      const status = await act(T[who], action, payload[action] || {});
      const permitted = status !== 401 && status !== 403;
      const expected = allowed.includes(who);
      results.push(permitted === expected ? null : `${who}:${status}${expected ? " (should be allowed)" : " (should be DENIED)"}`);
    }
    const bad = results.filter(Boolean);
    ok(bad.length === 0, `${action.padEnd(24)} → ${allowed.join(", ")}`, bad.join("; "));
  }
  ok((await act(null, "doesNotExist")) === 400, "unknown actions are rejected");
  ok((await act(offTok, "checkIn", { query: "P2P-2026-NOPE00" })) === 401, "a DISABLED coordinator's session is refused");
  ok((await act("forged.jwt.token", "issueCertificates")) === 401, "a forged token is treated as anonymous");

  console.log("\n2. Data visibility (/api/state)");
  const sAnon = await state(null), sP = await state(T.participant), sLow = await state(T.coordCheckinViewOnly), sFull = await state(T.coordFull), sAdm = await state(T.admin);
  ok(sAnon.state.users.length === 0 && sAnon.state.registrations.length === 0 && sAnon.me === null, "anonymous: no people, no registrations");
  ok(sP.state.users.length === 1 && sP.state.registrations.length === 1 && sP.state.payments.every((x) => x.registration_id === regRow.id), "participant: only their own user/registration/payments");
  ok(sP.state.coordinators.length === 0 && sP.state.certificates.every(() => true), "participant: no staff list");
  ok(sLow.state.supportTickets.length === 0 && sLow.state.payments.length === 0 && sLow.state.certificates.length === 0, "check-in-view coordinator: no support, payments or certificates");
  ok(sFull.state.payments.length === 0 && sFull.state.certificates.length === 0, "coordinator: no payment ledger or certificate admin data");
  ok(sFull.state.coordinators.length === 1, "coordinator: sees only their own coordinator record");
  ok(sAdm.state.coordinators.length >= 3 && sAdm.state.registrations.some((r) => r.id === regRow.id), "admin: sees everything");
  ok(!JSON.stringify(sP).includes(fullEmail), "participant payload leaks no staff emails");

  console.log("\n3. Direct database / storage bypass with the public anon key");
  const pub = createClient(URL_, ANON, { auth: { persistSession: false } });
  for (const t of ["app_users", "registrations", "participant_profiles", "payments", "tickets", "certificates", "event_config", "coordinators"]) {
    const r = await pub.from(t).select("*").limit(1);
    ok(!!r.error || (r.data || []).length === 0, `anon REST cannot read ${t}`, JSON.stringify(r.data?.[0] || {}).slice(0, 80));
  }
  const ins = await pub.from("certificates").insert({ certificate_id: "CERT-HACK", registration_id: regRow.id, type: "winner" });
  ok(!!ins.error, "anon REST cannot insert a certificate");
  const upd = await pub.from("registrations").update({ payment_status: "success", registration_status: "confirmed" }).eq("id", regRow.id).select();
  ok(!!upd.error || (upd.data || []).length === 0, "anon REST cannot mark a payment as paid");
  const authed = createClient(URL_, ANON, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${T.participant}` } } });
  const upd2 = await authed.from("registrations").update({ payment_status: "success" }).eq("id", regRow.id).select();
  ok(!!upd2.error || (upd2.data || []).length === 0, "signed-in participant cannot approve own payment via REST");
  const files = await pub.storage.from("payment-proofs").list(pu.id);
  ok(!!files.error || (files.data || []).length === 0, "payment screenshots are not listable publicly");
  const still = (await svc.from("registrations").select("payment_status").eq("id", regRow.id).single()).data;
  ok(still.payment_status === "pending", "registration is still pending after all bypass attempts");

  console.log("\n4. Page guards (real browser, real login form)");
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const routes = ["/dashboard", "/dashboard/team", "/coordinator", "/coordinator/checkin", "/coordinator/verify", "/admin", "/admin/participants", "/admin/payments", "/admin/certificates"];
  const allowedPages = {
    anon: [],
    participant: ["/dashboard", "/dashboard/team"],
    coordFull: ["/coordinator", "/coordinator/checkin", "/coordinator/verify"],
    coordCheckinViewOnly: ["/coordinator", "/coordinator/checkin"],
    admin: routes.filter((r) => !r.startsWith("/dashboard")), // admins are not participants
  };
  const creds = { participant: [pEmail, pPw], coordFull: [fullEmail, sPw], coordCheckinViewOnly: [lowEmail, sPw], admin: ["admin@nbkrist.org", process.env.ADMIN_PW] };
  for (const who of Object.keys(allowedPages)) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    if (who !== "anon") {
      await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
      await page.fill('input[type="email"]', creds[who][0]);
      await page.fill('input[type="password"]', creds[who][1]);
      await page.click('button[type="submit"]');
      await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
    }
    const bad = [];
    for (const r of routes) {
      await page.goto(`${BASE}${r}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
      const url = new URL(page.url());
      const body = await page.locator("body").innerText().catch(() => "");
      const blocked = url.pathname.startsWith("/login") || /no access|not have access|don.t have access/i.test(body);
      const shouldAllow = allowedPages[who].includes(r) || (who === "coordCheckinViewOnly" && r === "/coordinator/checkin");
      if (shouldAllow === blocked) bad.push(`${r} → ${blocked ? "blocked" : "OPEN"}`);
    }
    ok(bad.length === 0, `${who.padEnd(22)} can open only: ${allowedPages[who].join(", ") || "(nothing)"}`, bad.join("; "));
    await ctx.close();
  }
  await browser.close();
} catch (e) {
  fail++;
  console.log("  ✗ crashed:", e.message);
} finally {
  if (!SMOKE_UPI) await svc.from("event_config").update({ upi_id: "" }).eq("id", 1);
  for (const id of temp) {
    const inner = (await svc.storage.from("payment-proofs").list(id)).data || [];
    if (inner.length) await svc.storage.from("payment-proofs").remove(inner.map((x) => `${id}/${x.name}`));
    await svc.auth.admin.deleteUser(id);
  }
  console.log(`\n${pass} passed, ${fail} failed (test accounts removed)`);
  process.exit(fail ? 1 : 0);
}
