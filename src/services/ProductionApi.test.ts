import assert from "node:assert/strict";
import test from "node:test";

import { ProductionApiError, parseProductionApiError } from "./ProductionApi";

test("parses the typed API error envelope without leaking unknown payloads", () => {
  const error = parseProductionApiError(403, { error: { code: "MFA_REQUIRED", message: "A verified second factor is required.", correlationId: "request-1", extra: "ignored" } });
  assert.ok(error instanceof ProductionApiError);
  assert.equal(error.code, "MFA_REQUIRED");
  assert.equal(error.correlationId, "request-1");
});

test("uses a safe fallback for malformed API errors", () => {
  const error = parseProductionApiError(500, { debug: "sensitive detail" });
  assert.equal(error.code, "REQUEST_FAILED");
  assert.equal(error.message.includes("sensitive"), false);
});
