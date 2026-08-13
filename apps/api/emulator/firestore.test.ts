import assert from "node:assert/strict";
import test, { before, after } from "node:test";
import { deleteApp, initializeApp } from "firebase/app";
import { collection, connectFirestoreEmulator, getDocs, getFirestore } from "firebase/firestore";
import { deleteApp as deleteAdminApp, initializeApp as initializeAdminApp } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, Timestamp } from "firebase-admin/firestore";
import { FirestoreOperationsStore } from "../src/modules/operations/firestore-store";
import { OperationsError, type ModerationCaseRecord } from "../src/modules/operations/domain";

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
