import assert from "node:assert/strict";
import test from "node:test";

import { AuthenticationError, AuthorizationError, authenticateRequest, requireRecentAuthentication, requireRole } from "./identity.mjs";

function services({ decoded = { uid: "u1", email: "worker@example.com" }, membership } = {}) {
  return {
    auth: { verifyIdToken: async () => decoded },
    db: {
      collection: () => ({
        doc: () => ({
          get: async () => ({
            exists: Boolean(membership),
            data: () => membership,
          }),
        }),
      }),
    },
  };
}

test("authentication rejects missing bearer token", async () => {
  await assert.rejects(() => authenticateRequest({ headers: {} }, services()), AuthenticationError);
});
test("identity tenant and role come from server-side membership", async () => {
  const identity = await authenticateRequest(
    { headers: { authorization: "Bearer signed-token" } },
    services({ decoded: { uid: "u1", email: "worker@example.com", auth_time: 1000, amr: ["mfa"] }, membership: { tenantId: "tenant-a", role: "employee", status: "active" } }),
  );
  assert.deepEqual(identity, { uid: "u1", email: "worker@example.com", tenantId: "tenant-a", role: "employee", authenticatedAt: 1_000_000, secondFactorVerified: true });
});

test("destructive actions require a recent authentication", () => {
  assert.throws(() => requireRecentAuthentication({ authenticatedAt: null }, () => 1_000_000), AuthenticationError);
  assert.throws(() => requireRecentAuthentication({ authenticatedAt: 1 }, () => 1_000_000), AuthenticationError);
  assert.doesNotThrow(() => requireRecentAuthentication({ authenticatedAt: 999_000 }, () => 1_000_000));
});

test("inactive memberships and wrong employer roles are rejected", async () => {
  await assert.rejects(
    () => authenticateRequest(
      { headers: { authorization: "Bearer signed-token" } },
      services({ membership: { tenantId: "tenant-a", role: "employee", status: "disabled" } }),
    ),
    AuthorizationError,
  );
  assert.throws(() => requireRole({ role: "employee" }, "employer_admin"), AuthorizationError);
});
