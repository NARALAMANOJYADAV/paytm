// CTA / link audit: every page × role, every link and button.
// Usage: ADMIN_PW=... COORD_PW=... node --env-file=.env.local scripts/smoke-ctas.mjs [baseUrl]
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright-core";

const BASE = process.argv[2] || "http://localhost:3400";
const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
let pass = 0, fail = 0, warn = 0;
const ok = (c, l, x = "") => { if (c) { pass++; console.log(`  ✓ ${l}`); } else { fail++; console.log(`  ✗ ${l} ${x}`); } };
const note = (l) => { warn++; console.log(`  ! ${l}`); };
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

const PAGES = {
  anon: ["/", "/rules", "/register", "/login", "/leaderboard", "/verify"],
  participant: ["/", "/dashboard", "/dashboard/profile", "/dashboard/schedule", "/dashboard/resources", "/dashboard/team", "/dashboard/submission", "/dashboard/support", "/dashboard/certificate"],
  coordinator: ["/coordinator", "/coordinator/checkin", "/coordinator/participants", "/coordinator/verify", "/coordinator/support"],
  admin: ["/admin", "/admin/participants", "/admin/payments", "/admin/attendance", "/admin/teams", "/admin/submissions", "/admin/certificates", "/admin/event", "/admin/coordinators", "/admin/resources", "/admin/announcements", "/admin/support", "/admin/settings"],
};

const run = Date.now().toString(36);
const pEmail = `cta+${run}@example.com`, pPw = "Cta-pass-123!";
let pid = null;
const statusCache = new Map();
async function status(path) {
  if (!statusCache.has(path)) statusCache.set(path, (await fetch(BASE + path, { redirect: "manual" })).status);
  return statusCache.get(path);
}

// Registration needs a UPI ID configured; use a test one for the run and restore afterwards.
const SMOKE_UPI = (await svc.from("event_config").select("upi_id").single()).data?.upi_id ?? "";
if (!SMOKE_UPI) await svc.from("event_config").update({ upi_id: "smoke.test@okaxis" }).eq("id", 1);
try {
  // An approved participant so the dashboard shows its full state (ticket, team CTAs, ...)
  const f = new FormData();
  Object.entries({ name: "CTA Tester", email: pEmail, password: pPw, mobile: "9876543210", rollNumber: `CTA${run}`.toUpperCase(), year: "1st Year",
    branch: "CSE", section: "C", isteMember: "false", hasLaptop: "true", utr: (Date.now() + "").slice(-12) }).forEach(([k, v]) => f.append(k, v));
  f.append("proof", new Blob([PNG], { type: "image/png" }), "p.png");
  const reg = await (await fetch(`${BASE}/api/register`, { method: "POST", body: f })).json();
  if (!reg.ok) throw new Error(reg.error);
  pid = (await svc.from("app_users").select("id").eq("email", pEmail).single()).data.id;
  const r = (await svc.from("registrations").select("*").eq("registration_number", reg.data.registrationNumber).single()).data;
  await svc.from("registrations").update({ payment_status: "success", registration_status: "confirmed", verified_at: new Date().toISOString() }).eq("id", r.id);
  await svc.from("tickets").insert({ registration_id: r.id, ticket_number: r.registration_number, qr_token: `cta${run}` });

  const creds = { participant: [pEmail, pPw], coordinator: ["coordinator@nbkrist.org", process.env.COORD_PW], admin: ["admin@nbkrist.org", process.env.ADMIN_PW] };
  const browser = await chromium.launch();
  for (const who of Object.keys(PAGES)) {
    console.log(`\n${who}`);
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (creds[who]) {
      await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
      await page.fill('input[type="email"]', creds[who][0]);
      await page.fill('input[type="password"]', creds[who][1]);
      await page.click('button[type="submit"]');
      await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
    }
    for (const path of PAGES[who]) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      const landed = new URL(page.url()).pathname;
      const info = await page.evaluate(() => {
        const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
        const links = [...document.querySelectorAll("a[href]")].filter(vis).map((a) => ({ href: a.getAttribute("href"), text: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 40) }));
        const buttons = [...document.querySelectorAll("button")].filter(vis).map((b) => ({ text: (b.innerText || b.getAttribute("aria-label") || "").trim().slice(0, 40), label: b.getAttribute("aria-label") }));
        const main = document.querySelector("main");
        const primaries = main ? [...main.querySelectorAll(".btn-primary")].filter(vis).map((b) => (b.innerText || "").trim().slice(0, 30)) : [];
        const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
        return { links, buttons, primaries, ids };
      });
      const problems = [];
      if (landed !== path.split("#")[0]) problems.push(`redirected to ${landed}`);
      for (const l of info.links) {
        const h = l.href;
        if (!h || h === "#" || h.startsWith("javascript:")) problems.push(`dead link "${l.text}" (${h})`);
        else if (/CERT-P2P-2026-0\d\d|P2P-2026-00042|example\.com/.test(h)) problems.push(`demo/fake link "${l.text}" → ${h}`);
        else if (h.startsWith("/")) {
          const [p, hash] = h.split("#");
          const st = await status(p || "/");
          if (st >= 400) problems.push(`"${l.text}" → ${h} returns ${st}`);
          if (hash && (p === "" || p === path) && !info.ids.includes(hash)) problems.push(`"${l.text}" → #${hash} has no target`);
          if (hash && p === "/" && path !== "/") {
            // verify anchor exists on the landing page
            const html = await (await fetch(BASE + "/")).text();
            if (!html.includes(`id="${hash}"`)) problems.push(`"${l.text}" → /#${hash} has no target on the home page`);
          }
        }
      }
      for (const b of info.buttons) if (!b.text && !b.label) problems.push("button with no text or aria-label");
      if (info.primaries.length > 3) note(`${path}: ${info.primaries.length} primary buttons (${info.primaries.join(" | ")}) – consider one main action`);
      ok(problems.length === 0, `${path.padEnd(26)} ${info.links.length} links, ${info.buttons.length} buttons`, "\n      - " + [...new Set(problems)].join("\n      - "));
    }
    ok(errors.length === 0, `${who}: no runtime errors`, [...new Set(errors)].join("; "));
    await ctx.close();
  }
  await browser.close();
} catch (e) {
  fail++;
  console.log("  ✗ crashed:", e.message);
} finally {
  if (!SMOKE_UPI) await svc.from("event_config").update({ upi_id: "" }).eq("id", 1);
  if (pid) {
    const inner = (await svc.storage.from("payment-proofs").list(pid)).data || [];
    if (inner.length) await svc.storage.from("payment-proofs").remove(inner.map((x) => `${pid}/${x.name}`));
    await svc.auth.admin.deleteUser(pid);
  }
  console.log(`\n${pass} passed, ${fail} failed, ${warn} notes (test account removed)`);
  process.exit(fail ? 1 : 0);
}
