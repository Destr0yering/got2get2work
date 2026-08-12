import type { AuditRecord, MembershipRecord, ReferralCodeRecord } from "./domain";
import { MembershipError } from "./domain";
import type { MembershipStore, ReferralSeedStore } from "./ports";

export class MemoryMembershipStore implements MembershipStore, ReferralSeedStore {
  readonly referrals = new Map<string, ReferralCodeRecord>();
  readonly memberships = new Map<string, MembershipRecord>();
  readonly audits: AuditRecord[] = [];

  async putReferral(record: ReferralCodeRecord) {
    this.referrals.set(record.digest, structuredClone(record));
  }

  async createReferral(record: ReferralCodeRecord, audit: AuditRecord) {
    if (this.referrals.has(record.digest)) throw new MembershipError("Referral code already exists.", "REFERRAL_CONFLICT", 409);
    this.referrals.set(record.digest, structuredClone(record));
    this.audits.push(structuredClone(audit));
  }

  async redeemReferral(input: { digest: string; user: { uid: string; email: string }; now: Date }) {
    const existing = this.memberships.get(input.user.uid);
    if (existing) return structuredClone(existing);
    const referral = this.referrals.get(input.digest);
    if (!referral || referral.revokedAt || referral.expiresAt <= input.now || referral.useCount >= referral.maxUses) {
      throw new MembershipError("That referral code is invalid or unavailable.", "INVALID_REFERRAL_CODE", 403);
    }
    referral.useCount += 1;
    const membership: MembershipRecord = {
      id: input.user.uid,
      uid: input.user.uid,
      email: input.user.email,
      tenantId: referral.tenantId,
      worksiteId: referral.worksiteId,
      role: "worker",
      status: "pending_approval",
      referralCodeId: referral.id,
      submittedAt: input.now,
    };
    this.memberships.set(membership.id, membership);
    return structuredClone(membership);
  }

  async getMembershipForUser(uid: string) {
    const membership = this.memberships.get(uid);
    return membership ? structuredClone(membership) : null;
  }

  async getMembershipById(id: string) {
    const membership = this.memberships.get(id);
    return membership ? structuredClone(membership) : null;
  }

  async listMemberships(input: { tenantId: string; worksiteId: string; status: MembershipRecord["status"]; limit: number }) {
    return [...this.memberships.values()]
      .filter((item) => item.tenantId === input.tenantId && item.worksiteId === input.worksiteId && item.status === input.status)
      .slice(0, input.limit)
      .map((item) => structuredClone(item));
  }

  async decideMembership(input: {
    membershipId: string;
    tenantId: string;
    worksiteId: string;
    status: "active" | "rejected";
    actorId: string;
    reason: string;
    now: Date;
    audit: AuditRecord;
  }) {
    const membership = this.memberships.get(input.membershipId);
    if (!membership || membership.tenantId !== input.tenantId || membership.worksiteId !== input.worksiteId) {
      throw new MembershipError("That membership was not found.", "MEMBERSHIP_NOT_FOUND", 404);
    }
    if (membership.status !== "pending_approval") {
      throw new MembershipError("That membership has already been decided.", "MEMBERSHIP_ALREADY_DECIDED", 409);
    }
    Object.assign(membership, {
      status: input.status,
      decidedAt: input.now,
      decidedBy: input.actorId,
      decisionReason: input.reason,
    });
    this.audits.push(structuredClone(input.audit));
    return structuredClone(membership);
  }
}
