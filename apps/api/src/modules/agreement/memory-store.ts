import type { AgreementAcceptanceRecord, AgreementVersionRecord, CaptainAttestationRecord } from "./domain";
import type { AgreementSeedStore, AgreementStore } from "./ports";

export class MemoryAgreementStore implements AgreementStore, AgreementSeedStore {
  readonly agreements = new Map<string, AgreementVersionRecord>();
  readonly acceptances: AgreementAcceptanceRecord[] = [];
  readonly attestations = new Map<string, CaptainAttestationRecord>();

  async putAgreement(record: AgreementVersionRecord) {
    this.agreements.set(record.id, structuredClone(record));
  }

  async listCurrentAgreements(now: Date) {
    return [...this.agreements.values()]
      .filter((item) => item.effectiveAt <= now && (!item.retiredAt || item.retiredAt > now))
      .map((item) => structuredClone(item));
  }

  async getAgreement(id: string) {
    const item = this.agreements.get(id);
    return item ? structuredClone(item) : null;
  }

  async listAcceptances(uid: string) {
    return this.acceptances.filter((item) => item.uid === uid).map((item) => structuredClone(item));
  }

  async recordAcceptance(record: AgreementAcceptanceRecord) {
    const existing = this.acceptances.find((item) => item.uid === record.uid && item.agreementId === record.agreementId);
    if (existing) return structuredClone(existing);
    this.acceptances.push(structuredClone(record));
    return structuredClone(record);
  }

  async getCaptainAttestation(uid: string) {
    const item = this.attestations.get(uid);
    return item ? structuredClone(item) : null;
  }

  async saveCaptainAttestation(record: CaptainAttestationRecord) {
    this.attestations.set(record.uid, structuredClone(record));
    return structuredClone(record);
  }
}
