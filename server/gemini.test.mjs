import assert from "node:assert/strict";
import test from "node:test";

import { isLiveGeminiConfigured, renderRecommendation } from "./gemini.mjs";

test("Gemini coordinator stays disabled when no server-side key is present", () => {
  const prior = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  assert.equal(isLiveGeminiConfigured(), false);
  if (prior) process.env.GEMINI_API_KEY = prior;
});

test("Gemini action codes render only server-owned recommendation copy", () => {
  assert.match(renderRecommendation("EXPAND_BACKUP_DRIVER_POOL"), /backup drivers/i);
  assert.throws(() => renderRecommendation("INVENT_EMPLOYEE_CLAIMS"), /unsupported/i);
});
