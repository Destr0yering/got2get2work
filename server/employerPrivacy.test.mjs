import assert from "node:assert/strict";
import test from "node:test";

import { PrivacyInputError, sanitizeEmployerMetrics } from "./privacy.mjs";

const metrics = {
  eligibleEmployees: 180,
  enrolledEmployees: 72,
  activeCarpools: 24,
  protectedShifts: 118,
  successfulRecoveries: 17,
  recoveryAttempts: 20,
  estimatedAvoidedAbsences: 18,
  valuePerAvoidedAbsence: 300,
  monthlyPlatformFee: 1200,
  monthlySubsidyBudget: 1600,
};

test("accepts only a sufficiently aggregated employer projection", () => {
  assert.deepEqual(sanitizeEmployerMetrics(metrics), {
    schemaVersion: 1,
    reportingWindow: "illustrative_month",
    metrics,
  });
});

test("rejects identity-like or unapproved employer fields", () => {
  assert.throws(
    () => sanitizeEmployerMetrics({ ...metrics, employeeName: "Maya" }),
    (error) => error instanceof PrivacyInputError && error.code === "DISALLOWED_EMPLOYER_FIELD"
  );
});

test("rejects cohorts smaller than the privacy threshold", () => {
  assert.throws(
    () => sanitizeEmployerMetrics({ ...metrics, eligibleEmployees: 8, enrolledEmployees: 8, activeCarpools: 4 }),
    (error) => error instanceof PrivacyInputError && error.code === "INVALID_EMPLOYER_METRIC"
  );
});
