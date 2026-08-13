import assert from "node:assert/strict";
import test from "node:test";

import { buildApi } from "../src/app";
import type { ApiConfig } from "../src/config";
import { referralDigest, type MembershipRecord } from "../src/modules/membership/domain";
import { MemoryMembershipStore } from "../src/modules/membership/memory-store";
import type { FirebaseTokenVerifier } from "../src/modules/membership/ports";
import { MembershipService } from "../src/modules/membership/service";

const pepper = "test-referral-pepper-value";
const now = new Date("2026-08-12T14:00:00.000Z");
const config: ApiConfig = {
  environment: "test",
  host: "127.0.0.1",
  port: 4100,
  release: "membership-test",
  exposeDocumentation: false,
  referralCodePepper: pepper,
  firebase: { apiKey: null, authDomain: null, projectId: "test", appId: null },
};

function verifier(users: Record<string, { uid: string; email: string; email_verified: boolean; auth_time?: number; mfa?: boolean }>): FirebaseTokenVerifier {
  return {
    async verifyIdToken(token) {
      const user = users[token];
      if (!user) throw new Error("invalid token");
      return user;
    },
  };
}

async function fixture() {
  const store = new MemoryMembershipStore();
  await store.putReferral({
    id: "referral-1",
    digest: referralDigest("SOUTHFLORIDA-2026", pepper),
    tenantId: "tenant-a",
    worksiteId: "worksite-a",
    expiresAt: new Date("2026-09-01T00:00:00.000Z"),
    revokedAt: null,
    maxUses: 2,
    useCount: 0,
  });
  store.memberships.set("admin-a", {
    id: "admin-a",
    uid: "admin-a",
    email: "admin-a@example.test",
    tenantId: "tenant-a",
    worksiteId: "worksite-a",
    role: "employer_admin",
    status: "active",
    referralCodeId: "bootstrap",
    submittedAt: now,
  });
  store.memberships.set("admin-b", {
    id: "admin-b",
    uid: "admin-b",
    email: "admin-b@example.test",
    tenantId: "tenant-b",
    worksiteId: "worksite-b",
    role: "employer_admin",
    status: "active",
    referralCodeId: "bootstrap",
    submittedAt: now,
  });
  const service = new MembershipService({ store, referralPepper: pepper, now: () => now });
  const tokenVerifier = verifier({
    worker: { uid: "worker-1", email: "worker@example.test", email_verified: true },
    pending: { uid: "worker-1", email: "worker@example.test", email_verified: true },
    adminA: { uid: "admin-a", email: "admin-a@example.test", email_verified: true, auth_time: Math.floor(Date.now() / 1000), mfa: true },
    adminB: { uid: "admin-b", email: "admin-b@example.test", email_verified: true, auth_time: Math.floor(Date.now() / 1000), mfa: true },
    adminNoMfa: { uid: "admin-a", email: "admin-a@example.test", email_verified: true, auth_time: Math.floor(Date.now() / 1000) },
    adminStale: { uid: "admin-a", email: "admin-a@example.test", email_verified: true, auth_time: Math.floor(Date.now() / 1000) - 3600, mfa: true },
    workerActive: { uid: "worker-active", email: "active@example.test", email_verified: true },
    unverified: { uid: "worker-2", email: "worker2@example.test", email_verified: false },
  });
  const reporting = {
    history: async () => ({ trips: [] }),
    dashboard: async () => ({ cohortSize: 0, metrics: {} }),
    incentive: async () => ({ id: "test", status: "recorded_not_paid", amountCents: 0, reason: "test", recordedAt: now.toISOString() }),
  };
  const app = await buildApi({ config, logger: false, membership: { verifier: tokenVerifier, service }, reporting: { verifier: tokenVerifier, memberships: service, reporting: reporting as never } });
  return { app, store };
}

test("privileged administrator mutations require MFA and recent authentication", async () => {
  const { app } = await fixture();
  try {
    for (const [token, code] of [["adminNoMfa", "MFA_REQUIRED"], ["adminStale", "RECENT_AUTH_REQUIRED"]]) {
      const requests = [
        { url: "/v1/admin/referral-codes", payload: { expiresAt: "2026-08-20T14:00:00.000Z", maxUses: 1 } },
        { url: "/v1/admin/memberships/worker-1/approve", payload: { reason: "Roster confirmed" } },
        { url: "/v1/admin/memberships/worker-1/reject", payload: { reason: "Roster rejected" } },
        { url: "/v1/admin/incentives", payload: { amountCents: 500, reason: "Pilot fuel credit" } },
      ];
      for (const request of requests) {
        const response = await app.inject({ method: "POST", ...request, headers: { authorization: `Bearer ${token}` } });
        assert.equal(response.json().error.code, code, request.url);
      }
    }
  } finally { await app.close(); }
});

test("referral redemption creates pending membership and blocks active-member routes", async () => {
  const { app, store } = await fixture();
  try {
    const redeemed = await app.inject({
      method: "POST",
      url: "/v1/memberships/referrals:redeem",
      headers: { authorization: "Bearer worker" },
      payload: { code: "southflorida-2026" },
    });
    assert.equal(redeemed.statusCode, 201);
    assert.equal(redeemed.json().status, "pending_approval");
    assert.equal(store.memberships.get("worker-1")?.tenantId, "tenant-a");
    assert.equal(store.referrals.values().next().value?.useCount, 1);

    const current = await app.inject({
      method: "GET",
      url: "/v1/memberships/current",
      headers: { authorization: "Bearer pending" },
    });
    assert.equal(current.statusCode, 403);
    assert.equal(current.json().error.code, "MEMBERSHIP_INACTIVE");
  } finally {
    await app.close();
  }
});

