"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Save, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { updateProfile } from "@/lib/store";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-x-4 gap-y-0.5">
      <dt className="text-sm text-ink-3">{label}</dt>
      <dd className="text-sm text-ink break-words">{children}</dd>
    </div>
  );
}

type Notice = { text: string; type: "success" | "error" } | null;

function NoticeLine({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return notice.type === "success" ? (
    <p role="status" className="text-sm text-ok flex items-center gap-1.5">
      <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      {notice.text}
    </p>
  ) : (
    <p role="alert" className="text-sm text-alert flex items-center gap-1.5">
      <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      {notice.text}
    </p>
  );
}

export default function ProfilePage() {
  const { currentProfile, currentUser, currentRegistration } = useAuth();

  // Editable fields
  const [name, setName] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [mobile, setMobile] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [hasLaptop, setHasLaptop] = useState(false);
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState<Notice>(null);

  // Password change
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);

  // Fill the form once the profile is available (not on every refresh, so edits are not overwritten)
  if (currentProfile && hydratedFor !== currentProfile.id) {
    setName(currentUser?.name || currentProfile.certificate_name);
    setCertificateName(currentProfile.certificate_name);
    setMobile(currentProfile.mobile);
    setLinkedin(currentProfile.linkedin_portfolio || "");
    setHasLaptop(currentProfile.has_laptop);
    setHydratedFor(currentProfile.id);
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileNotice(null);
    if (!name.trim() || !mobile.trim()) {
      setProfileNotice({ text: "Name and mobile number are required.", type: "error" });
      return;
    }
    if (mobile.replace(/\D/g, "").length < 10) {
      setProfileNotice({ text: "Enter a valid mobile number.", type: "error" });
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        certificateName: certificateName.trim() || name.trim(),
        mobile: mobile.trim(),
        linkedinPortfolio: linkedin.trim() || undefined,
        hasLaptop,
      });
      setProfileNotice({ text: "Profile updated.", type: "success" });
    } catch (err) {
      setProfileNotice({ text: err instanceof Error ? err.message : "Could not update your profile.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);
    if (password.length < 8) {
      setPasswordNotice({ text: "Password must be at least 8 characters.", type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setPasswordNotice({ text: "The two passwords do not match.", type: "error" });
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabaseBrowser().auth.updateUser({ password });
      if (error) throw new Error(error.message);
      setPassword("");
      setConfirmPassword("");
      setPasswordNotice({ text: "Password changed. Use the new password next time you sign in.", type: "success" });
    } catch (err) {
      setPasswordNotice({ text: err instanceof Error ? err.message : "Could not change your password.", type: "error" });
    } finally {
      setChangingPassword(false);
    }
  };

  if (!currentProfile) {
    return (
      <div className="max-w-2xl mx-auto frame bg-paper p-8 text-center space-y-3">
        <h1 className="page-title text-ink">No participant profile</h1>
        <p className="text-sm text-ink-2">
          We could not find a participant profile for this account. Contact the{" "}
          <Link href="/dashboard/support" className="font-bold text-ink underline decoration-2 underline-offset-4">support desk</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="frame bg-paper px-5 py-5 sm:px-6">
        <h1 className="page-title text-ink">Participant Profile</h1>
        <p className="text-sm text-ink-2 mt-2">
          Official enrollment records for Prompt to Production – Paytm AI Workshop.
        </p>
      </header>

      <div className="planes grid-cols-1 md:grid-cols-2">
        {/* Identity plane */}
        <div className="plane-navy col-span-full px-5 py-5 sm:px-6 flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 border border-white flex items-center justify-center font-semibold wide text-2xl flex-shrink-0" aria-hidden="true">
            {(currentProfile.certificate_name || currentUser?.name || "?")[0]}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold wide break-words">
              {currentProfile.certificate_name || currentUser?.name}
            </h2>
            <p className="text-sm text-[rgba(255,255,255,0.7)] mt-1">
              Roll No: <span className="font-mono text-white">{currentProfile.roll_number}</span>
              {currentRegistration && (
                <> · Reg ID: <span className="font-mono text-white">{currentRegistration.registration_number}</span></>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="tag">{currentProfile.branch}</span>
              <span className="tag">{currentProfile.year} · Section {currentProfile.section}</span>
            </div>
          </div>
        </div>

        <section className="px-5 py-4 sm:px-6" aria-labelledby="academic">
          <h3 id="academic" className="font-semibold text-ink pb-1">Identity &amp; Academic Details</h3>
          <dl className="divide-y divide-rule">
            <Row label="Roll Number">
              <span className="font-mono font-bold">{currentProfile.roll_number}</span>
            </Row>
            <Row label="Email Address">
              <span className="font-mono">{currentUser?.email}</span>
            </Row>
            <Row label="Branch">{currentProfile.branch}</Row>
            <Row label="Year & Section">
              {currentProfile.year} · Section {currentProfile.section}
            </Row>
          </dl>
          <p className="field-hint mt-2">
            These identify you at the gate and on your certificate. To correct them, contact the{" "}
            <Link href="/dashboard/support" className="font-bold text-ink underline decoration-2 underline-offset-4">support desk</Link>.
          </p>
        </section>

        <section className="px-5 py-4 sm:px-6" aria-labelledby="membership">
          <h3 id="membership" className="font-semibold text-ink pb-1">Membership &amp; Registration</h3>
          <dl className="divide-y divide-rule">
            <Row label="ISTE Status">
              <span className={`tag ${currentProfile.iste_member ? "tag-ok" : ""}`}>
                {currentProfile.iste_member
                  ? `Member${currentProfile.iste_sm_number ? ` (${currentProfile.iste_sm_number})` : ""}`
                  : "Non-ISTE"}
              </span>
            </Row>
            {currentRegistration && (
              <>
                <Row label="Registration Type">
                  {currentRegistration.registration_type === "iste" ? "ISTE rate" : "Standard rate"} · <span className="num">₹{currentRegistration.fee}</span>
                </Row>
                <Row label="Payment">
                  <span className="capitalize">{currentRegistration.payment_status === "success" ? "Verified" : currentRegistration.payment_status}</span>
                </Row>
              </>
            )}
          </dl>
        </section>

        {/* Editable details */}
        <form onSubmit={handleSaveProfile} className="col-span-full px-5 py-5 sm:px-6 space-y-4" aria-labelledby="edit-details">
          <h3 id="edit-details" className="font-semibold text-ink">Contact &amp; Certificate Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="field-label">Full Name *</label>
              <input id="name" type="text" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="certificate-name" className="field-label">Name for Certificate *</label>
              <input
                id="certificate-name"
                type="text"
                maxLength={80}
                value={certificateName}
                onChange={(e) => setCertificateName(e.target.value)}
                className="field font-bold"
              />
              <p className="field-hint">Printed exactly as typed on your certificate.</p>
            </div>
            <div>
              <label htmlFor="mobile" className="field-label">Mobile Number *</label>
              <input
                id="mobile"
                type="tel"
                required
                maxLength={20}
                autoComplete="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="field font-mono"
              />
            </div>
            <div>
              <label htmlFor="linkedin" className="field-label">LinkedIn Profile / Portfolio Link</label>
              <input
                id="linkedin"
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="field font-mono"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink min-h-11">
            <input type="checkbox" checked={hasLaptop} onChange={(e) => setHasLaptop(e.target.checked)} className="w-4 h-4" />
            I am bringing a laptop to the workshop
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button type="submit" className="btn btn-primary self-start" disabled={saving} aria-busy={saving}>
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>{saving ? "Saving…" : "Save Changes"}</span>
            </button>
            <NoticeLine notice={profileNotice} />
          </div>
        </form>

        {/* Password */}
        <form onSubmit={handleChangePassword} className="col-span-full px-5 py-5 sm:px-6 space-y-4" aria-labelledby="password-title">
          <h3 id="password-title" className="font-semibold text-ink">Change Password</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-password" className="field-label">New Password *</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
              />
              <p className="field-hint">At least 8 characters.</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="field-label">Confirm New Password *</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="field"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button type="submit" className="btn self-start" disabled={changingPassword} aria-busy={changingPassword}>
              <KeyRound className="w-4 h-4" aria-hidden="true" />
              <span>{changingPassword ? "Updating…" : "Update Password"}</span>
            </button>
            <NoticeLine notice={passwordNotice} />
          </div>
        </form>
      </div>
    </div>
  );
}
