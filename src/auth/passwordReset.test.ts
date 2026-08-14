import assert from "node:assert/strict";
import test from "node:test";

import { isPrivatePasswordResetError, normalizePasswordResetEmail } from "./passwordReset";

test("normalizes a valid password reset email", () => {
  assert.equal(normalizePasswordResetEmail("  Worker@Example.COM "), "worker@example.com");
});

test("rejects malformed password reset email addresses", () => {
  assert.throws(() => normalizePasswordResetEmail("not-an-email"), /valid email address/);
});

test("recognizes user-not-found as an account-private outcome", () => {
  assert.equal(isPrivatePasswordResetError({ code: "auth/user-not-found" }), true);
  assert.equal(isPrivatePasswordResetError({ code: "auth/network-request-failed" }), false);
});
