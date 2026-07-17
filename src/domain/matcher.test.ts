import assert from "node:assert/strict";
import test from "node:test";

import { CandidateFacts, MatchPolicy, calculateExpenseShare, rankCandidates } from "./matcher";

const policy: MatchPolicy = {
  worksiteId: "north-campus",
  commuteLeg: "to_work",
  maxArrivalOverlapMinutes: 15,
  maxDepartureOverlapMinutes: 15,
  maxDetourMinutes: 10,
  needsAccessibleVehicle: false
};

const candidate: CandidateFacts = {
  id: "jordan",
  worksiteId: "north-campus",
  commuteLeg: "to_work",
  canDrive: true,
  seatsAvailable: 2,
  arrivalOverlapMinutes: 8,
  departureOverlapMinutes: 12,
  detourMinutes: 5,
  recurringDays: 4,
  fairnessRotation: 0.7,
  accessibleVehicle: true,
  activeConsent: true,
  blocked: false,
  detourMiles: 1,
  sharedMiles: 9,
  operatingCostPerMile: 0.4,
  tolls: 1,
  estimatedTripCost: 8,
  comparableSoloCost: 18
};

test("matching rejects every hard-gate failure", () => {
  const failures: Array<Partial<CandidateFacts>> = [
    { worksiteId: "south-campus" },
    { commuteLeg: "from_work" },
    { canDrive: false },
    { seatsAvailable: 0 },
    { arrivalOverlapMinutes: 16 },
    { departureOverlapMinutes: 16 },
    { detourMinutes: 11 },
    { activeConsent: false },
    { blocked: true }
  ];
  for (const failure of failures) {
    assert.equal(rankCandidates(policy, [{ ...candidate, ...failure }]).length, 0);
  }
  assert.equal(rankCandidates({ ...policy, needsAccessibleVehicle: true }, [{ ...candidate, accessibleVehicle: false }]).length, 0);
});

test("matching ranks eligible candidates and computes a capped expense share", () => {
  const backup = { ...candidate, id: "avery", arrivalOverlapMinutes: 11, detourMinutes: 9, recurringDays: 3 };
  const ranked = rankCandidates(policy, [backup, candidate]);
  assert.deepEqual(ranked.map((item) => item.id), ["jordan", "avery"]);
  assert.equal(calculateExpenseShare(candidate), 3.2);
  assert.equal(calculateExpenseShare({ ...candidate, comparableSoloCost: 2.5 }), 2.5);
});
