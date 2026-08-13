import assert from "node:assert/strict";
import test from "node:test";

import { enrollBetaMember } from "./account.mjs";
import { AuthorizationError } from "./identity.mjs";

test("beta enrollment requires a verified email claim", async () => {
  const previous = process.env.BETA_INVITE_CODE;
  process.env.BETA_INVITE_CODE = "test-invite";
  try {
    await assert.rejects(
      () => enrollBetaMember({}, { uid: "worker", email: "worker@example.test", email_verified: false }, { inviteCode: "test-invite" }),
      (error) => error instanceof AuthorizationError && error.code === "VERIFIED_EMAIL_REQUIRED",
    );
  } finally {
    if (previous === undefined) delete process.env.BETA_INVITE_CODE;
    else process.env.BETA_INVITE_CODE = previous;
  }
});
