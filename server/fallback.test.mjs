import assert from "node:assert/strict";
import test from "node:test";
import { fallbackExplanation, fallbackSchedule } from "./fallback.mjs";

test("fallback parser expands a weekday range", () => {
  const result = fallbackSchedule("Northstar Medical Center, Mon-Thu, 7:00 AM-3:30 PM");
  assert.equal(result.shifts.length, 4);
  assert.equal(result.shifts[0].day, "Monday");
  assert.equal(result.shifts[3].day, "Thursday");
  assert.equal(result.shifts[0].startTime, "07:00");
  assert.equal(result.shifts[0].endTime, "15:30");
});

test("fallback explanation only uses supplied facts", () => {
  const result = fallbackExplanation(["ARRIVAL_OVERLAP", "EXPENSE_SHARE"], {
    arrivalOverlapMinutes: 8,
    expenseShare: 3.2,
  });
  assert.equal(result.explanation.bullets.length, 2);
  assert.match(result.explanation.bullets[1], /\$3\.20/);
  assert.deepEqual(result.explanation.factIdsUsed, ["ARRIVAL_OVERLAP", "EXPENSE_SHARE"]);
});
