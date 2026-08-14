import assert from "node:assert/strict";
import test from "node:test";
import { ProductionApiError } from "./ProductionApi";
import { adminErrorMessage, defaultReferralExpiry, formatConsoleDate, shortId, validateReferralInput } from "./employerConsole";

const now = new Date("2026-08-14T12:00:00.000Z");

test("validates and normalizes a referral request", () => {
  assert.deepEqual(validateReferralInput("2026-08-21", "25", now), { ok: true, expiresAt: "2026-08-21T00:00:00.000Z", maxUses: 25 });
});

test("rejects invalid limits and expiration dates", () => {
  assert.equal(validateReferralInput("2026-08-21", "0", now).ok, false);
  assert.equal(validateReferralInput("not-a-date", "10", now).ok, false);
  assert.equal(validateReferralInput("2026-08-14", "10", now).ok, false);
  assert.equal(validateReferralInput("2026-12-01", "10", now).ok, false);
});

test("provides stable display helpers", () => {
  assert.equal(shortId("123456789"), "12345678…");
  assert.equal(shortId("1234"), "1234");
  assert.equal(formatConsoleDate("bad-date"), "Unknown date");
  assert.equal(defaultReferralExpiry(now), "2026-08-21");
});

test("maps privileged authentication errors to actionable messages", () => {
  assert.match(adminErrorMessage(new ProductionApiError("MFA", "MFA_REQUIRED", 403)), /second factor/i);
  assert.match(adminErrorMessage(new ProductionApiError("Recent auth", "RECENT_AUTH_REQUIRED", 403)), /15 minutes/i);
});
