import "server-only";
import { randomUUID } from "crypto";
import { db, PROOF_BUCKET } from "./supabase";
import { ApiError, dbError } from "./errors";
import { Caller, requireRole } from "./auth";
import { newRegistrationNumber } from "./ids";
import { getEventConfig } from "./state";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const BRANCHES = ["AI & DS", "IT", "CSE", "ECE", "EEE", "Mechanical", "Civil"];
const MIME_EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "application/pdf": "pdf" };

const field = (f: FormData, k: string, label: string, max = 200, required = true) => {
  const v = String(f.get(k) ?? "").trim();
  if (required && !v) throw new ApiError(400, `${label} is required.`);
  if (v.length > max) throw new ApiError(400, `${label} is too long.`);
  return v;
};

function readUtr(f: FormData) {
  const utr = field(f, "utr", "UTR number", 30).toUpperCase().replace(/\s/g, "");
  if (!/^\d{12}$/.test(utr)) throw new ApiError(400, "Enter the 12-digit UPI transaction reference (UTR).");
  return utr;
}

async function uploadProof(f: FormData, userId: string): Promise<string> {
  const file = f.get("proof");
  if (!(file instanceof File) || file.size === 0) throw new ApiError(400, "Upload a screenshot of your payment.");
  if (file.size > 5 * 1024 * 1024) throw new ApiError(400, "Payment screenshot must be under 5 MB.");
  const ext = MIME_EXT[file.type];
  if (!ext) throw new ApiError(400, "Payment screenshot must be PNG, JPG, WEBP or PDF.");
  const path = `${userId}/${randomUUID()}.${ext}`;
  const up = await db().storage.from(PROOF_BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (up.error) throw new ApiError(500, `Upload failed: ${up.error.message}`);
  return path;
}

async function assertUtrFree(utr: string) {
  const { data } = await db().from("registrations").select("id").ilike("utr_number", utr).maybeSingle();
  if (data) throw new ApiError(409, "This UTR has already been used for another registration.");
}

export async function registerParticipant(f: FormData) {
  const cfg = await getEventConfig();
  if (!cfg.registration_open) throw new ApiError(409, "Registration is closed.");
  if (!cfg.upi_id) throw new ApiError(409, "Fee payments are not set up yet. Please try again shortly.");

  const name = field(f, "name", "Full name", 80);
  const email = field(f, "email", "Email", 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, "Enter a valid email address.");
  const password = field(f, "password", "Password", 72);
  if (password.length < 8) throw new ApiError(400, "Password must be at least 8 characters.");
  const mobile = field(f, "mobile", "Mobile number", 20);
  if (mobile.replace(/\D/g, "").length < 10) throw new ApiError(400, "Enter a valid mobile number.");
  const roll = field(f, "rollNumber", "Roll number", 20).replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z0-9]{6,15}$/.test(roll)) throw new ApiError(400, "Roll number should be 6–15 letters and digits, e.g. 23KB1A3037.");
  const year = field(f, "year", "Year");
  const branch = field(f, "branch", "Branch");
  const section = field(f, "section", "Section", 10).replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z0-9]{1,3}$/.test(section)) throw new ApiError(400, "Section should be 1–3 letters or digits, e.g. A or B2.");
  if (!YEARS.includes(year) || !BRANCHES.includes(branch)) throw new ApiError(400, "Select a valid year and branch.");
  const isteMember = f.get("isteMember") === "true";
  const isteSm = field(f, "isteSmNumber", "ISTE membership number", 40, isteMember);
  const utr = readUtr(f);

  const { data: rollTaken } = await db().from("participant_profiles").select("id").ilike("roll_number", roll).maybeSingle();
  if (rollTaken) throw new ApiError(409, "A registration already exists for this roll number. Sign in instead.");
  await assertUtrFree(utr);

  const created = await db().auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
  if (created.error) {
    throw new ApiError(409, /already|registered|exists/i.test(created.error.message)
      ? "An account already exists with this email. Sign in instead." : created.error.message);
  }
  const userId = created.data.user.id;
  let proofPath: string | null = null;
  try {
    const u = await db().from("app_users").insert({ id: userId, name, email, phone: mobile, role: "user" });
    if (u.error) throw dbError(u.error);
    const p = await db().from("participant_profiles").insert({
      user_id: userId, certificate_name: name, mobile, roll_number: roll, year, branch, section,
      iste_member: isteMember, iste_sm_number: isteSm || null, has_laptop: f.get("hasLaptop") !== "false",
      linkedin_portfolio: field(f, "linkedinPortfolio", "LinkedIn", 200, false) || null,
    }).select("id").single();
    if (p.error) throw dbError(p.error);
    proofPath = await uploadProof(f, userId);
    const fee = isteMember ? cfg.iste_fee : cfg.non_iste_fee;
    const r = await db().from("registrations").insert({
      registration_number: newRegistrationNumber(), participant_id: p.data.id,
      registration_type: isteMember ? "iste" : "non-iste", fee, utr_number: utr, payment_proof_path: proofPath,
    }).select("registration_number").single();
    if (r.error) throw dbError(r.error);
    await db().from("payments").insert({ registration_id: (await db().from("registrations").select("id").eq("registration_number", r.data.registration_number).single()).data!.id, amount: fee, status: "pending", utr_number: utr });
    return { registrationNumber: r.data.registration_number, fee };
  } catch (err) {
    if (proofPath) await db().storage.from(PROOF_BUCKET).remove([proofPath]);
    await db().auth.admin.deleteUser(userId); // cascades app_users / profile
    throw err;
  }
}

/** After a rejected payment, the participant submits a new UTR + screenshot. */
export async function resubmitPayment(caller: Caller | null, f: FormData) {
  const me = requireRole(caller, "user");
  const { data: reg } = await db().from("registrations").select("*").eq("participant_id", me.profileId!).maybeSingle();
  if (!reg) throw new ApiError(404, "Registration not found.");
  if (reg.payment_status !== "failed") throw new ApiError(409, "Only a rejected payment can be resubmitted.");
  const cfg = await getEventConfig();
  const { count } = await db().from("registrations").select("id", { count: "exact", head: true })
    .neq("registration_status", "cancelled").neq("payment_status", "failed");
  if ((count ?? 0) >= cfg.capacity) throw new ApiError(409, "All seats are now taken.");
  const utr = readUtr(f);
  if (utr !== (reg.utr_number || "").toUpperCase()) await assertUtrFree(utr);
  const proofPath = await uploadProof(f, me.id);
  const upd = await db().from("registrations").update({
    utr_number: utr, payment_proof_path: proofPath, payment_submitted_at: new Date().toISOString(), payment_status: "pending", rejection_reason: null, verified_by: null, verified_at: null,
  }).eq("id", reg.id);
  if (upd.error) throw dbError(upd.error);
  await db().from("payments").insert({ registration_id: reg.id, amount: reg.fee, status: "pending", utr_number: utr });
}
