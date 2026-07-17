import { MatchExplanation, MatchFact, ScheduleParseResult } from "../domain/models";

export interface ExplainMatchInput {
  reasonCodes: string[];
  facts: MatchFact[];
}

export interface CommuteGateway {
  parseSchedule(text: string): Promise<ScheduleParseResult>;
  explainMatch(input: ExplainMatchInput): Promise<MatchExplanation>;
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;
