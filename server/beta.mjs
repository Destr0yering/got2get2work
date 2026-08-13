import { randomUUID } from "node:crypto";
import { AuthorizationError } from "./identity.mjs";

const ROLES = new Set(["passenger", "driver"]);
const DAYS = new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);

function text(value, max, label) {
  const cleaned = String(value ?? "").trim();
  if (!cleaned || cleaned.length > max) throw new Error(`${label} is required and must be under ${max} characters.`);
  return cleaned;
}

function role(value, label) {
  if (!ROLES.has(value)) throw new Error(`${label} must be driver or passenger.`);
  return value;
}

function userRef(services, identity, uid = identity.uid) {
  return services.db.collection("tenants").doc(identity.tenantId).collection("users").doc(uid);
}

function restrictionRef(services, identity, otherUid) {
  return services.db.collection("tenants").doc(identity.tenantId).collection("matchingRestrictions").doc([identity.uid, otherUid].sort().join("__"));
}

export async function saveBetaProfile(services, identity, body) {
  const profile = {
    displayName: text(body.displayName, 60, "First name"),
    areaLabel: text(body.areaLabel, 100, "General pickup area"),
    toWorkRole: role(body.toWorkRole, "To-work role"),
    homeRole: role(body.homeRole, "Home role"),
    maxDetourMinutes: Math.max(0, Math.min(30, Number(body.maxDetourMinutes) || 0)),
    seats: Math.max(0, Math.min(6, Number(body.seats) || 0)),
  };
  await userRef(services, identity).set({ profile, betaStatus: "profile_ready", updatedAt: services.serverTimestamp }, { merge: true });
  return { profile };
}

export async function saveBetaSchedule(services, identity, body) {
  if (!Array.isArray(body.shifts) || body.shifts.length < 1 || body.shifts.length > 14) throw new Error("Add between 1 and 14 shifts.");
  const shifts = body.shifts.map((shift) => {
    const weekday = text(shift.weekday || shift.day, 12, "Weekday");
    if (!DAYS.has(weekday)) throw new Error("Choose a valid weekday.");
    return {
      weekday,
      startLabel: text(shift.startLabel, 20, "Shift start"),
      endLabel: text(shift.endLabel, 20, "Shift end"),
      worksite: text(shift.worksite, 100, "Worksite"),
    };
  });
  await userRef(services, identity).set({ shifts, betaStatus: "discoverable", updatedAt: services.serverTimestamp }, { merge: true });
  return { shiftsSaved: shifts.length };
}

function compatibleLeg(mine, theirs, leg) {
  const mineRole = leg === "toWork" ? mine.toWorkRole : mine.homeRole;
  const theirRole = leg === "toWork" ? theirs.toWorkRole : theirs.homeRole;
  return mineRole !== theirRole;
}

export async function listBetaMatches(services, identity) {
  const [meSnap, restrictionsSnap, usersSnap] = await Promise.all([
    userRef(services, identity).get(),
    services.db.collection("tenants").doc(identity.tenantId).collection("matchingRestrictions").where("userIds", "array-contains", identity.uid).get(),
    services.db.collection("tenants").doc(identity.tenantId).collection("users").limit(100).get(),
  ]);
  if (!meSnap.exists || !meSnap.data()?.profile || !meSnap.data()?.shifts?.length) {
    throw new AuthorizationError("Complete your profile and schedule before finding matches.", "ONBOARDING_REQUIRED");
  }
  const me = meSnap.data();
  const blocked = new Set(restrictionsSnap.docs.flatMap((doc) => doc.data().userIds).filter((uid) => uid !== identity.uid));
  const myDays = new Set(me.shifts.map((shift) => shift.weekday));
  const matches = usersSnap.docs.flatMap((doc) => {
    if (doc.id === identity.uid || blocked.has(doc.id)) return [];
    const candidate = doc.data();
    if (candidate.betaStatus !== "discoverable" || !candidate.profile || !candidate.shifts?.length) return [];
    const sharedDays = [...new Set(candidate.shifts.map((shift) => shift.weekday).filter((day) => myDays.has(day)))];
    if (!sharedDays.length) return [];
    const toWorkCompatible = compatibleLeg(me.profile, candidate.profile, "toWork");
    const homeCompatible = compatibleLeg(me.profile, candidate.profile, "home");
    if (!toWorkCompatible && !homeCompatible) return [];
    return [{
      userId: doc.id,
      displayName: candidate.profile.displayName,
      areaLabel: candidate.profile.areaLabel,
      sharedDays,
      toWorkCompatible,
      homeCompatible,
      seats: candidate.profile.seats,
      maxDetourMinutes: candidate.profile.maxDetourMinutes,
      routeStatus: "needs_route_review",
    }];
  });
  return { matches };
}

