import assert from "node:assert/strict";
import test from "node:test";

import { matches } from "../data/demoSeed";
import { AppState, ScheduleParseResult, TripStatus } from "../domain/models";
import { appReducer, createInitialState } from "./reducer";

const editedSchedule: ScheduleParseResult = {
  source: "demo",
  summary: "One edited shift",
  shifts: [{ id: "shift-1", weekday: "Tuesday", dateLabel: "Tuesday", startLabel: "7:00 AM", endLabel: "3:30 PM", worksite: "North Campus", roleLabel: "Employee" }]
};

test("only the requested driver can accept after a request", () => {
  let state = appReducer(createInitialState(), { type: "SKIP_TO_DEMO" });
  state = appReducer(state, { type: "ACCEPT_REQUEST" });
  assert.equal(state.trip.status, "options_ready");
  state = appReducer(state, { type: "SEND_REQUEST" });
  assert.equal(state.trip.requesterId, "maya");
  assert.equal(state.trip.requestedDriverId, "jordan");
  const selfAccepted = appReducer(state, { type: "ACCEPT_REQUEST" });
  assert.equal(selfAccepted.trip.status, "request_pending");
  assert.match(selfAccepted.notice ?? "", /Only the requested driver/);
  state = appReducer(state, { type: "SWITCH_ACTOR", actorId: "jordan" });
  state = appReducer(state, { type: "ACCEPT_REQUEST" });
  assert.equal(state.trip.status, "confirmed");
});

test("consent and optional permissions remain separate from seeded demo entry", () => {
  let state = appReducer(createInitialState(), { type: "SET_CONSENT", acceptedTerms: false, schedulePermission: true, notificationPermission: true });
  assert.equal(state.route, "privacy");
  assert.equal(state.acceptedTerms, false);
  assert.equal(state.schedulePermission, false);
  assert.equal(state.notificationPermission, false);

  state = appReducer(createInitialState(), { type: "SKIP_TO_DEMO" });
  assert.equal(state.demoMode, true);
  assert.equal(state.acceptedTerms, false);
  assert.equal(state.schedulePermission, false);
  assert.equal(state.notificationPermission, false);

  state = appReducer(state, { type: "UPDATE_PERMISSIONS", schedulePermission: true, notificationPermission: false });
  assert.equal(state.schedulePermission, true);
  assert.equal(state.acceptedTerms, false);
});

test("policy acceptance requires both documents and preserves optional choices", () => {
  let state = appReducer(createInitialState(), { type: "UPDATE_PERMISSIONS", schedulePermission: true, notificationPermission: false });
  state = appReducer(state, { type: "REVIEW_POLICY", kind: "terms" });
  state = appReducer(state, { type: "NAVIGATE", route: "privacy" });
  state = appReducer(state, { type: "SET_CONSENT", acceptedTerms: true, schedulePermission: true, notificationPermission: false });
  assert.equal(state.route, "privacy");
  state = appReducer(state, { type: "REVIEW_POLICY", kind: "privacy" });
  state = appReducer(state, { type: "NAVIGATE", route: "privacy" });
  state = appReducer(state, { type: "SET_CONSENT", acceptedTerms: true, schedulePermission: true, notificationPermission: false });
  assert.equal(state.route, "profile-setup");
  assert.equal(state.acceptedTerms, true);
  assert.equal(state.schedulePermission, true);
});

test("commute profile preserves independent to-work and home roles", () => {
  const state = appReducer(createInitialState(), {
    type: "SAVE_PROFILE",
    profile: {
      displayName: "Maya",
      areaLabel: "Pine & 4th",
      role: "either",
      toWorkRole: "passenger",
      homeRole: "driver",
      seats: 2,
      maxDetourMinutes: 10
    }
  });
  assert.equal(state.profile.toWorkRole, "passenger");
  assert.equal(state.profile.homeRole, "driver");
  assert.equal(state.profile.role, "either");
});

test("first schedule notice reflects passenger, driver, or split roles", () => {
  for (const [toWorkRole, homeRole, expected] of [
    ["passenger", "passenger", /round-trip driver fits/i],
    ["driver", "driver", /driver availability/i],
    ["passenger", "driver", /remain separate/i]
  ] as const) {
    const base = createInitialState();
    const saved = appReducer({
      ...base,
      parsedSchedule: editedSchedule,
      profile: { ...base.profile, toWorkRole, homeRole, role: toWorkRole === homeRole ? toWorkRole : "either" }
    }, { type: "SAVE_SCHEDULE" });
    assert.match(saved.notice ?? "", expected);
  }
});

