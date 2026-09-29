// Create (or reset) a staff account. Usage:
//   node --env-file=.env.local scripts/create-staff.mjs admin|coordinator <email> <password> "<Full Name>" [employeeId]
import { createClient } from "@supabase/supabase-js";

const [role, email, password, name, employeeId = ""] = process.argv.slice(2);
if (!["admin", "coordinator"].includes(role) || !email || !password || !name) {
  console.error('Usage: node --env-file=.env.local scripts/create-staff.mjs admin|coordinator <email> <password> "<Full Name>" [employeeId]');
  process.exit(1);
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
let user = list.users.find((u) => u.email === email.toLowerCase());
if (user) {
  const r = await db.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (r.error) throw r.error;
} else {
  const r = await db.auth.admin.createUser({ email: email.toLowerCase(), password, email_confirm: true });
  if (r.error) throw r.error;
  user = r.data.user;
}
const up = await db.from("app_users").upsert({ id: user.id, name, email: email.toLowerCase(), role, status: "active" });
if (up.error) throw up.error;
if (role === "coordinator") {
  const c = await db.from("coordinators").upsert(
    { user_id: user.id, employee_or_student_id: employeeId, status: "active",
      permissions: ["CHECKIN_VIEW", "CHECKIN_MANAGE", "PARTICIPANT_VIEW", "REGISTRATION_VERIFY", "SUPPORT_VIEW", "SUPPORT_REPLY"] },
    { onConflict: "user_id" });
  if (c.error) throw c.error;
}
console.log(`${role} ready: ${email}`);
