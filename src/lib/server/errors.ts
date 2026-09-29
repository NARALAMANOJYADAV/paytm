export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Turn a Postgres trigger/constraint error into a readable message. */
export function dbError(err: { message?: string; code?: string } | null): ApiError {
  const msg = err?.message || "Database error";
  const tagged = msg.match(/^(?:[A-Z_]+): (.*)$/);
  if (tagged) return new ApiError(409, tagged[1]);
  if (err?.code === "23505") {
    if (msg.includes("utr")) return new ApiError(409, "This UTR has already been used for another registration.");
    if (msg.includes("roll")) return new ApiError(409, "A registration already exists for this roll number.");
    if (msg.includes("participant_id")) return new ApiError(409, "You are already in a team.");
    if (msg.includes("email")) return new ApiError(409, "An account already exists with this email.");
    return new ApiError(409, "This record already exists.");
  }
  return new ApiError(500, msg);
}
