import assert from "node:assert/strict";
import test, { before, after } from "node:test";
import { deleteApp, initializeApp } from "firebase/app";
import { collection, connectFirestoreEmulator, getDocs, getFirestore } from "firebase/firestore";
import { deleteApp as deleteAdminApp, initializeApp as initializeAdminApp } from "firebase-admin/app";
import { FieldValue, getFirestore as getAdminFirestore, Timestamp } from "firebase-admin/firestore";
import { FirestoreOperationsStore } from "../src/modules/operations/firestore-store";
import { OperationsError, type ModerationCaseRecord } from "../src/modules/operations/domain";
// @ts-expect-error The legacy production API is JavaScript and intentionally exercised through its real module boundary.
import { blockUser } from "../../../server/account.mjs";
// @ts-expect-error The legacy production API is JavaScript and intentionally exercised through its real module boundary.
import { acceptBetaRequest, createBetaRequest, listBetaMatches } from "../../../server/beta.mjs";

const projectId = "demo-got2get2work";
const host = process.env.FIRESTORE_EMULATOR_HOST;
if (!host) throw new Error("FIRESTORE_EMULATOR_HOST is required; run npm run api:test:firestore.");
const [emulatorHost, emulatorPort] = host.split(":");
const adminApp = initializeAdminApp({ projectId }, `emulator-admin-${Date.now()}`);
const db = getAdminFirestore(adminApp);
const store = new FirestoreOperationsStore(db);

before(async () => {
  await fetch(`http://${host}/emulator/v1/projects/${projectId}/databases/(default)/documents`, { method: "DELETE" });
});
after(async () => { await deleteAdminApp(adminApp); });

function moderationCase(id: string): ModerationCaseRecord {
  const now = new Date("2026-08-13T12:00:00.000Z");
  return { id, tenantId: "tenant", worksiteId: "site", category: "unsafe_driving", subjectUid: "subject", status: "open", assignedTo: null, version: 0, createdAt: now, updatedAt: now };
}

test("concurrent moderation decisions commit exactly one audit and restriction", async () => {
  const initial = moderationCase("concurrent-case");
  await store.createCase(initial);
  const occurredAt = new Date("2026-08-13T12:01:00.000Z"), through = new Date("2026-08-14T12:00:00.000Z");
  const transition = (auditId: string) => store.transitionCase({
    expectedVersion: 0, expectedStatuses: ["open"], expectedAssignee: null,
    next: { ...initial, status: "actioned", version: 1, updatedAt: occurredAt },
    audit: { id: auditId, caseId: initial.id, tenantId: initial.tenantId, actorUid: auditId, action: "temporary_restriction", reason: "Safety review", occurredAt },
    restriction: { uid: "subject", through, createdAt: occurredAt },
  });
  const outcomes = await Promise.allSettled([transition("audit-a"), transition("audit-b")]);
  assert.equal(outcomes.filter(v => v.status === "fulfilled").length, 1);
  const rejected = outcomes.find(v => v.status === "rejected") as PromiseRejectedResult;
  assert.ok(rejected.reason instanceof OperationsError);
  assert.equal(rejected.reason.code, "CASE_CONFLICT");
  const audits = await db.collection("moderationAudit").where("caseId", "==", initial.id).get();
  assert.equal(audits.size, 1);
  const restriction = await db.collection("matchingRestrictions").doc("tenant_user_subject").get();
  assert.equal(restriction.data()?.safetyRestricted, true);
  assert.equal((await store.getCase(initial.id))?.version, 1);
});

test("simultaneous privacy retries create one deterministic request", async () => {
  const requestedAt = new Date("2026-08-13T12:02:00.000Z");
  const request = { id: "deterministic-request", uid: "worker", tenantId: "tenant", type: "deletion" as const, status: "queued" as const, requestedAt };
  const results = await Promise.all(Array.from({ length: 10 }, () => store.createOrGetDataRequest(request)));
  assert.equal(new Set(results.map(v => v.id)).size, 1);
  assert.equal((await db.collection("dataRequests").where("uid", "==", "worker").get()).size, 1);
});

