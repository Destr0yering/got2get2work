import { Type, type Static } from "@sinclair/typebox";

export const AgreementKindSchema = Type.Union([
  Type.Literal("terms"),
  Type.Literal("privacy"),
  Type.Literal("captain"),
]);

export const AgreementVersionSchema = Type.Object({
  id: Type.String({ minLength: 1, maxLength: 128 }),
  kind: AgreementKindSchema,
  version: Type.String({ minLength: 1, maxLength: 40 }),
  title: Type.String({ minLength: 1, maxLength: 160 }),
  documentUrl: Type.String({ minLength: 1, maxLength: 500 }),
  effectiveAt: Type.String({ format: "date-time" }),
  required: Type.Boolean(),
  accepted: Type.Boolean(),
});

export const RequiredAgreementsSchema = Type.Object({
  agreements: Type.Array(AgreementVersionSchema, { maxItems: 10 }),
});

export const AcceptAgreementBodySchema = Type.Object({
  acknowledged: Type.Literal(true),
});

export const AgreementAcceptanceSchema = Type.Object({
  id: Type.String({ minLength: 1, maxLength: 128 }),
  agreementId: Type.String({ minLength: 1, maxLength: 128 }),
  kind: AgreementKindSchema,
  version: Type.String({ minLength: 1, maxLength: 40 }),
  acceptedAt: Type.String({ format: "date-time" }),
});

export const CaptainAttestationBodySchema = Type.Object({
  licenseValidThrough: Type.String({ format: "date" }),
  registrationValidThrough: Type.String({ format: "date" }),
  insuranceValidThrough: Type.String({ format: "date" }),
  vehicleSafe: Type.Literal(true),
  conductAcknowledged: Type.Literal(true),
  noImpairmentAcknowledged: Type.Literal(true),
  informationAccurate: Type.Literal(true),
});

export const CaptainEligibilitySchema = Type.Object({
  eligible: Type.Boolean(),
  missingAgreementKinds: Type.Array(AgreementKindSchema, { maxItems: 3 }),
  expiredQualifications: Type.Array(Type.Union([
    Type.Literal("license"),
    Type.Literal("registration"),
    Type.Literal("insurance"),
  ]), { maxItems: 3 }),
  attestationCurrent: Type.Boolean(),
});

export type AgreementKind = Static<typeof AgreementKindSchema>;
export type AgreementVersionView = Static<typeof AgreementVersionSchema>;
export type CaptainAttestationBody = Static<typeof CaptainAttestationBodySchema>;
export type CaptainEligibility = Static<typeof CaptainEligibilitySchema>;
