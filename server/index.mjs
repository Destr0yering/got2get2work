import http from "node:http";
import { URL } from "node:url";
import { fallbackExplanation, fallbackSchedule } from "./fallback.mjs";
import { explainMatchWithOpenAI, isLiveOpenAIConfigured, parseScheduleWithOpenAI } from "./openai.mjs";
import { PrivacyInputError, assertScheduleTextIsSafe, sanitizeMatchFacts, sanitizeScheduleProjectionForOpenAI } from "./privacy.mjs";

const port = Number(process.env.PORT || 4100);
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

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

function writeJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "X-Content-Type-Options": "nosniff",
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
    const live = await parseScheduleWithOpenAI(projection);
    writeJson(response, 200, scheduleForClient({ ...live, worksiteLabel: deterministic.worksiteLabel }));
  } catch (error) {
    writeJson(response, 200, scheduleForClient({ ...deterministic, fallbackReason: "Live GPT-5.6 was unavailable; no sensitive data was sent in the fallback." }));
  }
}

async function handleExplainMatch(request, response) {
  const body = await readJson(request);
  const { reasonCodes, facts } = sanitizeMatchFacts(body.reasonCodes, body.facts);
  try {
    const live = await explainMatchWithOpenAI(reasonCodes, facts);
    writeJson(response, 200, explanationForClient(live));
  } catch (error) {
    const fallback = fallbackExplanation(reasonCodes, facts);
    writeJson(response, 200, explanationForClient({ ...fallback, fallbackReason: "Live GPT-5.6 was unavailable; deterministic facts remain unchanged." }));
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") return writeJson(response, 204, {});
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      return writeJson(response, 200, {
        ok: true,
        service: "commutekind-agent",
        liveOpenAIConfigured: isLiveOpenAIConfigured(),
        model: process.env.OPENAI_MODEL || "gpt-5.6-terra",
      });
    }
    if (request.method === "POST" && url.pathname === "/api/agent/parse-schedule") {
      return await handleParseSchedule(request, response);
    }
    if (request.method === "POST" && url.pathname === "/api/agent/explain-match") {
      return await handleExplainMatch(request, response);
    }
    return writeJson(response, 404, { error: "Not found." });
  } catch (error) {
    if (error instanceof PrivacyInputError) {
      return writeJson(response, 400, { error: error.message, code: error.code });
    }
    return writeJson(response, 500, { error: "The request could not be completed." });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`CommuteKind agent listening on http://127.0.0.1:${port}`);
});
