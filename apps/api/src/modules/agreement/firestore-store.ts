import type { Firestore } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";

import type { AgreementAcceptanceRecord, AgreementVersionRecord, CaptainAttestationRecord } from "./domain";
import type { AgreementStore } from "./ports";

const toDate = (value: Timestamp | Date) => value instanceof Date ? value : value.toDate();

export class FirestoreAgreementStore implements AgreementStore {
  constructor(private readonly db: Firestore) {}

  async listCurrentAgreements(now: Date) {
    const snapshot = await this.db.collection("agreementVersions").where("effectiveAt", "<=", Timestamp.fromDate(now)).get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as FirebaseFirestore.DocumentData & { id: string })
      .filter((item) => !item.retiredAt || toDate(item.retiredAt) > now)
      .map((item) => ({
        id: item.id,
        kind: item.kind,
        version: item.version,
        title: item.title,
        documentUrl: item.documentUrl,
        effectiveAt: toDate(item.effectiveAt),
        retiredAt: item.retiredAt ? toDate(item.retiredAt) : null,
        required: item.required === true,
      }) as AgreementVersionRecord);
  }

  async getAgreement(id: string) {
    const snapshot = await this.db.collection("agreementVersions").doc(id).get();
    if (!snapshot.exists) return null;
    const item = snapshot.data()!;
    return {
      id: snapshot.id,
      kind: item.kind,
      version: item.version,
      title: item.title,
      documentUrl: item.documentUrl,
      effectiveAt: toDate(item.effectiveAt),
      retiredAt: item.retiredAt ? toDate(item.retiredAt) : null,
      required: item.required === true,
    } as AgreementVersionRecord;
  }

  async listAcceptances(uid: string) {
    const snapshot = await this.db.collection("agreementAcceptances").where("uid", "==", uid).get();
    return snapshot.docs.map((doc) => {
      const item = doc.data();
      return { id: doc.id, ...item, acceptedAt: toDate(item.acceptedAt) } as AgreementAcceptanceRecord;
    });
  }

  async recordAcceptance(record: AgreementAcceptanceRecord) {
    const id = `${record.uid}_${record.agreementId}`;
    const reference = this.db.collection("agreementAcceptances").doc(id);
    await this.db.runTransaction(async (transaction) => {
      const existing = await transaction.get(reference);
      if (!existing.exists) transaction.create(reference, { ...record, id, acceptedAt: Timestamp.fromDate(record.acceptedAt) });
    });
    return { ...record, id };
  }

  async getCaptainAttestation(uid: string) {
    const snapshot = await this.db.collection("captainAttestations").doc(uid).get();
    if (!snapshot.exists) return null;
    const item = snapshot.data()!;
    return {
      ...item,
      id: snapshot.id,
      licenseValidThrough: toDate(item.licenseValidThrough),
      registrationValidThrough: toDate(item.registrationValidThrough),
      insuranceValidThrough: toDate(item.insuranceValidThrough),
      submittedAt: toDate(item.submittedAt),
    } as CaptainAttestationRecord;
  }

  async saveCaptainAttestation(record: CaptainAttestationRecord) {
    await this.db.collection("captainAttestations").doc(record.uid).set({
      ...record,
      licenseValidThrough: Timestamp.fromDate(record.licenseValidThrough),
      registrationValidThrough: Timestamp.fromDate(record.registrationValidThrough),
      insuranceValidThrough: Timestamp.fromDate(record.insuranceValidThrough),
      submittedAt: Timestamp.fromDate(record.submittedAt),
    });
    return record;
  }
}
