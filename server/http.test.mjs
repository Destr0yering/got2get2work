import assert from "node:assert/strict";
import test from "node:test";

import { createAppServer } from "./index.mjs";

async function withServer(run, options) {
  const server = createAppServer(options);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function employerServices() {
  return {
    auth: { verifyIdToken: async () => ({ uid: "admin-1", email: "admin@example.test" }) },
    db: {
      collection: () => ({
        doc: () => ({
          get: async () => ({
            exists: true,
            data: () => ({ tenantId: "tenant-test", role: "employer_admin", status: "active" }),
          }),
        }),
      }),
    },
  };
}

test("HTTP surface serves the app, rejects unsafe inputs, and discloses fallback", async () => {
  await withServer(async (base) => {
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).ok, true);
    assert.equal(health.headers.get("x-frame-options"), "DENY");

    const homepage = await fetch(base);
    assert.equal(homepage.status, 200);
    assert.match(await homepage.text(), /Got2Get2Work/i);
    assert.equal(homepage.headers.get("referrer-policy"), "no-referrer");

    const traversal = await fetch(`${base}/..%2Fpackage.json`);
    assert.equal(traversal.status, 404);

    const malformed = await fetch(`${base}/api/agent/parse-schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).code, "INVALID_JSON");

    const schedule = await fetch(`${base}/api/agent/parse-schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Mon-Thu, 7:00 AM-3:30 PM" }),
    });
    assert.equal(schedule.status, 200);
    assert.match((await schedule.json()).fallbackReason, /unavailable/i);
  });
});

test("HTTP surface rate limits repeated agent calls", async () => {
  await withServer(async (base) => {
    const request = () => fetch(`${base}/api/agent/parse-schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "spoofed, 198.51.100.20, 192.0.2.1" },
      body: "{",
    });
    for (let index = 0; index < 20; index += 1) {
      assert.equal((await request()).status, 400);
    }
    const blocked = await request();
    assert.equal(blocked.status, 429);
    assert.equal(blocked.headers.get("retry-after"), "60");
    assert.equal((await blocked.json()).code, "RATE_LIMITED");
  });
});

test("employer coordinator returns an auditable, human-reviewed execution record", async () => {
  const priorKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    await withServer(async (base) => {
      const response = await fetch(`${base}/api/agent/site-coordinator`, {
        method: "POST",
        headers: { Authorization: "Bearer signed-token", "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics: {
            eligibleEmployees: 180,
            enrolledEmployees: 72,
            activeCarpools: 24,
            protectedShifts: 118,
            successfulRecoveries: 17,
            recoveryAttempts: 20,
            estimatedAvoidedAbsences: 18,
            valuePerAvoidedAbsence: 300,
            monthlyPlatformFee: 1200,
            monthlySubsidyBudget: 1600,
          },
        }),
      });
      assert.equal(response.status, 200);
      const result = await response.json();
      assert.equal(result.source, "fallback");
      assert.equal(result.execution.humanApprovalRequired, true);
      assert.match(result.execution.decisionId, /^[0-9a-f-]{36}$/i);
      assert.ok(Date.parse(result.execution.generatedAt));
      assert.deepEqual(result.factIds, ["protectedShifts", "successfulRecoveries", "recoveryAttempts", "monthlySubsidyBudget"]);
    }, { firebaseServices: employerServices() });
  } finally {
    if (priorKey) process.env.GEMINI_API_KEY = priorKey;
  }
});
