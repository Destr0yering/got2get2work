import { createHash } from "node:crypto";

import type { MembershipRole, MembershipStatus } from "../../../../../packages/contracts/src";

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  authenticatedAt?: Date | null;
  secondFactorVerified?: boolean;
}

export interface RequestIdentity extends AuthenticatedUser {
  membershipId: string;
  tenantId: string;
  worksiteId: string;
  role: MembershipRole;
}

export interface ReferralCodeRecord {
  id: string;
  digest: string;
  tenantId: string;
  worksiteId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  maxUses: number;
  useCount: number;
}

export interface MembershipRecord {
  id: string;
  uid: string;
  email: string;
  tenantId: string;
  worksiteId: string;
  role: MembershipRole;
  status: MembershipStatus;
  referralCodeId: string;
  submittedAt: Date;
  decidedAt?: Date;
  decidedBy?: string;
  decisionReason?: string;
}

export interface AuditRecord {
  id: string;
  tenantId: string;
  actorId: string;
  action: string;
  resourceType: "membership" | "referral_code";
  resourceId: string;
  reason?: string;
  occurredAt: Date;
}

export class MembershipError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "MembershipError";
  }
}

export function referralDigest(code: string, pepper: string): string {
  const normalized = code.trim().toUpperCase();
  if (normalized.length < 12 || normalized.length > 128) {
    throw new MembershipError("That referral code is not valid.", "INVALID_REFERRAL_CODE", 400);
  }
  if (pepper.length < 16) throw new Error("REFERRAL_CODE_PEPPER must be at least 16 characters.");
  return createHash("sha256").update(`${pepper}:${normalized}`).digest("hex");
}
