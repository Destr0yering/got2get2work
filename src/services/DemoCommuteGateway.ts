import { MatchExplanation, ScheduleParseResult } from "../domain/models";
import { parseLocalSchedule } from "../domain/schedule";
import { CommuteGateway, ExplainMatchInput } from "./CommuteGateway";

function pause(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

export class DemoCommuteGateway implements CommuteGateway {
  constructor(private readonly delayMs = 360) {}

  async parseSchedule(text: string): Promise<ScheduleParseResult> {
    await pause(this.delayMs);
    if (!text.trim()) throw new Error("Paste or type a schedule first.");
    return parseLocalSchedule(text);
  }

  async explainMatch(input: ExplainMatchInput): Promise<MatchExplanation> {
    await pause(this.delayMs);
    const bullets = input.facts.slice(0, 4).map((fact) => fact.value);
    return {
      source: "demo",
      message: "Jordan is the strongest seeded fit because both commute windows and the validated route facts line up without a large detour.",
      bullets,
      reasonCodes: input.reasonCodes
    };
  }
}
