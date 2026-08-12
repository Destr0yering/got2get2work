import type { AgreementKind } from "../../../../../packages/contracts/src";

export interface AgreementVersionRecord {
  id: string;
  kind: AgreementKind;
  version: string;
  title: string;
  documentUrl: string;
  effectiveAt: Date;
  retiredAt: Date | null;
  required: boolean;
}

export interface AgreementAcceptanceRecord {
  id: string;
  uid: string;
  tenantId: string;
  agreementId: string;
  kind: AgreementKind;
  version: string;
  acceptedAt: Date;
  appVersion: string | null;
  userAgent: string | null;
}

export interface CaptainAttestationRecord {
  id: string;
  uid: string;
  tenantId: string;
  worksiteId: string;
  licenseValidThrough: Date;
  registrationValidThrough: Date;
  insuranceValidThrough: Date;
  vehicleSafe: true;
  conductAcknowledged: true;
  noImpairmentAcknowledged: true;
  informationAccurate: true;
  submittedAt: Date;
}

export class AgreementError extends Error {
  constructor(message: string, readonly code: string, readonly statusCode: number) {
    super(message);
    this.name = "AgreementError";
  }
}
