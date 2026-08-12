import type { CommuteProfileRecord, ShiftRecord } from "./domain";
import type { CommuteStore } from "./ports";
export class MemoryCommuteStore implements CommuteStore {
  readonly profiles = new Map<string, CommuteProfileRecord>(); readonly shifts = new Map<string, ShiftRecord>();
  async getProfile(uid: string) { const value = this.profiles.get(uid); return value ? structuredClone(value) : null; }
  async saveProfile(record: CommuteProfileRecord) { this.profiles.set(record.uid, structuredClone(record)); return structuredClone(record); }
  async listShifts(uid: string) { return [...this.shifts.values()].filter((v) => v.uid === uid).map((v) => structuredClone(v)); }
  async saveShift(record: ShiftRecord) { this.shifts.set(record.id, structuredClone(record)); return structuredClone(record); }
  async getShift(id: string) { const value = this.shifts.get(id); return value ? structuredClone(value) : null; }
}
