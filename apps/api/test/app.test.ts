import assert from "node:assert/strict";
import test from "node:test";

import { buildApi } from "../src/app";
import type { ApiConfig } from "../src/config";

const config: ApiConfig = {
  environment: "test",
  host: "127.0.0.1",
  port: 4100,
  release: "test-release",
  exposeDocumentation: true,
  firebase: {
    apiKey: null,
    authDomain: null,
    projectId: "test-project",
    appId: null,
  },
};

test("typed API exposes versioned health and public configuration", async () => {
  const app = await buildApi({ config, logger: false, now: () => new Date("2026-08-12T12:00:00.000Z") });
  try {
    const live = await app.inject({ method: "GET", url: "/health/live" });
    assert.equal(live.statusCode, 200);
    assert.deepEqual(live.json(), {
      ok: true,
      service: "got2get2work-api",
      release: "test-release",
      timestamp: "2026-08-12T12:00:00.000Z",
    });
    assert.equal(live.headers["x-frame-options"], "DENY");

    const publicConfig = await app.inject({ method: "GET", url: "/v1/config" });
    assert.equal(publicConfig.statusCode, 200);
    assert.equal(publicConfig.json().environment, "test");
    assert.equal(publicConfig.json().firebase.projectId, "test-project");
  } finally {
    await app.close();
  }
});

test("OpenAPI documents the versioned system endpoints", async () => {
  const app = await buildApi({ config, logger: false });
  try {
    await app.ready();
    const document = app.swagger();
    assert.equal(document.info.title, "Got2Get2Work API");
    assert.ok(document.paths);
    assert.ok(document.paths?.["/health/live"]);
    assert.ok(document.paths?.["/health/ready"]);
    assert.ok(document.paths?.["/v1/config"]);
  } finally {
    await app.close();
  }
});

test("production does not expose interactive API documentation by default", async () => {
  const app = await buildApi({
    config: { ...config, environment: "production", exposeDocumentation: false },
    logger: false,
  });
  try {
    const response = await app.inject({ method: "GET", url: "/documentation" });
    assert.equal(response.statusCode, 404);
  } finally {
    await app.close();
  }
});