test("declared composite indexes serve production query shapes", async () => {
  await db.collection("moderationCases").doc("indexed-case").set({ ...moderationCase("indexed-case"), createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
  assert.ok((await store.listCases("tenant", 100)).length >= 1);
  await db.collection("dataRequests").doc("indexed-request").set({ uid: "index-user", tenantId: "tenant", type: "export", status: "queued", requestedAt: Timestamp.now() });
  assert.equal((await store.listDataRequests("index-user")).length, 1);
});

test("client Firestore access is denied by deployed rules", async () => {
  const clientApp = initializeApp({ projectId, apiKey: "demo-key" }, `emulator-client-${Date.now()}`);
  const clientDb = getFirestore(clientApp);
  connectFirestoreEmulator(clientDb, emulatorHost!, Number(emulatorPort));
  try {
    await assert.rejects(() => getDocs(collection(clientDb, "moderationCases")), /permission-denied|Missing or insufficient permissions/i);
  } finally { await deleteApp(clientApp); }
});

test("either party's legacy block suppresses discovery and request creation", async () => {
  const tenantId = "legacy-tenant", alice = { uid: "alice", tenantId, email: null, role: "employee" }, bob = { uid: "bob", tenantId, email: null, role: "employee" };
  const services = { db, serverTimestamp: FieldValue.serverTimestamp() };
  const users = db.collection("tenants").doc(tenantId).collection("users");
  const profile = (displayName: string, toWorkRole: string) => ({ displayName, areaLabel: "South Florida", toWorkRole, homeRole: toWorkRole, maxDetourMinutes: 10, seats: 2 });
  await Promise.all([
    db.collection("memberships").doc(alice.uid).set({ tenantId, status: "active", role: "employee" }),
    db.collection("memberships").doc(bob.uid).set({ tenantId, status: "active", role: "employee" }),
    users.doc(alice.uid).set({ betaStatus: "discoverable", profile: profile("Alice", "passenger"), shifts: [{ weekday: "Monday" }] }),
    users.doc(bob.uid).set({ betaStatus: "discoverable", profile: profile("Bob", "driver"), shifts: [{ weekday: "Monday" }] }),
  ]);
  assert.equal((await listBetaMatches(services, bob)).matches.some((match: { userId: string }) => match.userId === alice.uid), true);
  await blockUser(services, alice, { blockedUserId: bob.uid });
  assert.equal((await listBetaMatches(services, bob)).matches.some((match: { userId: string }) => match.userId === alice.uid), false);
  await assert.rejects(() => createBetaRequest(services, bob, { recipientId: alice.uid }), (error: any) => error.code === "MATCH_RESTRICTED");
});

test("a concurrent legacy block prevents request acceptance", async () => {
  const tenantId = "accept-tenant", captain = { uid: "captain", tenantId, email: null, role: "employee" }, crew = { uid: "crew", tenantId, email: null, role: "employee" };
  const services = { db, serverTimestamp: FieldValue.serverTimestamp() };
  const users = db.collection("tenants").doc(tenantId).collection("users");
  await Promise.all([
    db.collection("memberships").doc(captain.uid).set({ tenantId, status: "active", role: "employee" }),
    db.collection("memberships").doc(crew.uid).set({ tenantId, status: "active", role: "employee" }),
    users.doc(captain.uid).set({ betaStatus: "discoverable", profile: { displayName: "Captain", areaLabel: "South Florida", toWorkRole: "driver", homeRole: "driver", seats: 2, maxDetourMinutes: 10 }, shifts: [{ weekday: "Monday" }] }),
    users.doc(crew.uid).set({ betaStatus: "discoverable", profile: { displayName: "Crew", areaLabel: "South Florida", toWorkRole: "passenger", homeRole: "passenger", seats: 0, maxDetourMinutes: 10 }, shifts: [{ weekday: "Monday" }] }),
  ]);
  const pending = await createBetaRequest(services, crew, { recipientId: captain.uid });
  await blockUser(services, captain, { blockedUserId: crew.uid });
  await assert.rejects(() => acceptBetaRequest(services, captain, pending.request.id), (error: any) => error.code === "MATCH_RESTRICTED");
});
