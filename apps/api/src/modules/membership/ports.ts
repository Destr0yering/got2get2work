import type { MembershipStatus } from "../../../../../packages/contracts/src";
import type { AuditRecord, MembershipRecord, ReferralCodeRecord } from "./domain";

export interface MembershipStore {
  createReferral(record: ReferralCodeRecord, audit: AuditRecord): Promise<void>;
  redeemReferral(input: {
    digest: string;
    user: { uid: string; email: string };
    now: Date;
  }): Promise<MembershipRecord>;
  getMembershipForUser(uid: string): Promise<MembershipRecord | null>;
  getMembershipById(id: string): Promise<MembershipRecord | null>;
  listMemberships(input: {
    tenantId: string;
    worksiteId: string;
    status: MembershipStatus;
    limit: number;
  }): Promise<MembershipRecord[]>;
  decideMembership(input: {
    membershipId: string;
    tenantId: string;
    worksiteId: string;
    status: "active" | "rejected";
    actorId: string;
    reason: string;
    now: Date;
    audit: AuditRecord;
  }): Promise<MembershipRecord>;
}

export interface FirebaseTokenVerifier {
  verifyIdToken(token: string, checkRevoked: boolean): Promise<{
    uid: string;
    email?: string;
    email_verified?: boolean;
  }>;
}

export interface ReferralSeedStore {
  putReferral(record: ReferralCodeRecord): Promise<void>;
}
