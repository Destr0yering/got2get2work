import { MatchExplanation, ParsedShift, ScheduleParseResult } from "../domain/models";
import { CommuteGateway, ExplainMatchInput, FetchLike } from "./CommuteGateway";
import { DemoCommuteGateway } from "./DemoCommuteGateway";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : null;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeShifts(value: unknown, defaultWorksite?: string): ParsedShift[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const shifts = value.map((item, index) => {
    const shift = record(item);
    if (!shift) return null;
    const weekday = text(shift.weekday) ?? text(shift.day);
    const startLabel = text(shift.startLabel) ?? text(shift.startTime) ?? text(shift.start);
    const endLabel = text(shift.endLabel) ?? text(shift.endTime) ?? text(shift.end);
    const worksite = text(shift.worksite) ?? text(shift.workplace) ?? defaultWorksite;
    if (!weekday || !startLabel || !endLabel || !worksite) return null;
    return {
      id: text(shift.id) ?? `live-shift-${index}`,
      weekday,
      dateLabel: text(shift.dateLabel) ?? text(shift.date) ?? weekday,
      startLabel,
      endLabel,
      worksite,
      roleLabel: text(shift.roleLabel) ?? text(shift.role) ?? "Employee"
    } satisfies ParsedShift;
  });
  return shifts.every(Boolean) ? shifts as ParsedShift[] : null;
}

function rootPayload(value: unknown) {
  const outer = record(value);
  if (!outer) return null;
  return record(outer.result) ?? record(outer.data) ?? outer;
}

export class HttpCommuteGateway implements CommuteGateway {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchImpl: FetchLike = fetch as FetchLike,
    private readonly fallback: CommuteGateway = new DemoCommuteGateway(),
    private readonly timeoutMs = 4_000
  ) {}

  private async post(path: string, body: unknown) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(`${this.baseUrl.replace(/\/$/, "")}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async parseSchedule(scheduleText: string): Promise<ScheduleParseResult> {
    try {
      const payload = rootPayload(await this.post("/api/agent/parse-schedule", { text: scheduleText }));
      const shifts = normalizeShifts(payload?.shifts, text(payload?.worksiteLabel));
      if (!payload || !shifts) throw new Error("The live response did not contain valid shifts.");
      const isOpenAi = payload.source === "openai";
      return {
        source: isOpenAi ? "live_gpt" : "demo",
        model: isOpenAi ? text(payload.model) ?? "GPT" : undefined,
        fallbackReason: isOpenAi ? undefined : "The server used its deterministic fallback.",
        summary: text(payload.summary) ?? `${shifts.length} shifts structured by the live agent.`,
        shifts
      };
    } catch (reason) {
      const fallback = await this.fallback.parseSchedule(scheduleText);
      return {
        ...fallback,
        source: "demo",
        fallbackReason: reason instanceof Error ? reason.message : "Live agent unavailable"
      };
    }
  }

  async explainMatch(input: ExplainMatchInput): Promise<MatchExplanation> {
    try {
      const payload = rootPayload(await this.post("/api/agent/explain-match", input));
      if (!payload) throw new Error("The live response was empty.");
      const explanation = record(payload.explanation) ?? payload;
      const message = text(explanation.summary) ?? text(explanation.headline) ?? text(explanation.message);
      const bullets = Array.isArray(explanation.bullets) ? explanation.bullets.map(text).filter(Boolean) as string[] : [];
      if (!message) throw new Error("The live response did not contain an explanation.");
      const isOpenAi = payload.source === "openai";
      const caveat = text(explanation.caveat);
      return {
        source: isOpenAi ? "live_gpt" : "demo",
        model: isOpenAi ? text(payload.model) ?? "GPT" : undefined,
        fallbackReason: isOpenAi ? undefined : "The server used its deterministic fallback.",
        message,
        bullets: [...(bullets.length ? bullets : input.facts.map((fact) => fact.value)), ...(caveat ? [caveat] : [])],
        reasonCodes: input.reasonCodes
      };
    } catch (reason) {
      const fallback = await this.fallback.explainMatch(input);
      return {
        ...fallback,
        source: "demo",
        fallbackReason: reason instanceof Error ? reason.message : "Live agent unavailable"
      };
    }
  }
}

export function createCommuteGateway() {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const forceDemo = process.env.EXPO_PUBLIC_DEMO_MODE !== "false";
  if (!baseUrl || forceDemo) return new DemoCommuteGateway();
  return new HttpCommuteGateway(baseUrl);
}
