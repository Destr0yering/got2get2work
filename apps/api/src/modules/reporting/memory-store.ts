import type { IncentiveRecord, ReportingStore } from "./ports";
export class MemoryReportingStore implements ReportingStore { completions={responses:0,shiftsProtected:0}; incentives:IncentiveRecord[]=[]; async countCompletions(){return {...this.completions};} async recordIncentive(v:IncentiveRecord){this.incentives.push(structuredClone(v));} }
