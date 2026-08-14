import { ProductionApiError } from "./ProductionApi";

const DAY_MS = 86_400_000;

export type ReferralInputResult =
  | { ok: true; expiresAt: string; maxUses: number }
  | { ok: false; message: string };

export function validateReferralInput(expiresAt: string, maxUses: string, now = new Date()): ReferralInputResult {
  const uses = Number(maxUses);
  const expiry = new Date(expiresAt);
  if (!Number.isInteger(uses) || uses < 1 || uses > 500 || !Number.isFinite(expiry.getTime())) {
    return { ok: false, message: "Enter a valid expiration date and a use limit from 1 to 500." };
  }
  if (expiry.getTime() <= now.getTime() || expiry.getTime() > now.getTime() + 90 * DAY_MS) {
    return { ok: false, message: "Choose an expiration date in the next 90 days." };
  }
  return { ok: true, expiresAt: expiry.toISOString(), maxUses: uses };
}

export function shortId(value: string) { return value.length <= 8 ? value : `${value.slice(0, 8)}…`; }
export function formatConsoleDate(value: string) { const date = new Date(value); return Number.isFinite(date.getTime()) ? date.toLocaleDateString() : "Unknown date"; }
export function defaultReferralExpiry(now = new Date()) { return new Date(now.getTime() + 7 * DAY_MS).toISOString().slice(0, 10); }

export function adminErrorMessage(reason: unknown) {
  if (reason instanceof ProductionApiError && reason.code === "MFA_REQUIRED") return "A verified second factor is required before this administrative action.";
  if (reason instanceof ProductionApiError && reason.code === "RECENT_AUTH_REQUIRED") return "Sign out and sign in again, then retry this administrative action within 15 minutes.";
  return reason instanceof Error ? reason.message : "The employer request could not be completed.";
}