test("ride messages persist in app state across navigation", () => {
  let state = appReducer(createInitialState(), { type: "SKIP_TO_DEMO" });
  state = appReducer(state, { type: "SEND_RIDE_MESSAGE", text: "Running five minutes late" });
  state = appReducer(state, { type: "NAVIGATE", route: "ride-thread" });
  state = appReducer(state, { type: "SET_TAB", tab: "today" });
  assert.deepEqual(state.rideMessages.map((message) => ({ matchId: message.matchId, text: message.text })), [{ matchId: "match-jordan", text: "Running five minutes late" }]);
});

test("ride messages reject personal contact details", () => {
  let state = appReducer(createInitialState(), { type: "SKIP_TO_DEMO" });
  state = appReducer(state, { type: "SEND_RIDE_MESSAGE", text: "Email me at rider@example.com" });
  assert.equal(state.rideMessages.length, 0);
  assert.match(state.notice ?? "", /privacy/i);
});

test("ride messages stay isolated when recovery switches coworkers", () => {
  let state = appReducer(createInitialState(), { type: "SKIP_TO_DEMO" });
  state = appReducer(state, { type: "SEND_REQUEST" });
  state = appReducer(state, { type: "SEND_RIDE_MESSAGE", text: "Jordan thread" });
  state = appReducer(state, { type: "SWITCH_ACTOR", actorId: "jordan" });
  state = appReducer(state, { type: "ACCEPT_REQUEST" });
  state = appReducer(state, { type: "CANCEL_RIDE" });
  state = appReducer(state, { type: "OPEN_RECOVERY" });
  state = appReducer(state, { type: "ACCEPT_BACKUP_OFFER" });
  state = appReducer(state, { type: "SEND_RIDE_MESSAGE", text: "Avery thread" });
  assert.deepEqual(state.rideMessages.map((message) => message.matchId), ["match-jordan", "match-avery"]);
});

test("no-match mode blocks requests and closes scenario controls", () => {
  let state = appReducer(createInitialState(), { type: "SKIP_TO_DEMO" });
  state = appReducer(state, { type: "SET_DEMO_CONTROLS", open: true });
  state = appReducer(state, { type: "SET_MATCH_SCENARIO", scenario: "none" });
  assert.equal(state.demoControlsOpen, false);
  assert.equal(state.activeTab, "matches");
  state = appReducer(state, { type: "SEND_REQUEST" });
  assert.equal(state.trip.status, "options_ready");
});

test("pickup proposals clear explanations and lock after a request", () => {
  let state: AppState = {
    ...appReducer(createInitialState(), { type: "SKIP_TO_DEMO" }),
    agentBusy: true,
    matchExplanation: { source: "demo" as const, message: "Old proposal", bullets: ["Old fact"], reasonCodes: ["DETOUR_5M"] }
  };
  state = appReducer(state, { type: "SELECT_PICKUP_OPTION", pickupOptionId: "transit" });
  assert.equal(state.selectedPickupOptionId, "transit");
  assert.equal(state.matchExplanation, null);
  assert.equal(state.agentBusy, false);
  state = appReducer(state, { type: "SEND_REQUEST" });
  state = appReducer(state, { type: "SELECT_PICKUP_OPTION", pickupOptionId: "library" });
  assert.equal(state.selectedPickupOptionId, "transit");
  assert.match(state.notice ?? "", /locked after a request/i);
});

test("completed commute preferences can favor or block a future match", () => {
  let state = appReducer(createInitialState(), { type: "SKIP_TO_DEMO" });
  state = appReducer(state, { type: "SEND_REQUEST" });
  state = appReducer(state, { type: "SWITCH_ACTOR", actorId: "jordan" });
  state = appReducer(state, { type: "ACCEPT_REQUEST" });
  state = appReducer(state, { type: "SWITCH_ACTOR", actorId: "maya" });
  state = appReducer(state, { type: "COMPLETE_RIDE" });
  state = appReducer(state, { type: "SET_RELATIONSHIP_PREFERENCE", preference: "preferred" });
  assert.equal(state.relationshipPreference, "preferred");
  state = appReducer(state, { type: "SET_RELATIONSHIP_PREFERENCE", preference: "blocked" });
  assert.equal(state.relationshipPreference, "blocked");
  assert.deepEqual(state.blockedMatchIds, ["match-jordan"]);
  assert.equal(state.matchScenario, "matches");
});

