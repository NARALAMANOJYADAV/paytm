// Full event day through the REAL UI (clicks, typing, file upload) with 4 people:
// admin, a student on a phone, a coordinator at the gate, and a copycat trying a duplicate roll number.
// Usage: ADMIN_PW=... COORD_PW=... node --env-file=.env.local scripts/e2e-ui.mjs [baseUrl]
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright-core";

const BASE = process.argv[2] || "http://localhost:3400";
const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const run = Date.now().toString(36);
let pass = 0, fail = 0;
const ok = (c, l, x = "") => { if (c) { pass++; console.log(`  ✓ ${l}`); } else { fail++; console.log(`  ✗ ${l} ${x}`); } };
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
const student = { name: "Ui Student", email: `ui+${run}@example.com`, pw: "Ui-student-123!", roll: `23kb1a${run.slice(-4)}`, section: "b2", utr: (Date.now() + "").slice(-12) };
const cfgBefore = (await svc.from("event_config").select("*").single()).data;
const shots = process.env.SHOTS_DIR;
// Wait for a condition instead of fixed sleeps (remote databases are slower than local).
async function until(fn, ms = 20000) {
  const t = Date.now();
  while (Date.now() - t < ms) { const v = await fn().catch(() => null); if (v) return v; await new Promise((r) => setTimeout(r, 400)); }
  return null;
}
const seen = (page, re) => page.getByText(re).first().waitFor({ state: "visible", timeout: 20000 }).then(() => true).catch(() => false);
const snap = async (p, n) => shots && p.screenshot({ path: `${shots}/e2e-${n}.png`, fullPage: false });

async function signIn(page, email, pw) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', pw);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
}

