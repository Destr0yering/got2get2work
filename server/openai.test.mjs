import assert from "node:assert/strict";
import test from "node:test";

import { explainMatchWithOpenAI } from "./openai.mjs";

test("OpenAI request body contains only the sanitized match projection", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousFetch = globalThis.fetch;
  let outbound;
  process.env.OPENAI_API_KEY = "test-only-placeholder";
  globalThis.fetch = async (_url, init) => {
    outbound = JSON.parse(String(init.body));
    return {
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        output_text: JSON.stringify({
          headline: "Compatible commute",
          summary: "The validated worksite and detour facts line up.",
          bullets: ["The added detour is five minutes."],
          caveat: "Both coworkers decide and transportation is not guaranteed.",
          factIdsUsed: ["SAME_WORKSITE", "DETOUR_5M"],
        }),
      }),
    };
  };

  try {
    await explainMatchWithOpenAI(
      ["SAME_WORKSITE", "DETOUR_5M"],
      { worksiteVerified: true, driverDetourMinutes: 5, homeAddress: "123 Main Street", personalEmail: "worker@example.com" }
    );
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }

  const projection = JSON.parse(outbound.input);
  assert.deepEqual(projection, {
    reasonCodes: ["SAME_WORKSITE", "DETOUR_5M"],
    facts: { worksiteVerified: true, driverDetourMinutes: 5 },
  });
  const serialized = JSON.stringify(outbound);
  assert.equal(serialized.includes("123 Main"), false);
  assert.equal(serialized.includes("worker@example.com"), false);
  assert.equal(outbound.store, false);
});
