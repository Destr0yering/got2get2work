import http from "node:http";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fallbackExplanation, fallbackSchedule, fallbackSiteBrief } from "./fallback.mjs";
import { explainMatchWithOpenAI, isLiveOpenAIConfigured, parseScheduleWithOpenAI } from "./openai.mjs";
import { createSiteBriefWithGemini, explainMatchWithGemini, geminiProvider, isLiveGeminiConfigured, parseScheduleWithGemini } from "./gemini.mjs";
import { PrivacyInputError, assertScheduleTextIsSafe, sanitizeEmployerMetrics, sanitizeMatchFacts, sanitizeScheduleProjectionForOpenAI } from "./privacy.mjs";
import { createRateLimiter, requestClientId } from "./rateLimit.mjs";
import { createFirebaseServices } from "./firebase.mjs";
import { AuthenticationError, AuthorizationError, authenticateFirebaseUser, authenticateRequest, requireRole } from "./identity.mjs";
import { blockUser, createSafetyReport, deleteAccount, enrollBetaMember, exportAccount, loadAppState, saveAppState, saveConsent } from "./account.mjs";
import { acceptBetaRequest, createBetaRequest, listBetaMatches, listBetaRequests, saveBetaProfile, saveBetaSchedule } from "./beta.mjs";

const port = Number(process.env.PORT || 4100);
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
const requireAgentAuth = process.env.NODE_ENV === "production" || process.env.REQUIRE_AGENT_AUTH === "true";
const agentRateLimiter = createRateLimiter({
  limit: Number(process.env.AGENT_RATE_LIMIT || 20),
  windowMs: Number(process.env.AGENT_RATE_WINDOW_MS || 60_000),
});

const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self' data:; frame-ancestors 'none'; img-src 'self' data: blob:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Frame-Options": "DENY",
};

function logProviderFallback(provider, error) {
  console.warn(JSON.stringify({
    event: "provider_fallback",
    provider,
    errorType: error?.name || "Error",
    timeout: error?.name === "TimeoutError" || error?.name === "AbortError",
  }));
}

function displayTime(value) {
  if (!/^\d{2}:\d{2}$/.test(value ?? "")) return value;
  const [rawHour, minute] = value.split(":").map(Number);
  const suffix = rawHour >= 12 ? "PM" : "AM";
  const hour = rawHour % 12 || 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function scheduleForClient(result) {
  return {
    ...result,
    shifts: result.shifts.map((shift, index) => ({
      ...shift,
      id: `agent-shift-${index + 1}`,
      weekday: shift.day,
      dateLabel: shift.day,
      startLabel: displayTime(shift.startTime),
      endLabel: displayTime(shift.endTime),
      worksite: result.worksiteLabel,
      roleLabel: "Employee",
    })),
  };
}

function explanationForClient(result) {
  return {
    ...result,
    message: result.explanation.summary,
    bullets: result.explanation.bullets,
    reasonCodes: result.explanation.factIdsUsed,
  };
}

function writeJson(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Allow-Methods": "DELETE,GET,POST,OPTIONS",
    "X-Content-Type-Options": "nosniff",
    ...securityHeaders,
    ...extraHeaders,
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 20_000) throw new PrivacyInputError("Request body is too large.", "BODY_TOO_LARGE");
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new PrivacyInputError("Request body must be valid JSON.", "INVALID_JSON");
  }
}

async function handleParseSchedule(request, response) {
  const body = await readJson(request);
  const text = assertScheduleTextIsSafe(body.text);
  const deterministic = fallbackSchedule(text);
  const projection = sanitizeScheduleProjectionForOpenAI(deterministic.shifts);
  try {
    const live = isLiveGeminiConfigured() ? await parseScheduleWithGemini(projection) : await parseScheduleWithOpenAI(projection);
    writeJson(response, 200, scheduleForClient({ ...live, worksiteLabel: deterministic.worksiteLabel }));
  } catch (error) {
    logProviderFallback("gemini_schedule", error);
    writeJson(response, 200, scheduleForClient({ ...deterministic, fallbackReason: "Live Gemini was unavailable; no sensitive data was sent in the fallback." }));
  }
}

