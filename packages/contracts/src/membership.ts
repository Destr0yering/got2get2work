import { Type, type Static } from "@sinclair/typebox";

export const MembershipRoleSchema = Type.Union([
  Type.Literal("worker"),
  Type.Literal("employer_admin"),
  Type.Literal("moderator"),
  Type.Literal("operator"),
]);

export const MembershipStatusSchema = Type.Union([
  Type.Literal("pending_approval"),
  Type.Literal("active"),
  Type.Literal("rejected"),
  Type.Literal("suspended"),
  Type.Literal("expired"),
  Type.Literal("withdrawn"),
]);

export const MembershipSchema = Type.Object({
  id: Type.String({ minLength: 1, maxLength: 128 }),
  uid: Type.String({ minLength: 1, maxLength: 128 }),
  tenantId: Type.String({ minLength: 1, maxLength: 128 }),
  worksiteId: Type.String({ minLength: 1, maxLength: 128 }),
  role: MembershipRoleSchema,
  status: MembershipStatusSchema,
  submittedAt: Type.String({ format: "date-time" }),
  decidedAt: Type.Optional(Type.String({ format: "date-time" })),
});

export const RedeemReferralBodySchema = Type.Object({
  code: Type.String({ minLength: 12, maxLength: 128 }),
});

export const MembershipDecisionBodySchema = Type.Object({
  reason: Type.String({ minLength: 3, maxLength: 500 }),
});

export const MembershipListSchema = Type.Object({
  memberships: Type.Array(MembershipSchema, { maxItems: 100 }),
});

export const CreateReferralBodySchema = Type.Object({
  expiresAt: Type.String({ format: "date-time" }),
  maxUses: Type.Integer({ minimum: 1, maximum: 500 }),
});

export const CreatedReferralSchema = Type.Object({
  id: Type.String({ minLength: 1, maxLength: 128 }),
  code: Type.String({ minLength: 12, maxLength: 128 }),
  tenantId: Type.String({ minLength: 1, maxLength: 128 }),
  worksiteId: Type.String({ minLength: 1, maxLength: 128 }),
  expiresAt: Type.String({ format: "date-time" }),
  maxUses: Type.Integer({ minimum: 1, maximum: 500 }),
});

export type MembershipRole = Static<typeof MembershipRoleSchema>;
export type MembershipStatus = Static<typeof MembershipStatusSchema>;
export type MembershipView = Static<typeof MembershipSchema>;
export type RedeemReferralBody = Static<typeof RedeemReferralBodySchema>;
export type MembershipDecisionBody = Static<typeof MembershipDecisionBodySchema>;
export type CreateReferralBody = Static<typeof CreateReferralBodySchema>;