function requestRef(services, identity, requestId) {
  return services.db.collection("tenants").doc(identity.tenantId).collection("rideRequests").doc(requestId);
}

export async function createBetaRequest(services, identity, body) {
  const recipientId = text(body.recipientId, 128, "Recipient");
  if (recipientId === identity.uid) throw new Error("You cannot request your own commute.");
  const requestId = randomUUID();
  let record;
  await services.db.runTransaction(async (transaction) => {
    const [sender, recipient, restriction] = await Promise.all([
      transaction.get(userRef(services, identity)),
      transaction.get(userRef(services, identity, recipientId)),
      transaction.get(restrictionRef(services, identity, recipientId)),
    ]);
    if (restriction.exists) throw new AuthorizationError("This match is unavailable.", "MATCH_RESTRICTED");
    if (!sender.exists || !sender.data()?.profile || !sender.data()?.shifts?.length) throw new AuthorizationError("Complete your onboarding first.", "ONBOARDING_REQUIRED");
    if (!recipient.exists || recipient.data()?.betaStatus !== "discoverable" || !recipient.data()?.profile) throw new AuthorizationError("That beta member is no longer available.", "MATCH_UNAVAILABLE");
    const mine = sender.data();
    const theirs = recipient.data();
    const myDays = new Set(mine.shifts.map((shift) => shift.weekday));
    const sharedDays = [...new Set(theirs.shifts.map((shift) => shift.weekday).filter((day) => myDays.has(day)))];
    const toWorkCompatible = compatibleLeg(mine.profile, theirs.profile, "toWork");
    const homeCompatible = compatibleLeg(mine.profile, theirs.profile, "home");
    if (!sharedDays.length || (!toWorkCompatible && !homeCompatible)) throw new AuthorizationError("The commute roles or schedule no longer overlap.", "MATCH_UNAVAILABLE");
    record = { requesterId: identity.uid, requesterName: mine.profile.displayName, recipientId, recipientName: theirs.profile.displayName, sharedDays, toWorkCompatible, homeCompatible, status: "pending", createdAt: services.serverTimestamp };
    transaction.set(requestRef(services, identity, requestId), record);
  });
  return { request: { id: requestId, ...record } };
}

export async function listBetaRequests(services, identity) {
  const collection = services.db.collection("tenants").doc(identity.tenantId).collection("rideRequests");
  const [incoming, outgoing] = await Promise.all([
    collection.where("recipientId", "==", identity.uid).get(),
    collection.where("requesterId", "==", identity.uid).get(),
  ]);
  const serialize = (doc, direction) => ({ id: doc.id, ...doc.data(), direction });
  return { requests: [...incoming.docs.map((doc) => serialize(doc, "incoming")), ...outgoing.docs.map((doc) => serialize(doc, "outgoing"))] };
}

export async function acceptBetaRequest(services, identity, requestId) {
  const ref = requestRef(services, identity, text(requestId, 128, "Request"));
  let accepted;
  await services.db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists) throw new AuthorizationError("That request is no longer available.", "REQUEST_NOT_FOUND");
    const request = snap.data();
    if (request.recipientId !== identity.uid) throw new AuthorizationError("Only the requested beta member can accept.", "WRONG_RECIPIENT");
    if (request.status !== "pending") throw new Error("That request has already been handled.");
    const restriction = await transaction.get(restrictionRef(services, identity, request.requesterId));
    if (restriction.exists) throw new AuthorizationError("This match is unavailable.", "MATCH_RESTRICTED");
    transaction.update(ref, { status: "accepted", acceptedAt: services.serverTimestamp });
    accepted = { id: snap.id, ...request, status: "accepted" };
  });
  return { request: accepted };
}
