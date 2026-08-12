import { randomUUID } from "node:crypto";

import type { AgreementKind, AgreementVersionView, CaptainAttestationBody, CaptainEligibility } from "../../../../../packages/contracts/src";
import type { RequestIdentity } from "../membership/domain";
import { AgreementError, type CaptainAttestationRecord } from "./domain";
import type { AgreementStore } from "./ports";
import { requiredCaptainAgreements, requiredWorkerAgreements } from "./ports";

export interface AgreementServiceOptions {
  store: AgreementStore;
  now?: () => Date;
}

function day(value: string, label: string): Date {
  const parsed = new Date(`${value}T23:59:59.999Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
    || !Number.isFinite(parsed.getTime())
    || parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new AgreementError(`${label} must be a valid date.`, "INVALID_ATTESTATION", 400);
  }
  return parsed;
}

export class AgreementService {
  private readonly now: () => Date;

  constructor(private readonly options: AgreementServiceOptions) {
    this.now = options.now ?? (() => new Date());
  }

  async required(identity: RequestIdentity, captain = false): Promise<AgreementVersionView[]> {
    const kinds = captain ? requiredCaptainAgreements : requiredWorkerAgreements;
    const [agreements, acceptances] = await Promise.all([
      this.options.store.listCurrentAgreements(this.now()),
      this.options.store.listAcceptances(identity.uid),
    ]);
    return agreements
      .filter((agreement) => kinds.includes(agreement.kind))
      .map((agreement) => ({
        id: agreement.id,
        kind: agreement.kind,
        version: agreement.version,
        title: agreement.title,
        documentUrl: agreement.documentUrl,
        effectiveAt: agreement.effectiveAt.toISOString(),
        required: agreement.required,
        accepted: acceptances.some((item) => item.agreementId === agreement.id && item.version === agreement.version),
      }));
  }

  async accept(identity: RequestIdentity, agreementId: string, metadata: { appVersion?: string; userAgent?: string }) {
    const agreement = await this.options.store.getAgreement(agreementId);
    const now = this.now();
    if (!agreement || agreement.effectiveAt > now || (agreement.retiredAt && agreement.retiredAt <= now)) {
      throw new AgreementError("That agreement version is not available.", "AGREEMENT_NOT_AVAILABLE", 404);
    }
    const acceptance = await this.options.store.recordAcceptance({
      id: randomUUID(),
      uid: identity.uid,
      tenantId: identity.tenantId,
      agreementId: agreement.id,
      kind: agreement.kind,
      version: agreement.version,
      acceptedAt: now,
      appVersion: metadata.appVersion?.slice(0, 80) || null,
      userAgent: metadata.userAgent?.slice(0, 300) || null,
    });
    return {
      id: acceptance.id,
      agreementId: acceptance.agreementId,
      kind: acceptance.kind,
      version: acceptance.version,
      acceptedAt: acceptance.acceptedAt.toISOString(),
    };
  }

  async attest(identity: RequestIdentity, body: CaptainAttestationBody) {
    const now = this.now();
    const record: CaptainAttestationRecord = {
      id: randomUUID(),
      uid: identity.uid,
      tenantId: identity.tenantId,
      worksiteId: identity.worksiteId,
      licenseValidThrough: day(body.licenseValidThrough, "License validity"),
      registrationValidThrough: day(body.registrationValidThrough, "Registration validity"),
      insuranceValidThrough: day(body.insuranceValidThrough, "Insurance validity"),
      vehicleSafe: true,
      conductAcknowledged: true,
      noImpairmentAcknowledged: true,
      informationAccurate: true,
      submittedAt: now,
    };
    if ([record.licenseValidThrough, record.registrationValidThrough, record.insuranceValidThrough].some((value) => value <= now)) {
      throw new AgreementError("Captain qualifications must be current.", "QUALIFICATION_EXPIRED", 400);
    }
    await this.options.store.saveCaptainAttestation(record);
    return this.eligibility(identity);
  }

  async eligibility(identity: RequestIdentity): Promise<CaptainEligibility> {
    const now = this.now();
    const [agreements, attestation] = await Promise.all([
      this.required(identity, true),
      this.options.store.getCaptainAttestation(identity.uid),
    ]);
    const missingAgreementKinds = agreements.filter((item) => item.required && !item.accepted).map((item) => item.kind);
    const expiredQualifications: CaptainEligibility["expiredQualifications"] = [];
    if (attestation) {
      if (attestation.licenseValidThrough <= now) expiredQualifications.push("license");
      if (attestation.registrationValidThrough <= now) expiredQualifications.push("registration");
      if (attestation.insuranceValidThrough <= now) expiredQualifications.push("insurance");
    }
    const attestationCurrent = Boolean(attestation) && expiredQualifications.length === 0;
    return {
      eligible: missingAgreementKinds.length === 0 && attestationCurrent,
      missingAgreementKinds: [...new Set(missingAgreementKinds)] as AgreementKind[],
      expiredQualifications,
      attestationCurrent,
    };
  }
}
