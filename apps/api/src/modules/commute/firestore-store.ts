import type { Firestore } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import type { CommuteProfileRecord, ShiftRecord } from "./domain";
import type { CommuteStore } from "./ports";
const date = (v: Timestamp | Date) => v instanceof Date ? v : v.toDate();
export class FirestoreCommuteStore implements CommuteStore {
  constructor(private readonly db: Firestore) {}
  async getProfile(uid: string) { const s = await this.db.collection("commuteProfiles").doc(uid).get(); if (!s.exists) return null; const v = s.data()!; return { ...v, uid: s.id, updatedAt: date(v.updatedAt) } as CommuteProfileRecord; }
  async saveProfile(record: CommuteProfileRecord) { await this.db.collection("commuteProfiles").doc(record.uid).set({ ...record, updatedAt: Timestamp.fromDate(record.updatedAt) }); return record; }
  async listShifts(uid: string) { const s = await this.db.collection("shifts").where("uid", "==", uid).get(); return s.docs.map((d) => { const v = d.data(); return { ...v, id: d.id, updatedAt: date(v.updatedAt) } as ShiftRecord; }); }
  async saveShift(record: ShiftRecord) { await this.db.collection("shifts").doc(record.id).set({ ...record, updatedAt: Timestamp.fromDate(record.updatedAt) }); return record; }
  async getShift(id: string) { const s = await this.db.collection("shifts").doc(id).get(); if (!s.exists) return null; const v = s.data()!; return { ...v, id: s.id, updatedAt: date(v.updatedAt) } as ShiftRecord; }
}
