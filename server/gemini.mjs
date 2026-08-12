import { GoogleGenAI } from "@google/genai";
import { sanitizeEmployerMetrics, sanitizeMatchFacts, sanitizeScheduleProjectionForOpenAI } from "./privacy.mjs";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const PROVIDER_TIMEOUT_MS = Number(process.env.PROVIDER_TIMEOUT_MS || 10_000);
const ALLOWED_FACT_IDS = new Set([
  "eligibleEmployees", "enrolledEmployees", "activeCarpools", "protectedShifts",
  "successfulRecoveries", "recoveryAttempts", "estimatedAvoidedAbsences",
  "valuePerAvoidedAbsence", "monthlyPlatformFee", "monthlySubsidyBudget",
]);
const RECOMMENDATIONS = {
  EXPAND_BACKUP_DRIVER_POOL: "Recruit more opted-in backup drivers before expanding ride credits or eligibility.",
  FOCUS_ON_PROTECTED_SHIFTS: "Keep the pilot focused on the shifts producing the most protected commutes and review aggregate recovery coverage.",
  HOLD_PILOT_STEADY: "Keep the current pilot scope steady while the site coordinator reviews aggregate participation and recovery patterns.",
  REVIEW_SUBSIDY_ALLOCATION: "Review the aggregate subsidy allocation before changing the pilot scope, without making employee-level assumptions.",
};

export function renderRecommendation(code) {
  const recommendation = RECOMMENDATIONS[code];
  if (!recommendation) throw new Error("Gemini returned an unsupported recommendation code.");
  return recommendation;
}

export function isLiveGeminiConfigured() {
  return Boolean(
    process.env.GEMINI_API_KEY ||
    (process.env.GOOGLE_GENAI_USE_VERTEXAI === "true" && process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION)
  );
}

export function geminiProvider() {
  return process.env.GOOGLE_GENAI_USE_VERTEXAI === "true" ? "vertex-ai" : "gemini-developer-api";
}

function createGeminiClient() {
  if (process.env.GOOGLE_GENAI_USE_VERTEXAI === "true") {
    if (!process.env.GOOGLE_CLOUD_PROJECT || !process.env.GOOGLE_CLOUD_LOCATION) {
      throw new Error("Vertex AI requires GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION.");
    }
    return new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION,
    });
  }
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured.");
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

async function generateStructured({ contents, systemInstruction, schema }) {
  const response = await createGeminiClient().models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseJsonSchema: schema,
      httpOptions: { timeout: PROVIDER_TIMEOUT_MS },
    },
  });
  return JSON.parse(response.text);
}

export async function createSiteBriefWithGemini(value) {
  const projection = sanitizeEmployerMetrics(value?.metrics ?? value);
  const result = await generateStructured({
    contents: JSON.stringify(projection),
    systemInstruction: [
        "You are a commute-benefit site coordinator.",
        "Use only the supplied aggregate pilot metrics; never infer employee identities, attendance, routes, protected traits, or exact locations.",
        "Return JSON with recommendationCode (one exact allowed action code) and factIds (2-5 exact metric keys used).",
        "Do not claim causal ROI or measured customer outcomes. Describe all economics as estimates.",
        "You cannot contact employees, change eligibility, spend funds, or promise transportation.",
      ].join(" "),
    schema: {
        type: "object",
        additionalProperties: false,
        required: ["recommendationCode", "factIds"],
        properties: {
          recommendationCode: { type: "string", enum: Object.keys(RECOMMENDATIONS) },
          factIds: {
            type: "array",
            minItems: 2,
            maxItems: 5,
            items: { type: "string", enum: [...ALLOWED_FACT_IDS] },
          },
        },
      },
  });
  const factIds = result.factIds.filter((id) => ALLOWED_FACT_IDS.has(id));
  if (factIds.length < 2) {
    throw new Error("Gemini response was not grounded in aggregate facts.");
  }
  return {
    source: "gemini",
    provider: geminiProvider(),
    model: MODEL,
    recommendationCode: result.recommendationCode,
    recommendation: renderRecommendation(result.recommendationCode),
    factIds,
  };
}

export async function parseScheduleWithGemini(projection) {
  const safeProjection = sanitizeScheduleProjectionForOpenAI(projection);
  const result = await generateStructured({
    contents: JSON.stringify(safeProjection),
    systemInstruction: "Normalize this server-generated recurring work schedule for user review. Copy only supplied weekdays and 24-hour times. Use Verified workplace and local workplace time. Never invent dates, addresses, people, or transportation promises.",
    schema: {
      type: "object", additionalProperties: false,
      required: ["summary", "worksiteLabel", "timezoneAssumption", "shifts"],
      properties: {
        summary: { type: "string" }, worksiteLabel: { type: "string" }, timezoneAssumption: { type: "string" },
        shifts: { type: "array", minItems: 1, maxItems: 14, items: { type: "object", additionalProperties: false, required: ["day", "startTime", "endTime"], properties: { day: { type: "string", enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] }, startTime: { type: "string" }, endTime: { type: "string" } } } },
      },
    },
  });
  return { source: "gemini", provider: geminiProvider(), model: MODEL, ...result };
}

export async function explainMatchWithGemini(reasonCodes, facts) {
  const safeMatch = sanitizeMatchFacts(reasonCodes, facts);
  const result = await generateStructured({
    contents: JSON.stringify(safeMatch),
    systemInstruction: "Explain an already-computed coworker commute option using only supplied reason codes and facts. Do not infer safety, identity, exact location, feasibility, or guarantees. Call the displayed amount a suggested trip value. Say both coworkers decide and transportation is not guaranteed. factIdsUsed must be a subset of supplied reason codes.",
    schema: {
      type: "object", additionalProperties: false,
      required: ["headline", "summary", "bullets", "caveat", "factIdsUsed"],
      properties: {
        headline: { type: "string" }, summary: { type: "string" },
        bullets: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
        caveat: { type: "string" }, factIdsUsed: { type: "array", minItems: 1, items: { type: "string" } },
      },
    },
  });
  const allowed = new Set(safeMatch.reasonCodes);
  result.factIdsUsed = result.factIdsUsed.filter((id) => allowed.has(id));
  if (!result.factIdsUsed.length) throw new Error("Gemini explanation was not grounded in supplied fact IDs.");
  return { source: "gemini", provider: geminiProvider(), model: MODEL, explanation: result };
}
