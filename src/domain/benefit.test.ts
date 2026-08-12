import assert from "node:assert/strict";
import test from "node:test";

import { calculatePilotEconomics } from "./benefit";

test("calculates transparent pilot economics from aggregate inputs", () => {
  const result = calculatePilotEconomics({
    eligibleEmployees: 180,
    enrolledEmployees: 72,
    activeCarpools: 24,
    protectedShifts: 118,
    successfulRecoveries: 17,
    recoveryAttempts: 20,
    estimatedAvoidedAbsences: 18,
    valuePerAvoidedAbsence: 300,
    monthlyPlatformFee: 1200,
    monthlySubsidyBudget: 1600
  });

  assert.equal(result.enrollmentRate, 0.4);
  assert.equal(result.recoveryRate, 0.85);
  assert.equal(result.estimatedEmployerValue, 5400);
  assert.equal(result.estimatedPilotCost, 2800);
  assert.equal(result.estimatedNetValue, 2600);
});
