import assert from "node:assert/strict";
import test from "node:test";

import { createRateLimiter, requestClientId } from "./rateLimit.mjs";

test("rate limiter blocks requests over the per-window quota and then resets", () => {
  let timestamp = 1_000;
  const limiter = createRateLimiter({ limit: 2, windowMs: 1_000, now: () => timestamp });

  assert.equal(limiter.check("client-a").allowed, true);
  assert.equal(limiter.check("client-a").allowed, true);
  const blocked = limiter.check("client-a");
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 1);

  timestamp = 2_001;
  assert.equal(limiter.check("client-a").allowed, true);
});

test("rate limiter isolates clients", () => {
  const limiter = createRateLimiter({ limit: 1 });
  assert.equal(limiter.check("client-a").allowed, true);
  assert.equal(limiter.check("client-a").allowed, false);
  assert.equal(limiter.check("client-b").allowed, true);
});

test("client id ignores all spoofable forwarding entries", () => {
  const request = {
    headers: { "x-forwarded-for": `spoofed, ${"1".repeat(200)}, 203.0.113.10` },
    socket: { remoteAddress: "127.0.0.1" },
  };
  assert.equal(requestClientId(request), "127.0.0.1");
  request.headers["x-forwarded-for"] = "198.51.100.9";
  assert.equal(requestClientId(request), "127.0.0.1");
});
