import type { CommuteProfileRecord, ShiftRecord } from "./domain";
export interface CommuteStore {
  getProfile(uid: string): Promise<CommuteProfileRecord | null>;
  listProfiles(tenantId: string, worksiteId: string): Promise<CommuteProfileRecord[]>;
  saveProfile(record: CommuteProfileRecord): Promise<CommuteProfileRecord>;
  listShifts(uid: string): Promise<ShiftRecord[]>;
  saveShift(record: ShiftRecord): Promise<ShiftRecord>;
  getShift(id: string): Promise<ShiftRecord | null>;
}
