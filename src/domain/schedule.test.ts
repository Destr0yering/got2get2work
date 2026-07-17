import assert from "node:assert/strict";
import test from "node:test";

import { formatShiftCount, parseLocalSchedule } from "./schedule";

test("schedule count copy uses the actual singular or plural count", () => {
  assert.equal(formatShiftCount(0), "0 shifts");
  assert.equal(formatShiftCount(1), "1 shift");
  assert.equal(formatShiftCount(4), "4 shifts");
});

test("local schedule parsing respects weekday ranges and shift times", () => {
  const result = parseLocalSchedule("Warehouse A, Mon–Thu, 7–3:30");
  assert.equal(result.shifts.length, 4);
  assert.equal(result.shifts[0].weekday, "Mon");
  assert.equal(result.shifts[3].weekday, "Thu");
  assert.equal(result.shifts[0].startLabel, "7:00 AM");
  assert.equal(result.shifts[0].endLabel, "3:30 PM");
});

test("local schedule parsing supports a single weekend overnight shift", () => {
  const result = parseLocalSchedule("Saturday 11 PM–7 AM");
  assert.equal(result.shifts.length, 1);
  assert.equal(result.shifts[0].weekday, "Sat");
  assert.equal(result.shifts[0].startLabel, "11:00 PM");
  assert.equal(result.shifts[0].endLabel, "7:00 AM");
});

test("local schedule parsing rejects ambiguous prose instead of inventing shifts", () => {
  assert.throws(() => parseLocalSchedule("My schedule changes a lot"), /weekday and a time range/i);
});

test("local schedule parsing rejects multiple conflicting day-time clauses", () => {
  assert.throws(() => parseLocalSchedule("Mon 7-3, Tue 9-5"), /one recurring time range at a time/i);
});
