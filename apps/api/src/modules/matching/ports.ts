import type { MatchRunRecord } from "./domain";
export interface MatchingStore { isRestricted(tenantId: string, firstUid: string, secondUid: string): Promise<boolean>; saveRun(run: MatchRunRecord): Promise<void>; getRun(id: string): Promise<MatchRunRecord | null>; }
