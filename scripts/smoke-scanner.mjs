// Camera QR scanning at the gate: feeds a real ticket QR through a fake camera and checks the
// student is checked in, with the native BarcodeDetector AND with the jsQR fallback (iPhone-like).
// Usage: COORD_PW=... SHOTS_DIR=/abs/dir node --env-file=.env.local scripts/smoke-scanner.mjs   (needs ffmpeg)
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright-core";
import QRCode from "qrcode";
import { execFileSync } from "child_process";
import { writeFileSync } from "fs";
const BASE = "http://localhost:3400", run = Date.now().toString(36), dir = process.env.SHOTS_DIR;
const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
const cfg0 = (await svc.from("event_config").select("upi_id").single()).data;
await svc.from("event_config").update({ upi_id: "scan@okaxis" }).eq("id", 1);
let uid;
try {
  const f = new FormData();
  Object.entries({ name: "Scan Probe", email: `scan+${run}@example.com`, password: "Scan-pass-123!", mobile: "9876543210", rollNumber: `SCN${run}`.toUpperCase(), year: "1st Year", branch: "IT", section: "A", isteMember: "false", utr: (Date.now() + "").slice(-12) }).forEach(([k, v]) => f.append(k, v));
  f.append("proof", new Blob([PNG], { type: "image/png" }), "p.png");
  const reg = await (await fetch(`${BASE}/api/register`, { method: "POST", body: f })).json();
  uid = (await svc.from("app_users").select("id").eq("email", `scan+${run}@example.com`).single()).data.id;
  const r = (await svc.from("registrations").select("*").eq("registration_number", reg.data.registrationNumber).single()).data;
  await svc.from("registrations").update({ payment_status: "success", registration_status: "confirmed" }).eq("id", r.id);
  const token = `probe${run}`;
  await svc.from("tickets").insert({ registration_id: r.id, ticket_number: r.registration_number, qr_token: token });
  // The ticket QR exactly as the app encodes it, rendered as a fake camera feed.
  const payload = `ticket_id=${r.registration_number}&k=${token}`;
  writeFileSync(`${dir}/ticket-qr.png`, await QRCode.toBuffer(payload, { width: 480, margin: 4 }));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-loop", "1", "-i", `${dir}/ticket-qr.png`, "-vf", "pad=640:480:(ow-iw)/2:(oh-ih)/2:white", "-t", "4", "-r", "10", "-pix_fmt", "yuv420p", `${dir}/ticket.y4m`]);
  const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-video-capture=${dir}/ticket.y4m`], channel: "chromium" });
  for (const mode of ["jsQR fallback (iPhone-like, no BarcodeDetector)", "native BarcodeDetector"]) {
    if (mode.startsWith("native")) await svc.from("attendance").delete().eq("registration_id", r.id);
    const ctx = await browser.newContext({ permissions: ["camera"] });
    if (mode.startsWith("jsQR")) await ctx.addInitScript(() => { delete window.BarcodeDetector; });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await p.fill('input[type="email"]', "coordinator@nbkrist.org"); await p.fill('input[type="password"]', process.env.COORD_PW);
    await p.click('button[type="submit"]'); await p.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30000 });
    await p.goto(`${BASE}/coordinator/checkin`, { waitUntil: "networkidle" });
    await p.getByRole("button", { name: /Start Camera/i }).click();
    await p.waitForTimeout(3000);
    const frame = await p.evaluate(() => { const v = document.querySelector("video"); if (!v) return "no video"; const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext("2d").drawImage(v, 0, 0); return `${v.videoWidth}x${v.videoHeight} ready=${v.readyState} ` + c.toDataURL("image/png").slice(0, 40); });


    const okSeen = await p.getByText(/CHECKED IN/).first().waitFor({ timeout: 20000 }).then(() => true).catch(() => false);
    const att = (await svc.from("attendance").select("id").eq("registration_id", r.id)).data;
    console.log(`${okSeen && att.length === 1 ? "✓" : "✗"} ${mode}: camera scan → ${okSeen ? "CHECKED IN" : "no result"}, attendance rows ${att.length}`);
    await p.screenshot({ path: `${dir}/scan-${mode.startsWith("jsQR") ? "jsqr" : "native"}.png` });
    await ctx.close();
  }
  await browser.close();
} finally {
  if (uid) {
    const inner = (await svc.storage.from("payment-proofs").list(uid)).data || [];
    if (inner.length) await svc.storage.from("payment-proofs").remove(inner.map((x) => `${uid}/${x.name}`));
    await svc.auth.admin.deleteUser(uid);
  }
  await svc.from("event_config").update({ upi_id: cfg0.upi_id }).eq("id", 1);
}