test("reducer completes a deterministic cancellation recovery", () => {
  let state = appReducer(createInitialState(), { type: "SKIP_TO_DEMO" });
  state = appReducer(state, { type: "SEND_REQUEST" });
  state = appReducer(state, { type: "SWITCH_ACTOR", actorId: "jordan" });
  state = appReducer(state, { type: "ACCEPT_REQUEST" });
  state = appReducer(state, { type: "CANCEL_RIDE" });
  state = appReducer(state, { type: "OPEN_RECOVERY" });
  state = appReducer(state, { type: "ACCEPT_BACKUP_OFFER" });
  assert.equal(state.trip.status, "recovered");
  assert.equal(state.trip.activeMatchId, "match-avery");
  assert.equal(state.actorId, "maya");
});

test("saving an edited schedule preserves an active trip", () => {
  let state = appReducer(createInitialState(), { type: "SKIP_TO_DEMO" });
  state = appReducer(state, { type: "SEND_REQUEST" });
  state = appReducer(state, { type: "PARSE_SUCCEEDED", result: editedSchedule });
  state = appReducer(state, { type: "SAVE_SCHEDULE" });
  assert.equal(state.trip.status, "request_pending");
  assert.match(state.notice ?? "", /left unchanged/);
});

test("schedule edits never re-dispatch an active trip's current transition", () => {
  const activeStatuses: TripStatus[] = ["options_ready", "request_pending", "confirmed", "cancelled", "recovery_ready", "recovered", "completed"];
  for (const status of activeStatuses) {
    const state = {
      ...createInitialState(),
      route: "schedule-review" as const,
      parsedSchedule: editedSchedule,
      trip: { id: "trip-tuesday", status, activeMatchId: status === "options_ready" ? undefined : "match-jordan" }
    };
    const saved = appReducer(state, { type: "SAVE_SCHEDULE" });
    assert.equal(saved.trip.status, status, `expected ${status} to be preserved`);
    assert.match(saved.notice ?? "", /left unchanged/);
  }
});

test("backing out of recovery leaves a resumable backup on Today", () => {
  let state = appReducer(createInitialState(), { type: "SKIP_TO_DEMO" });
  state = appReducer(state, { type: "SEND_REQUEST" });
  state = appReducer(state, { type: "SWITCH_ACTOR", actorId: "jordan" });
  state = appReducer(state, { type: "ACCEPT_REQUEST" });
  state = appReducer(state, { type: "CANCEL_RIDE" });
  state = appReducer(state, { type: "OPEN_RECOVERY" });
  state = appReducer(state, { type: "SET_TAB", tab: "today" });
  assert.equal(state.route, "main");
  assert.equal(state.activeTab, "today");
  assert.equal(state.trip.status, "recovery_ready");
});

test("Avery recovery uses an explicit standing offer and reveals actual vehicle copy", () => {
  const avery = matches.find((match) => match.id === "match-avery");
  assert.equal(avery?.standingBackupOffer, true);
  assert.match(avery?.vehicleLabel ?? "", /sedan/i);
  assert.doesNotMatch(avery?.vehicleLabel ?? "", /unlock/i);

  const cancelled = {
    ...createInitialState(),
    trip: { id: "trip-tuesday", status: "cancelled" as const, activeMatchId: "match-jordan" }
  };
  const premature = appReducer(cancelled, { type: "ACCEPT_BACKUP_OFFER" });
  assert.equal(premature.trip.status, "cancelled");

  const wrongActor = {
    ...cancelled,
    actorId: "jordan" as const,
    trip: { ...cancelled.trip, status: "recovery_ready" as const }
  };
  const rejected = appReducer(wrongActor, { type: "ACCEPT_BACKUP_OFFER" });
  assert.equal(rejected.trip.status, "recovery_ready");
});

