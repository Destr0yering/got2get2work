import assert from "node:assert/strict";
import test from "node:test";

import { canTransitionTrip, transitionTrip, tripStatusLabel } from "./tripMachine";

test("trip flow permits the complete mutual-approval and recovery path", () => {
  assert.equal(canTransitionTrip("options_ready", "request_pending"), true);
  assert.equal(canTransitionTrip("request_pending", "confirmed"), true);
  assert.equal(canTransitionTrip("confirmed", "cancelled"), true);
  assert.equal(canTransitionTrip("cancelled", "recovery_ready"), true);
  assert.equal(canTransitionTrip("recovery_ready", "recovered"), true);
  assert.equal(tripStatusLabel("recovered"), "Backup confirmed");
});

test("trip flow rejects unsafe skipped states", () => {
  assert.equal(canTransitionTrip("options_ready", "confirmed"), false);
  assert.throws(() => transitionTrip("options_ready", "confirmed"), /Invalid trip transition/);
});
