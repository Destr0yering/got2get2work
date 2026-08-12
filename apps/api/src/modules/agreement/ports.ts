import type { AgreementKind } from "../../../../../packages/contracts/src";
import type { AgreementAcceptanceRecord, AgreementVersionRecord, CaptainAttestationRecord } from "./domain";

export interface AgreementStore {
  listCurrentAgreements(now: Date): Promise<AgreementVersionRecord[]>;
  getAgreement(id: string): Promise<AgreementVersionRecord | null>;
  listAcceptances(uid: string): Promise<AgreementAcceptanceRecord[]>;
  recordAcceptance(record: AgreementAcceptanceRecord): Promise<AgreementAcceptanceRecord>;
  getCaptainAttestation(uid: string): Promise<CaptainAttestationRecord | null>;
  saveCaptainAttestation(record: CaptainAttestationRecord): Promise<CaptainAttestationRecord>;
}

export interface AgreementSeedStore {
  putAgreement(record: AgreementVersionRecord): Promise<void>;
}

export const requiredWorkerAgreements: AgreementKind[] = ["terms", "privacy"];
export const requiredCaptainAgreements: AgreementKind[] = ["terms", "privacy", "captain"];