const browser = await chromium.launch();
try {
  // ---------- 1. Admin configures UPI + WhatsApp help through the Event page
  console.log("\n1. Admin sets up payments (UI)");
  const admin = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await signIn(admin, "admin@nbkrist.org", process.env.ADMIN_PW);
  await admin.goto(`${BASE}/admin/event`, { waitUntil: "networkidle" });
  await admin.fill("#ev-upi", "nbkrist.e2e@okaxis");
  await admin.fill("#ev-upi-name", "NBKRIST IT & AI&DS");
  await admin.fill("#ev-help-name", "Chaitanya (Coordinator)");
  await admin.fill("#ev-help-wa", "9876500000");
  await admin.getByRole("button", { name: /save/i }).last().click();
  await admin.waitForTimeout(1500);
  const cfg = (await svc.from("event_config").select("upi_id,support_whatsapp").single()).data;
  ok(cfg.upi_id === "nbkrist.e2e@okaxis" && cfg.support_whatsapp === "919876500000", "admin saved UPI ID and WhatsApp contact (number normalised to 91…)", JSON.stringify(cfg));

  // ---------- 2. Student registers on a phone
  console.log("\n2. Student registers on a phone (UI)");
  const phoneCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (Linux; Android 14) Mobile" });
  const phone = await phoneCtx.newPage();
  await phone.goto(`${BASE}/register`, { waitUntil: "networkidle" });
  await phone.fill("#reg-name", student.name);
  await phone.fill("#reg-email", student.email);
  await phone.fill("#reg-mobile", "9876543210");
  await phone.fill("#reg-roll", student.roll);
  ok((await phone.inputValue("#reg-roll")) === student.roll.toUpperCase(), "roll number is upper-cased as typed");
  await phone.fill("#reg-section", student.section);
  ok((await phone.inputValue("#reg-section")) === "B2", "section is a text field and upper-cases (b2 → B2)");
  await phone.getByRole("radio", { name: /No, not a member/i }).click();
  await phone.locator("form button[type=submit]").first().click();
  await phone.waitForTimeout(1000);
  const payLink = phone.getByRole("link", { name: /Pay ₹\d+ with a UPI app/ });
  const href = await payLink.getAttribute("href");
  ok(href?.startsWith("upi://pay?pa=nbkrist.e2e%40okaxis") && href.includes("am=100"), "phone gets a direct UPI app link with the admin's UPI ID and ₹100");
  const wa = await phone.getByRole("link", { name: /WhatsApp/ }).getAttribute("href");
  ok(wa?.startsWith("https://wa.me/919876500000?text="), "payment step shows the WhatsApp help link to the admin's number");
  await snap(phone, "phone-payment");
  await phone.fill("#reg-utr", student.utr);
  await phone.setInputFiles("#reg-proof", { name: "payment.png", mimeType: "image/png", buffer: PNG });
  await phone.getByRole("button", { name: /I have paid/i }).click();
  await phone.waitForTimeout(800);
  await phone.fill("#acct-password", student.pw);
  await phone.locator('input[type="password"]').nth(1).fill(student.pw);
  await phone.getByRole("checkbox").check();
  await phone.locator("form button[type=submit]").last().click();
  await phone.waitForSelector("text=/under verification|Registration Submitted/i", { timeout: 20000 });
  ok(true, "registration submitted through the form (with screenshot upload)");
  await phone.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  ok(await seen(phone, /Payment under verification/i), "dashboard shows 'Payment under verification'");
  ok(await phone.getByRole("link", { name: /WhatsApp/ }).first().isVisible(), "dashboard offers the WhatsApp payment help");
  const reg = (await svc.from("registrations").select("*, participant_profiles!inner(roll_number, section)").eq("participant_profiles.roll_number", student.roll.toUpperCase()).single()).data;
  ok(reg && reg.participant_profiles.section === "B2", "stored roll and section are upper-case in the database");

  // ---------- 3. Copycat uses the same roll in lower case
  console.log("\n3. Duplicate roll number in different case (UI)");
  const copy = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await copy.goto(`${BASE}/register`, { waitUntil: "networkidle" });
  await copy.fill("#reg-name", "Copy Cat"); await copy.fill("#reg-email", `copy+${run}@example.com`); await copy.fill("#reg-mobile", "9876543211");
  await copy.fill("#reg-roll", student.roll.toLowerCase()); await copy.fill("#reg-section", "A");
  await copy.getByRole("radio", { name: /No, not a member/i }).click();
  await copy.locator("form button[type=submit]").first().click(); await copy.waitForTimeout(600);
  await copy.fill("#reg-utr", (Date.now() + 7 + "").slice(-12));
  await copy.setInputFiles("#reg-proof", { name: "p.png", mimeType: "image/png", buffer: PNG });
  await copy.getByRole("button", { name: /I have paid/i }).click(); await copy.waitForTimeout(600);
  await copy.fill("#acct-password", "Copy-cat-123!"); await copy.locator('input[type="password"]').nth(1).fill("Copy-cat-123!");
  await copy.getByRole("checkbox").check(); await copy.locator("form button[type=submit]").last().click();
  await copy.waitForTimeout(2500);
  ok(await copy.getByText(/already exists for this roll number/i).first().isVisible().catch(() => false), "same roll number in lower case is refused with a clear message");

  // ---------- 4. Admin reviews screenshot and approves in the UI
  console.log("\n4. Admin verifies the payment (UI)");
  await admin.goto(`${BASE}/admin/payments`, { waitUntil: "networkidle" });
  await admin.waitForTimeout(1000);
  await admin.getByText(reg.registration_number).first().click();
  await admin.waitForTimeout(500);
  const [popupOrNone] = await Promise.all([
    admin.waitForEvent("popup", { timeout: 3000 }).catch(() => null),
    admin.getByRole("button", { name: /View payment screenshot/i }).first().click(),
  ]);
  await admin.waitForTimeout(1500);
  const imgOk = popupOrNone
    ? (await popupOrNone.evaluate(() => document.images[0]?.naturalWidth || (document.contentType?.startsWith("image") ? 1 : 0)))
    : await admin.evaluate(() => [...document.images].some((i) => i.src.includes("payment-proofs") && i.naturalWidth > 0));
  ok(!!imgOk, "payment screenshot opens and loads");
  await snap(admin, "admin-screenshot");
  await admin.keyboard.press("Escape").catch(() => {});
  await admin.getByRole("button", { name: /Approve payment/i }).first().click();
  const after = await until(async () => (await svc.from("registrations").select("payment_status,registration_status").eq("id", reg.id).eq("payment_status", "success").maybeSingle()).data) || {};
  ok(after.payment_status === "success" && after.registration_status === "confirmed", "Approve button confirms the registration");

  // ---------- 5. Student sees the ticket
  await phone.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  ok(await phone.locator('img[alt*="QR" i]').first().waitFor({ state: "visible", timeout: 20000 }).then(() => true).catch(() => false), "student's dashboard now shows the QR ticket");

  // ---------- 6. Coordinator checks the student in at the gate
  console.log("\n5. Gate check-in (UI)");
  const gate = await (await browser.newContext({ viewport: { width: 1024, height: 800 } })).newPage();
  await signIn(gate, "coordinator@nbkrist.org", process.env.COORD_PW);
  await gate.goto(`${BASE}/coordinator/checkin`, { waitUntil: "networkidle" });
  await gate.fill('input[placeholder^="e.g. P2P-2026"]', reg.registration_number);
  await gate.getByRole("button", { name: /^Verify$/ }).click();
  ok(await seen(gate, /CHECKED IN/i), "coordinator's manual entry shows CHECKED IN");
  await gate.getByRole("button", { name: /^Verify$/ }).waitFor({ state: "visible" });
  await gate.fill('input[placeholder^="e.g. P2P-2026"]', reg.registration_number);
  await gate.getByRole("button", { name: /^Verify$/ }).click();
  ok(await seen(gate, /ALREADY CHECKED IN/i), "second entry shows ALREADY CHECKED IN");

  // ---------- 7. Team + submission
  console.log("\n6. Team and submission (UI)");
  await phone.goto(`${BASE}/dashboard/team`, { waitUntil: "networkidle" }); await phone.waitForTimeout(800);
  await phone.fill('input[placeholder="e.g. PromptCrafters"]', `UI Team ${run}`);
  await phone.getByRole("button", { name: /Create Team/i }).click();
  const teamRow = await until(async () => (await svc.from("teams").select("id,invite_code").eq("name", `UI Team ${run}`).maybeSingle()).data);
  await snap(phone, "team");
  if (!teamRow) console.log("    team page says:", (await phone.locator("main").innerText()).slice(0, 400).replace(/\n/g, " / "));
  ok(!!teamRow && (await seen(phone, new RegExp(teamRow.invite_code))), "team created and its invite code shown");
  await phone.goto(`${BASE}/dashboard/submission`, { waitUntil: "networkidle" }); await phone.waitForTimeout(800);
  if (!(await phone.locator("#project-name").waitFor({ timeout: 20000 }).then(() => true).catch(() => false))) {
    await snap(phone, "submission-stuck");
    throw new Error("submission form not shown: " + (await phone.locator("main").innerText()).slice(0, 300).replace(/\n/g, " / "));
  }
  await phone.fill("#project-name", "Gate Queue Copilot");
  await phone.fill("#problem", "Check-in queues are slow.");
  await phone.fill("#description", "QR scanning with AI triage for the gate.");
  await phone.fill("#tech", "Next.js, Supabase");
  await phone.getByLabel(/GitHub/i).first().fill("https://github.com/example/gate-copilot");
  await phone.getByRole("button", { name: /Submit for Evaluation/i }).click();
  const sub = await until(async () => (await svc.from("submissions").select("*").eq("project_name", "Gate Queue Copilot").eq("status", "submitted").maybeSingle()).data);
  ok(sub?.status === "submitted", "final submission saved from the form");

  // ---------- 8. Judging + certificates
  console.log("\n7. Judging and certificates (UI)");
  await admin.goto(`${BASE}/admin/submissions`, { waitUntil: "networkidle" }); await admin.waitForTimeout(1000);
  await admin.getByText("Gate Queue Copilot").first().click(); await admin.waitForTimeout(500);
  for (const [id, v] of [["#score-innovation", 22], ["#score-ai", 21], ["#score-tech", 20], ["#score-presentation", 23]]) await admin.fill(id, String(v)).catch(() => {});
  await admin.getByRole("button", { name: /save|score|evaluat/i }).last().click();
  const scored = await until(async () => (await svc.from("submissions").select("status").eq("id", sub.id).eq("status", "evaluated").maybeSingle()).data);
  ok(!!scored, "judge scored the submission in the UI");
  await svc.from("event_config").update({ event_end_at: new Date(Date.now() - 60000).toISOString() }).eq("id", 1);
  await admin.goto(`${BASE}/admin/certificates`, { waitUntil: "networkidle" }); await admin.waitForTimeout(1200);
  await admin.getByRole("button", { name: /Issue certificates/i }).click();
  const certs = (await until(async () => { const d = (await svc.from("certificates").select("*").eq("registration_id", reg.id)).data; return d?.length ? d : null; })) || [];
  await snap(admin, "admin-certs");
  ok(certs.some((c) => c.type === "participation"), "Issue certificates gives the attended student a certificate");
  await phone.goto(`${BASE}/dashboard/certificate`, { waitUntil: "networkidle" }); await phone.waitForTimeout(1500);
  ok(await seen(phone, /Certificate of/i), "student sees their certificate");
  const cid = certs.find((c) => c.type === "participation").certificate_id;
  const pub = await (await browser.newContext()).newPage();
  await pub.goto(`${BASE}/verify`, { waitUntil: "networkidle" });
  await pub.fill("#cert-id", cid.toLowerCase());
  await pub.getByRole("button", { name: /Verify/ }).click();
  ok(await seen(pub, new RegExp(student.name)), "anyone can verify the certificate from /verify (lower-case ID works)");
} catch (e) {
  fail++;
  console.log("  ✗ crashed:", e.message.split("\n").slice(0, 3).join(" | "));
} finally {
  await browser.close();
  await svc.from("event_config").update({ upi_id: cfgBefore.upi_id, upi_payee_name: cfgBefore.upi_payee_name, support_contact_name: cfgBefore.support_contact_name, support_whatsapp: cfgBefore.support_whatsapp, event_end_at: cfgBefore.event_end_at }).eq("id", 1);
  const { data: list } = await svc.auth.admin.listUsers({ perPage: 1000 });
  for (const u of list.users.filter((u) => u.email?.includes(run))) {
    const { data: prof } = await svc.from("participant_profiles").select("id").eq("user_id", u.id).maybeSingle();
    if (prof) await svc.from("teams").delete().eq("leader_id", prof.id);
    const inner = (await svc.storage.from("payment-proofs").list(u.id)).data || [];
    if (inner.length) await svc.storage.from("payment-proofs").remove(inner.map((x) => `${u.id}/${x.name}`));
    await svc.auth.admin.deleteUser(u.id);
  }
  console.log(`\n${pass} passed, ${fail} failed (test users removed, settings restored)`);
  process.exit(fail ? 1 : 0);
}
