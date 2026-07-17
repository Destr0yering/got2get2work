import assert from "node:assert/strict";
import test from "node:test";
import { fallbackSchedule } from "./fallback.mjs";
import { PrivacyInputError, assertScheduleTextIsSafe, sanitizeMatchFacts, sanitizeScheduleProjectionForOpenAI } from "./privacy.mjs";

test("allows ordinary schedule text", () => {
  assert.equal(
    assertScheduleTextIsSafe("Northstar Medical Center, Mon-Thu, 7:00 AM-3:30 PM"),
    "Northstar Medical Center, Mon-Thu, 7:00 AM-3:30 PM"
  );
});

test("blocks addresses and contact details", () => {
  for (const value of [
    "I work at 123 Main Street from 7 to 3",
    "Meet near Pine St and 4th Ave for Monday",
    "My pickup area is Pine & 4th for Monday",
    "Text me at 212-555-0199 for Monday",
    "Use me@example.com for my schedule",
    "My pickup is 40.71280, -74.00600",
    "My area is 10001 and I work Monday",
  ]) {
    assert.throws(() => assertScheduleTextIsSafe(value), PrivacyInputError);
  }
});

test("schedule projection structurally strips raw and unknown fields", () => {
  const raw = "My home is 123 Main, Mon-Thu, 7-3:30; call extension five five five";
  const locallyParsed = fallbackSchedule(raw);
  const result = sanitizeScheduleProjectionForOpenAI({
    ...locallyParsed,
    personalEmail: "worker@example.com",
    shifts: locallyParsed.shifts.map((shift) => ({
      ...shift,
      homeAddress: "123 Main",
      phone: "212-555-0199",
    })),
  });

  assert.deepEqual(result, {
    schemaVersion: 1,
    workplaceReference: "verified_workplace",
    timezoneContext: "local_workplace_time",
    shifts: [
      { day: "Monday", startTime: "07:00", endTime: "15:30" },
      { day: "Tuesday", startTime: "07:00", endTime: "15:30" },
      { day: "Wednesday", startTime: "07:00", endTime: "15:30" },
      { day: "Thursday", startTime: "07:00", endTime: "15:30" },
    ],
  });
  const outbound = JSON.stringify(result);
  for (const forbidden of ["My home", "123 Main", "worker@example.com", "212-555-0199", "Northstar"]) {
    assert.equal(outbound.includes(forbidden), false);
  }
});

test("schedule projection rejects raw prose and non-allowlisted values", () => {
  assert.throws(() => sanitizeScheduleProjectionForOpenAI("Monday at seven"), PrivacyInputError);
  assert.throws(
    () => sanitizeScheduleProjectionForOpenAI([{ day: "Meet at Pine Street", startTime: "07:00", endTime: "15:30" }]),
    PrivacyInputError
  );
  assert.throws(
    () => sanitizeScheduleProjectionForOpenAI([{ day: "Monday", startTime: "call me", endTime: "15:30" }]),
    PrivacyInputError
  );
  const disguisedRawValue = {
    toString: () => "07:00",
    toJSON: () => ({ homeAddress: "123 Main" }),
  };
  assert.throws(
    () => sanitizeScheduleProjectionForOpenAI([{ day: "Monday", startTime: disguisedRawValue, endTime: "15:30" }]),
    PrivacyInputError
  );
});

test("match facts discard unknown keys and accept numeric facts", () => {
  const result = sanitizeMatchFacts(["SAME_WORKSITE", "DRIVER_DETOUR"], {
    driverDetourMinutes: 5,
    worksiteVerified: true,
    homeAddress: "not accepted",
  });
  assert.deepEqual(result, {
    reasonCodes: ["SAME_WORKSITE", "DRIVER_DETOUR"],
    facts: { driverDetourMinutes: 5, worksiteVerified: true },
  });
});

test("display facts are reduced to numeric and boolean AI facts", () => {
  const result = sanitizeMatchFacts(
    ["SAME_WORKSITE", "ARRIVAL_OVERLAP_8M", "DEPARTURE_OVERLAP_12M", "DETOUR_5M", "RECURRING_4_DAYS"],
    [
      { id: "worksite", label: "Workplace", value: "Same verified North Campus worksite" },
      { id: "time", label: "Schedule", value: "Arrives within 8 minutes of your shift" },
      { id: "route", label: "Route", value: "Pickup adds about 5 minutes" },
      { id: "cost", label: "Expense share", value: "$3.20 suggested contribution" },
    ]
  );
  assert.deepEqual(result.facts, {
    worksiteVerified: true,
    arrivalOverlapMinutes: 8,
    departureOverlapMinutes: 12,
    driverDetourMinutes: 5,
    recurringDays: 4,
    expenseShare: 3.2,
  });
});

test("match facts reject negative, excessive, fractional, and contradictory values", () => {
  assert.throws(
    () => sanitizeMatchFacts(["DETOUR_5M"], { driverDetourMinutes: -5 }),
    (error) => error instanceof PrivacyInputError && error.code === "INVALID_FACT_VALUE"
  );
  assert.throws(
    () => sanitizeMatchFacts(["RECURRING_4_DAYS"], { recurringDays: 4.5 }),
    (error) => error instanceof PrivacyInputError && error.code === "INVALID_FACT_VALUE"
  );
  assert.throws(
    () => sanitizeMatchFacts(["DETOUR_5M"], { driverDetourMinutes: 7 }),
    (error) => error instanceof PrivacyInputError && error.code === "CONTRADICTORY_FACTS"
  );
  assert.throws(
    () => sanitizeMatchFacts(["SAME_WORKSITE"], { worksiteVerified: false }),
    (error) => error instanceof PrivacyInputError && error.code === "CONTRADICTORY_FACTS"
  );
});
