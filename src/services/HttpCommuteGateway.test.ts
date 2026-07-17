import assert from "node:assert/strict";
import test from "node:test";

import { DemoCommuteGateway } from "./DemoCommuteGateway";
import { FetchLike } from "./CommuteGateway";
import { createCommuteGateway, HttpCommuteGateway } from "./HttpCommuteGateway";

test("the app stays offline unless live mode is explicitly enabled", async () => {
  const previousBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const previousDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE;
  try {
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://example.test";
    delete process.env.EXPO_PUBLIC_DEMO_MODE;
    const result = await createCommuteGateway().parseSchedule("Warehouse A, Mon–Thu, 7–3:30");
    assert.equal(result.source, "demo");
  } finally {
    if (previousBaseUrl === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL;
    else process.env.EXPO_PUBLIC_API_BASE_URL = previousBaseUrl;
    if (previousDemoMode === undefined) delete process.env.EXPO_PUBLIC_DEMO_MODE;
    else process.env.EXPO_PUBLIC_DEMO_MODE = previousDemoMode;
  }
});

test("default no-billing gateway performs zero network requests", async () => {
  const previousBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const previousDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE;
  const previousFetch = globalThis.fetch;
  let fetchCount = 0;
  try {
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://example.test";
    delete process.env.EXPO_PUBLIC_DEMO_MODE;
    globalThis.fetch = async () => {
      fetchCount += 1;
      throw new Error("network must remain unused");
    };
    const gateway = createCommuteGateway();
    await gateway.parseSchedule("Friday 9–5");
    await gateway.explainMatch({ reasonCodes: ["SAME_WORKSITE"], facts: [{ id: "worksite", label: "Workplace", value: "Same seeded workplace" }] });
    assert.equal(fetchCount, 0);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousBaseUrl === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL;
    else process.env.EXPO_PUBLIC_API_BASE_URL = previousBaseUrl;
    if (previousDemoMode === undefined) delete process.env.EXPO_PUBLIC_DEMO_MODE;
    else process.env.EXPO_PUBLIC_DEMO_MODE = previousDemoMode;
  }
});

test("HTTP gateway marks a valid response as live GPT", async () => {
  const fetchStub: FetchLike = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      source: "openai",
      model: "gpt-live-test",
      summary: "One live shift.",
      worksiteLabel: "North Campus",
      shifts: [{ day: "Tue", date: "Jul 21", startTime: "7:00 AM", endTime: "3:30 PM", role: "Associate" }]
    })
  });
  const gateway = new HttpCommuteGateway("https://example.test", fetchStub, new DemoCommuteGateway(0));
  const result = await gateway.parseSchedule("Tuesday 7 to 3:30");
  assert.equal(result.source, "live_gpt");
  assert.equal(result.model, "gpt-live-test");
  assert.equal(result.shifts[0].worksite, "North Campus");
});

test("HTTP gateway visibly falls back when the endpoint fails", async () => {
  const fetchStub: FetchLike = async () => { throw new Error("offline"); };
  const gateway = new HttpCommuteGateway("https://example.test", fetchStub, new DemoCommuteGateway(0));
  const result = await gateway.parseSchedule("Warehouse A, Mon–Thu, 7–3:30");
  assert.equal(result.source, "demo");
  assert.match(result.fallbackReason ?? "", /offline/);
  assert.equal(result.shifts.length, 4);
});

test("explain endpoint receives only reason codes and verified facts", async () => {
  let postedBody = "";
  const fetchStub: FetchLike = async (_input, init) => {
    postedBody = String(init?.body);
    return { ok: true, status: 200, json: async () => ({ source: "openai", model: "gpt-live-test", explanation: { headline: "Why it fits", summary: "Verified explanation", bullets: ["Same workplace"], caveat: "User approval required", factIdsUsed: ["worksite"] } }) };
  };
  const gateway = new HttpCommuteGateway("https://example.test", fetchStub, new DemoCommuteGateway(0));
  const result = await gateway.explainMatch({
    reasonCodes: ["SAME_WORKSITE"],
    facts: [{ id: "worksite", label: "Workplace", value: "Same verified worksite" }]
  });
  assert.equal(result.source, "live_gpt");
  assert.deepEqual(JSON.parse(postedBody), {
    reasonCodes: ["SAME_WORKSITE"],
    facts: [{ id: "worksite", label: "Workplace", value: "Same verified worksite" }]
  });
});
