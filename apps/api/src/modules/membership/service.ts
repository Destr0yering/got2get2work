import { randomBytes, randomUUID } from "node:crypto";

import type { MembershipStatus, MembershipView } from "../../../../../packages/contracts/src";
import { MembershipError, referralDigest, type AuthenticatedUser, type MembershipRecord, type RequestIdentity } from "./domain";
import type { MembershipStore } from "./ports";

export interface MembershipServiceOptions {
  store: MembershipStore;
  referralPepper: string;
  now?: () => Date;
}

function view(record: MembershipRecord): MembershipView {
  return {
    id: record.id,
    uid: record.uid,
    tenantId: record.tenantId,
    worksiteId: record.worksiteId,
    role: record.role,
    status: record.status,
    submittedAt: record.submittedAt.toISOString(),
    ...(record.decidedAt ? { decidedAt: record.decidedAt.toISOString() } : {}),
  };
}

export class MembershipService {
  private readonly now: () => Date;

  constructor(private readonly options: MembershipServiceOptions) {
    this.now = options.now ?? (() => new Date());
  }

  async createReferral(identity: RequestIdentity, expiresAtText: string, maxUses: number) {
    this.requireRole(identity, "employer_admin");
    const expiresAt = new Date(expiresAtText);
    const createdAt = this.now();
    if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 500) {
      throw new MembershipError("Referral use limit must be between 1 and 500.", "INVALID_REFERRAL_POLICY", 400);
    }
    if (!Number.isFinite(expiresAt.getTime()) || expiresAt <= createdAt) {
      throw new MembershipError("Referral expiry must be in the future.", "INVALID_REFERRAL_POLICY", 400);
    }
    const maximumExpiry = new Date(createdAt.getTime() + 90 * 24 * 60 * 60 * 1000);
    if (expiresAt > maximumExpiry) {
      throw new MembershipError("Referral codes may not remain valid for more than 90 days.", "INVALID_REFERRAL_POLICY", 400);
    }
    const code = randomBytes(18).toString("base64url").toUpperCase();
    const id = randomUUID();
    const record = {
      id,
      digest: referralDigest(code, this.options.referralPepper),
      tenantId: identity.tenantId,
      worksiteId: identity.worksiteId,
      expiresAt,
      revokedAt: null,
      maxUses,
      useCount: 0,
    };
    await this.options.store.createReferral(record, {
      id: randomUUID(),
      tenantId: identity.tenantId,
      actorId: identity.uid,
      action: "referral.created",
      resourceType: "referral_code",
      resourceId: id,
      occurredAt: createdAt,
    });
    return { id, code, tenantId: identity.tenantId, worksiteId: identity.worksiteId, expiresAt: expiresAt.toISOString(), maxUses };
  }

  async redeem(code: string, user: AuthenticatedUser): Promise<MembershipView> {
    if (!user.email || !user.emailVerified) {
      throw new MembershipError("A verified email address is required.", "VERIFIED_EMAIL_REQUIRED", 403);
    }
    const membership = await this.options.store.redeemReferral({
      digest: referralDigest(code, this.options.referralPepper),
      user: { uid: user.uid, email: user.email.toLowerCase() },
      now: this.now(),
    });
    return view(membership);
  }

  async identityFor(user: AuthenticatedUser): Promise<RequestIdentity> {
    const membership = await this.options.store.getMembershipForUser(user.uid);
    if (!membership || membership.status !== "active") {
      throw new MembershipError("Your employer membership is not active.", "MEMBERSHIP_INACTIVE", 403);
    }
    return {
      ...user,
      membershipId: membership.id,
      tenantId: membership.tenantId,
      worksiteId: membership.worksiteId,
      role: membership.role,
    };
  }

  async current(identity: RequestIdentity): Promise<MembershipView> {
    const membership = await this.options.store.getMembershipById(identity.membershipId);
    if (!membership || membership.tenantId !== identity.tenantId || membership.uid !== identity.uid) {
      throw new MembershipError("Your employer membership could not be loaded.", "MEMBERSHIP_NOT_FOUND", 404);
    }
    return view(membership);
  }

  async listPending(identity: RequestIdentity, status: MembershipStatus = "pending_approval") {
    this.requireRole(identity, "employer_admin");
    const records = await this.options.store.listMemberships({
      tenantId: identity.tenantId,
      worksiteId: identity.worksiteId,
      status,
      limit: 100,
    });
    return records.map(view);
  }

  async decide(
    identity: RequestIdentity,
    membershipId: string,
    status: "active" | "rejected",
    reason: string,
  ): Promise<MembershipView> {
    this.requireRole(identity, "employer_admin");
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 3 || trimmedReason.length > 500) {
      throw new MembershipError("A decision reason between 3 and 500 characters is required.", "INVALID_REASON", 400);
    }
    const occurredAt = this.now();
    const membership = await this.options.store.decideMembership({
      membershipId,
      tenantId: identity.tenantId,
      worksiteId: identity.worksiteId,
      status,
      actorId: identity.uid,
      reason: trimmedReason,
      now: occurredAt,
      audit: {
        id: randomUUID(),
        tenantId: identity.tenantId,
        actorId: identity.uid,
        action: status === "active" ? "membership.approved" : "membership.rejected",
        resourceType: "membership",
        resourceId: membershipId,
        reason: trimmedReason,
        occurredAt,
      },
    });
    return view(membership);
  }

  requireRole(identity: RequestIdentity, ...roles: RequestIdentity["role"][]) {
    if (!roles.includes(identity.role)) {
      throw new MembershipError("You do not have permission to perform this action.", "FORBIDDEN", 403);
    }
  }
}