async function handleExplainMatch(request, response) {
  const body = await readJson(request);
  const { reasonCodes, facts } = sanitizeMatchFacts(body.reasonCodes, body.facts);
  try {
    const live = isLiveGeminiConfigured() ? await explainMatchWithGemini(reasonCodes, facts) : await explainMatchWithOpenAI(reasonCodes, facts);
    writeJson(response, 200, explanationForClient(live));
  } catch (error) {
    logProviderFallback("gemini_match", error);
    const fallback = fallbackExplanation(reasonCodes, facts);
    writeJson(response, 200, explanationForClient({ ...fallback, fallbackReason: "Live Gemini was unavailable; deterministic facts remain unchanged." }));
  }
}

async function handleSiteCoordinator(request, response, services) {
  const identity = await authenticateRequest(request, services);
  requireRole(identity, "employer_admin");
  const body = await readJson(request);
  const projection = sanitizeEmployerMetrics(body.metrics);
  const execution = {
    decisionId: randomUUID(),
    generatedAt: new Date().toISOString(),
    humanApprovalRequired: true,
  };
  try {
    const live = await createSiteBriefWithGemini(projection);
    console.info(JSON.stringify({
      event: "gemini_operational_decision",
      decisionId: execution.decisionId,
      model: live.model,
      recommendationCode: live.recommendationCode,
      factIds: live.factIds,
      tenantId: identity.tenantId,
      humanApprovalRequired: true,
    }));
    writeJson(response, 200, { ...live, execution });
  } catch (error) {
    logProviderFallback("gemini_coordinator", error);
    writeJson(response, 200, {
      ...fallbackSiteBrief(projection),
      execution,
      fallbackReason: "Live Gemini was unavailable; the aggregate deterministic brief is shown.",
    });
  }
}

const webRoot = path.resolve("dist-web");
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

async function serveWeb(requestPath, response) {
  const decoded = decodeURIComponent(requestPath).replace(/^\/+/, "");
  const relative = decoded === "got2get2work" ? "" : decoded.replace(/^got2get2work\//, "");
  let target = path.resolve(webRoot, relative || "index.html");
  if (target !== webRoot && !target.startsWith(`${webRoot}${path.sep}`)) return false;
  try {
    if ((await stat(target)).isDirectory()) target = path.join(target, "index.html");
  } catch {
    target = path.join(webRoot, "index.html");
  }
  try {
    const body = await readFile(target);
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(target)] || "application/octet-stream",
      "Cache-Control": path.extname(target) === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      ...securityHeaders,
    });
    response.end(body);
    return true;
  } catch {
    return false;
  }
}