test("appearance customization stays scoped to the active demo coworker", () => {
  let state = appReducer(createInitialState(), { type: "SKIP_TO_DEMO" });
  state = appReducer(state, { type: "UPDATE_APPEARANCE", appearance: { avatarId: "star", vehicleColorId: "red", vehicleType: "Sedan", vehicleNickname: "  Shift Star  " } });
  assert.equal(state.appearances.maya.avatarId, "star");
  assert.equal(state.appearances.maya.vehicleNickname, "Shift Star");
  assert.equal(state.appearances.jordan.avatarId, "leaf");
  state = appReducer(state, { type: "SWITCH_ACTOR", actorId: "jordan" });
  state = appReducer(state, { type: "UPDATE_APPEARANCE", appearance: { avatarId: "bolt", vehicleColorId: "silver", vehicleType: "Pickup", vehicleNickname: "" } });
  assert.equal(state.appearances.jordan.vehicleNickname, "My car");
  assert.equal(state.appearances.maya.vehicleNickname, "Shift Star");
});

test("pickup proximity requires confirmation, separate opt-ins, and role-bound updates", () => {
  let state = appReducer(createInitialState(), { type: "SKIP_TO_DEMO" });
  state = appReducer(state, { type: "SET_PROXIMITY_OPT_IN", enabled: true });
  assert.equal(state.proximityOptIn.maya, false);

  state = appReducer(state, { type: "SEND_REQUEST" });
  state = appReducer(state, { type: "SWITCH_ACTOR", actorId: "jordan" });
  state = appReducer(state, { type: "ACCEPT_REQUEST" });
  state = appReducer(state, { type: "SET_PROXIMITY_OPT_IN", enabled: true });
  assert.deepEqual(state.proximityOptIn, { maya: false, jordan: true });
  state = appReducer(state, { type: "ADVANCE_VEHICLE_APPROACH" });
  assert.equal(state.vehicleApproachStatus, "waiting");

  state = appReducer(state, { type: "SWITCH_ACTOR", actorId: "maya" });
  state = appReducer(state, { type: "SET_PROXIMITY_OPT_IN", enabled: true });
  state = appReducer(state, { type: "SET_PASSENGER_AT_PICKUP", present: true });
  assert.equal(state.passengerAtPickup, true);
  state = appReducer(state, { type: "ADVANCE_VEHICLE_APPROACH" });
  assert.equal(state.vehicleApproachStatus, "waiting");

  state = appReducer(state, { type: "SWITCH_ACTOR", actorId: "jordan" });
  state = appReducer(state, { type: "ADVANCE_VEHICLE_APPROACH" });
  state = appReducer(state, { type: "ADVANCE_VEHICLE_APPROACH" });
  state = appReducer(state, { type: "ADVANCE_VEHICLE_APPROACH" });
  assert.equal(state.vehicleApproachStatus, "arrived");
  assert.equal(state.passengerAtPickup, true);
});

test("stopping proximity or cancelling clears pickup signals", () => {
  let state = appReducer(createInitialState(), { type: "SKIP_TO_DEMO" });
  state = appReducer(state, { type: "SEND_REQUEST" });
  state = appReducer(state, { type: "SWITCH_ACTOR", actorId: "jordan" });
  state = appReducer(state, { type: "ACCEPT_REQUEST" });
  state = appReducer(state, { type: "SET_PROXIMITY_OPT_IN", enabled: true });
  state = appReducer(state, { type: "SWITCH_ACTOR", actorId: "maya" });
  state = appReducer(state, { type: "SET_PROXIMITY_OPT_IN", enabled: true });
  state = appReducer(state, { type: "SET_PASSENGER_AT_PICKUP", present: true });
  state = appReducer(state, { type: "SET_PROXIMITY_OPT_IN", enabled: false });
  assert.equal(state.passengerAtPickup, false);
  state = appReducer(state, { type: "SET_PROXIMITY_OPT_IN", enabled: true });
  state = appReducer(state, { type: "CANCEL_RIDE" });
  assert.deepEqual(state.proximityOptIn, { maya: false, jordan: false });
  assert.equal(state.vehicleApproachStatus, "waiting");
  assert.equal(state.passengerAtPickup, false);
});

test("reset always restores a pristine demo", () => {
  const modified = appReducer(appReducer(createInitialState(), { type: "SKIP_TO_DEMO" }), { type: "SEND_REQUEST" });
  const reset = appReducer(modified, { type: "RESET_DEMO" });
  assert.equal(reset.route, "welcome");
  assert.equal(reset.trip.status, "needs_plan");
  assert.equal(reset.actorId, "maya");
});
