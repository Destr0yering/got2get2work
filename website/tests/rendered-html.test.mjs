import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the production landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Got2Get2Work \| Protect the shift<\/title>/i);
  assert.match(html, /Your shift has a destination/i);
  assert.match(html, /Explore the worker demo/i);
  assert.match(html, /Explore an employer pilot/i);
  assert.match(html, /mutual approval/i);
  assert.match(html, /fictional demo data/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/i);
});

test("server-renders the paid assessment and legal routes", async () => {
  const assessmentResponse = await render("/assessment");
  assert.equal(assessmentResponse.status, 200);
  const assessmentHtml = await assessmentResponse.text();
  assert.match(assessmentHtml, /Shift Commute Resilience Assessment/i);
  assert.match(assessmentHtml, /Reserve the \$199 assessment/i);
  assert.match(assessmentHtml, /after discovery and agreed inputs/i);
  assert.match(assessmentHtml, /href="\/privacy"/i);

  for (const path of ["/privacy", "/terms"]) {
    const response = await render(path);
    assert.equal(response.status, 200, `${path} should render`);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  }
});

test("keeps production metadata, legal routes, and evidence copy aligned", async () => {
  const [page, layout, privacy, terms, assessment, navigation, sitemap, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/terms/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/assessment/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/site-chrome.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /CURRENT PRODUCT DEMONSTRATION/);
  assert.match(page, /Fictional demo data/);
  assert.match(layout, /Got2Get2Work \| Protect the shift/);
  assert.match(layout, /https:\/\/got2get2work\.com/);
  assert.match(privacy, /Privacy/i);
  assert.match(terms, /Terms/i);
  assert.match(assessment, /Reserve the \$199 assessment/);
  assert.match(assessment, /does not operate transportation/i);
  assert.match(navigation, /\/assessment/);
  assert.match(sitemap, /\/assessment/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