export function createAppServer(options = {}) {
  let firebaseServices = options.firebaseServices;
  const services = () => firebaseServices ??= createFirebaseServices();
  return http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") return writeJson(response, 204, {});
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      return writeJson(response, 200, {
        ok: true,
        service: "got2get2work-agent",
        release: process.env.K_REVISION || process.env.RELEASE_SHA || "local",
        providersConfigured: isLiveOpenAIConfigured() || isLiveGeminiConfigured(),
      liveGeminiConfigured: isLiveGeminiConfigured(),
        geminiProvider: isLiveGeminiConfigured() ? geminiProvider() : null,
        liveOpenAIConfigured: isLiveOpenAIConfigured(),
        persistenceConfigured: Boolean(process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_CONFIG),
      });
    }
    if (request.method === "GET" && url.pathname === "/api/config") {
      return writeJson(response, 200, {
        firebase: {
          apiKey: process.env.FIREBASE_WEB_API_KEY || null,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN || null,
          projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || null,
          appId: process.env.FIREBASE_WEB_APP_ID || null,
        },
      });
    }
    if (request.method === "POST" && url.pathname === "/api/beta/enroll") {
      const decoded = await authenticateFirebaseUser(request, services());
      return writeJson(response, 201, await enrollBetaMember(services(), decoded, await readJson(request)));
    }
    if (request.method === "POST" && url.pathname === "/api/beta/profile") {
      const identity = await authenticateRequest(request, services());
      return writeJson(response, 200, await saveBetaProfile(services(), identity, await readJson(request)));
    }
    if (request.method === "POST" && url.pathname === "/api/beta/schedule") {
      const identity = await authenticateRequest(request, services());
      return writeJson(response, 200, await saveBetaSchedule(services(), identity, await readJson(request)));
    }
    if (request.method === "GET" && url.pathname === "/api/beta/matches") {
      const identity = await authenticateRequest(request, services());
      return writeJson(response, 200, await listBetaMatches(services(), identity));
    }
    if (request.method === "GET" && url.pathname === "/api/beta/requests") {
      const identity = await authenticateRequest(request, services());
      return writeJson(response, 200, await listBetaRequests(services(), identity));
    }
    if (request.method === "POST" && url.pathname === "/api/beta/requests") {
      const identity = await authenticateRequest(request, services());
      return writeJson(response, 201, await createBetaRequest(services(), identity, await readJson(request)));
    }
    const acceptRequestMatch = url.pathname.match(/^\/api\/beta\/requests\/([^/]+)\/accept$/);
    if (request.method === "POST" && acceptRequestMatch) {
      const identity = await authenticateRequest(request, services());
      return writeJson(response, 200, await acceptBetaRequest(services(), identity, decodeURIComponent(acceptRequestMatch[1])));
    }
    if (request.method === "GET" && url.pathname === "/api/account/export") {
      const identity = await authenticateRequest(request, services());
      return writeJson(response, 200, await exportAccount(services(), identity), {
        "Content-Disposition": `attachment; filename="got2get2work-export-${identity.uid}.json"`,
      });
    }
    if (request.method === "GET" && url.pathname === "/api/account/state") {
      const identity = await authenticateRequest(request, services());
      return writeJson(response, 200, await loadAppState(services(), identity));
    }
    if (request.method === "POST" && url.pathname === "/api/account/state") {
      const identity = await authenticateRequest(request, services());
      return writeJson(response, 200, await saveAppState(services(), identity, await readJson(request)));
    }
    if (request.method === "POST" && url.pathname === "/api/account/consents") {
      const identity = await authenticateRequest(request, services());
      const body = await readJson(request);
      return writeJson(response, 201, await saveConsent(services(), identity, body, {
        userAgent: request.headers["user-agent"],
      }));
    }
    if (request.method === "POST" && url.pathname === "/api/safety/reports") {
      const identity = await authenticateRequest(request, services());
      const result = await createSafetyReport(services(), identity, await readJson(request));
      console.info(JSON.stringify({ event: "safety_report_created", reportId: result.id, tenantId: identity.tenantId }));
      return writeJson(response, 201, result);
    }
    if (request.method === "POST" && url.pathname === "/api/safety/blocks") {
      const identity = await authenticateRequest(request, services());
      return writeJson(response, 201, await blockUser(services(), identity, await readJson(request)));
    }
    if (request.method === "DELETE" && url.pathname === "/api/account") {
      const identity = await authenticateRequest(request, services());
      return writeJson(response, 200, await deleteAccount(services(), identity, await readJson(request)));
    }
    if (request.method === "POST" && url.pathname.startsWith("/api/agent/")) {
      const rate = agentRateLimiter.check(requestClientId(request));
      if (!rate.allowed) {
        return writeJson(response, 429, {
          error: "Too many agent requests. Please retry shortly.",
          code: "RATE_LIMITED",
        }, {
          "Retry-After": String(rate.retryAfterSeconds),
          "X-RateLimit-Limit": String(rate.limit),
          "X-RateLimit-Remaining": String(rate.remaining),
        });
      }
      if (requireAgentAuth && url.pathname !== "/api/agent/site-coordinator") {
        await authenticateRequest(request, services());
      }
    }
    if (request.method === "POST" && url.pathname === "/api/agent/parse-schedule") {
      return await handleParseSchedule(request, response);
    }
    if (request.method === "POST" && url.pathname === "/api/agent/explain-match") {
      return await handleExplainMatch(request, response);
    }
    if (request.method === "POST" && url.pathname === "/api/agent/site-coordinator") {
      return await handleSiteCoordinator(request, response, services());
    }
    if (request.method === "GET" && await serveWeb(url.pathname, response)) return;
    return writeJson(response, 404, { error: "Not found." });
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      return writeJson(response, error.status, { error: error.message, code: error.code });
    }
    if (error instanceof PrivacyInputError) {
      return writeJson(response, 400, { error: error.message, code: error.code });
    }
    if (error instanceof Error && /required|valid|confirm|under|cannot/i.test(error.message)) {
      return writeJson(response, 400, { error: error.message, code: "INVALID_INPUT" });
    }
    console.error(JSON.stringify({ event: "request_failed", path: url.pathname, errorType: error?.name || "Error" }));
    return writeJson(response, 500, { error: "The request could not be completed." });
  }
  });
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  const server = createAppServer();
  server.listen(port, "0.0.0.0", () => {
    console.log(`Got2Get2Work agent listening on http://0.0.0.0:${port}`);
  });
}
