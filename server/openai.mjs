import { sanitizeMatchFacts, sanitizeScheduleProjectionForOpenAI } from "./privacy.mjs";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-terra";
const PROVIDER_TIMEOUT_MS = Number(process.env.PROVIDER_TIMEOUT_MS || 10_000);

const scheduleSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "worksiteLabel", "timezoneAssumption", "shifts"],
  properties: {
    summary: { type: "string", minLength: 1, maxLength: 160 },
    worksiteLabel: { type: "string", minLength: 1, maxLength: 100 },
    timezoneAssumption: { type: "string", minLength: 1, maxLength: 80 },
    shifts: {
      type: "array",
      minItems: 1,
      maxItems: 14,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "startTime", "endTime"],
        properties: {
          day: { enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
          startTime: { type: "string", pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$" },
          endTime: { type: "string", pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$" },
        },
      },
    },
  },
};

const explanationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "summary", "bullets", "caveat", "factIdsUsed"],
  properties: {
    headline: { type: "string", minLength: 1, maxLength: 80 },
    summary: { type: "string", minLength: 1, maxLength: 260 },
    bullets: { type: "array", minItems: 1, maxItems: 4, items: { type: "string", minLength: 1, maxLength: 140 } },
    caveat: { type: "string", minLength: 1, maxLength: 180 },
    factIdsUsed: { type: "array", minItems: 1, maxItems: 10, items: { type: "string" } },
  },
};

function extractText(response) {
  if (typeof response?.output_text === "string") return response.output_text;
  for (const item of response?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (content?.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  throw new Error("OpenAI returned no structured text output.");
}

async function createStructuredResponse({ instructions, input, name, schema }) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      store: false,
      instructions,
      input,
      max_output_tokens: 900,
      text: {
        format: {
          type: "json_schema",
          name,
          strict: true,
          schema,
        },
      },
    }),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });

  if (!response.ok) {
    const requestId = response.headers.get("x-request-id");
    throw new Error(`OpenAI request failed (${response.status}${requestId ? `, ${requestId}` : ""}).`);
  }

  return JSON.parse(extractText(await response.json()));
}

export function isLiveOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function parseScheduleWithOpenAI(projection) {
  const safeProjection = sanitizeScheduleProjectionForOpenAI(projection);
  const result = await createStructuredResponse({
    name: "got2get2work_schedule",
    schema: scheduleSchema,
    instructions: [
      "You normalize a server-generated recurring schedule projection for user review.",
      "The projection contains only allowlisted weekdays, 24-hour times, and an opaque workplace reference; raw user prose is never provided.",
      "Copy the supplied days and times without changing them, set worksiteLabel to Verified workplace, and use local workplace time.",
      "Never invent dates, addresses, people, credentials, or transportation promises.",
    ].join(" "),
    input: JSON.stringify(safeProjection),
  });

  return { source: "openai", model: MODEL, ...result };
}

export async function explainMatchWithOpenAI(reasonCodes, facts) {
  const safeMatch = sanitizeMatchFacts(reasonCodes, facts);
  const result = await createStructuredResponse({
    name: "got2get2work_match_explanation",
    schema: explanationSchema,
    instructions: [
      "You explain an already-computed coworker commute option.",
      "Use only the supplied reason codes and facts. Do not infer safety, identity, exact location, route feasibility, or guarantees.",
      "Call the displayed amount a suggested trip value.",
      "The caveat must say both coworkers decide and transportation is not guaranteed.",
      "factIdsUsed must be a subset of the supplied reason codes.",
    ].join(" "),
    input: JSON.stringify(safeMatch),
  });

  const allowed = new Set(safeMatch.reasonCodes);
  result.factIdsUsed = result.factIdsUsed.filter((id) => allowed.has(id));
  if (result.factIdsUsed.length === 0) throw new Error("Explanation was not grounded in supplied fact IDs.");
  return { source: "openai", model: MODEL, explanation: result };
}
