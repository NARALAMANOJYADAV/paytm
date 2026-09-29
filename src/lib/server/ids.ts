import { randomBytes } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function code(len: number): string {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export const newRegistrationNumber = () => `P2P-2026-${code(6)}`;
export const newInviteCode = () => `P2P-${code(5)}`;
export const newCertificateId = () => `CERT-P2P-2026-${code(8)}`;
export const newQrToken = () => randomBytes(18).toString("base64url");