test("administrator approval activates membership and writes an audit event", async () => {
  const { app, store } = await fixture();
  try {
    await app.inject({
      method: "POST",
      url: "/v1/memberships/referrals:redeem",
      headers: { authorization: "Bearer worker" },
      payload: { code: "SOUTHFLORIDA-2026" },
    });
    const approved = await app.inject({
      method: "POST",
      url: "/v1/admin/memberships/worker-1/approve",
      headers: { authorization: "Bearer adminA" },
      payload: { reason: "Employee roster confirmed" },
    });
    assert.equal(approved.statusCode, 200);
    assert.equal(approved.json().status, "active");
    assert.equal(store.audits[0]?.action, "membership.approved");
    assert.equal(store.audits[0]?.actorId, "admin-a");

    const current = await app.inject({
      method: "GET",
      url: "/v1/memberships/current",
      headers: { authorization: "Bearer pending" },
    });
    assert.equal(current.statusCode, 200);
    assert.equal(current.json().worksiteId, "worksite-a");
  } finally {
    await app.close();
  }
});

test("administrator creates a scoped code whose plaintext is returned once and can be redeemed", async () => {
  const { app, store } = await fixture();
  try {
    const created = await app.inject({
      method: "POST",
      url: "/v1/admin/referral-codes",
      headers: { authorization: "Bearer adminA" },
      payload: { expiresAt: "2026-08-20T14:00:00.000Z", maxUses: 1 },
    });
    assert.equal(created.statusCode, 201);
    const referral = created.json();
    assert.equal(referral.tenantId, "tenant-a");
    assert.equal(referral.worksiteId, "worksite-a");
    assert.equal(referral.maxUses, 1);
    assert.ok(referral.code.length >= 12);
    assert.equal([...store.referrals.values()].some((item) => item.digest === referral.code), false);
    assert.equal(store.audits.at(-1)?.action, "referral.created");

    const redeemed = await app.inject({
      method: "POST",
      url: "/v1/memberships/referrals:redeem",
      headers: { authorization: "Bearer worker" },
      payload: { code: referral.code },
    });
    assert.equal(redeemed.statusCode, 201);
    assert.equal(redeemed.json().status, "pending_approval");
  } finally {
    await app.close();
  }
});

test("administrator cannot approve a membership from another tenant or worksite", async () => {
  const { app } = await fixture();
  try {
    await app.inject({
      method: "POST",
      url: "/v1/memberships/referrals:redeem",
      headers: { authorization: "Bearer worker" },
      payload: { code: "SOUTHFLORIDA-2026" },
    });
    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/memberships/worker-1/approve",
      headers: { authorization: "Bearer adminB" },
      payload: { reason: "Attempted cross-tenant approval" },
    });
    assert.equal(response.statusCode, 404);
    assert.equal(response.json().error.code, "MEMBERSHIP_NOT_FOUND");
  } finally {
    await app.close();
  }
});

test("administrator rejection is final, audited, and keeps the worker unauthorized", async () => {
  const { app, store } = await fixture();
  try {
    await app.inject({
      method: "POST",
      url: "/v1/memberships/referrals:redeem",
      headers: { authorization: "Bearer worker" },
      payload: { code: "SOUTHFLORIDA-2026" },
    });
    const rejected = await app.inject({
      method: "POST",
      url: "/v1/admin/memberships/worker-1/reject",
      headers: { authorization: "Bearer adminA" },
      payload: { reason: "Employee was not found on the pilot roster" },
    });
    assert.equal(rejected.statusCode, 200);
    assert.equal(rejected.json().status, "rejected");
    assert.equal(store.audits.at(-1)?.action, "membership.rejected");

    const repeated = await app.inject({
      method: "POST",
      url: "/v1/admin/memberships/worker-1/approve",
      headers: { authorization: "Bearer adminA" },
      payload: { reason: "Attempted second decision" },
    });
    assert.equal(repeated.statusCode, 409);

    const current = await app.inject({
      method: "GET",
      url: "/v1/memberships/current",
      headers: { authorization: "Bearer pending" },
    });
    assert.equal(current.statusCode, 403);
  } finally {
    await app.close();
  }
});

test("invalid referral request is rejected by the API contract without consuming a code", async () => {
  const { app, store } = await fixture();
  try {
    const response = await app.inject({
      method: "POST",
      url: "/v1/memberships/referrals:redeem",
      headers: { authorization: "Bearer worker" },
      payload: { code: "short" },
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error.code, "INVALID_REQUEST");
    assert.equal(store.referrals.values().next().value?.useCount, 0);
  } finally {
    await app.close();
  }
});

test("unverified email and non-admin role are denied", async () => {
  const { app, store } = await fixture();
  try {
    const unverified = await app.inject({
      method: "POST",
      url: "/v1/memberships/referrals:redeem",
      headers: { authorization: "Bearer unverified" },
      payload: { code: "SOUTHFLORIDA-2026" },
    });
    assert.equal(unverified.statusCode, 403);
    assert.equal(unverified.json().error.code, "VERIFIED_EMAIL_REQUIRED");

    const worker: MembershipRecord = {
      id: "worker-active",
      uid: "worker-active",
      email: "active@example.test",
      tenantId: "tenant-a",
      worksiteId: "worksite-a",
      role: "worker",
      status: "active",
      referralCodeId: "referral-1",
      submittedAt: now,
    };
    store.memberships.set(worker.id, worker);
    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/memberships",
      headers: { authorization: "Bearer workerActive" },
    });
    assert.equal(response.statusCode, 403);
  } finally {
    await app.close();
  }
});
