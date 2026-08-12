import type { Firestore } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";

import type { AuditRecord, MembershipRecord, ReferralCodeRecord } from "./domain";
import { MembershipError } from "./domain";
import type { MembershipStore } from "./ports";

function date(value: unknown): Date {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  throw new Error("Stored timestamp is invalid.");
}

function membership(id: string, data: FirebaseFirestore.DocumentData): MembershipRecord {
  return {
    id,
    uid: String(data.uid),
    email: String(data.email),
    tenantId: String(data.tenantId),
    worksiteId: String(data.worksiteId),
    role: data.role,
    status: data.status,
    referralCodeId: String(data.referralCodeId),
    submittedAt: date(data.submittedAt),
    ...(data.decidedAt ? { decidedAt: date(data.decidedAt) } : {}),
    ...(data.decidedBy ? { decidedBy: String(data.decidedBy) } : {}),
    ...(data.decisionReason ? { decisionReason: String(data.decisionReason) } : {}),
  };
}

export class FirestoreMembershipStore implements MembershipStore {
  constructor(private readonly db: Firestore) {}

  async createReferral(record: ReferralCodeRecord, audit: AuditRecord) {
    const batch = this.db.batch();
    batch.create(this.db.collection("referralCodes").doc(record.digest), {
      id: record.id,
      tenantId: record.tenantId,
      worksiteId: record.worksiteId,
      expiresAt: Timestamp.fromDate(record.expiresAt),
      revokedAt: null,
      maxUses: record.maxUses,
      useCount: 0,
    });
    batch.create(this.db.collection("auditEvents").doc(audit.id), {
      ...audit,
      occurredAt: Timestamp.fromDate(audit.occurredAt),
    });
    await batch.commit();
  }

  async redeemReferral(input: { digest: string; user: { uid: string; email: string }; now: Date }) {
    const membershipRef = this.db.collection("memberships").doc(input.user.uid);
    const referralRef = this.db.collection("referralCodes").doc(input.digest);
    return this.db.runTransaction(async (transaction) => {
      const [existing, referralSnapshot] = await Promise.all([
        transaction.get(membershipRef),
        transaction.get(referralRef),
      ]);
      if (existing.exists) return membership(existing.id, existing.data()!);
      if (!referralSnapshot.exists) {
        throw new MembershipError("That referral code is invalid or unavailable.", "INVALID_REFERRAL_CODE", 403);
      }
      const referral = referralSnapshot.data() as ReferralCodeRecord & { expiresAt: Timestamp; revokedAt?: Timestamp };
      if (referral.revokedAt || referral.expiresAt.toDate() <= input.now || referral.useCount >= referral.maxUses) {
        throw new MembershipError("That referral code is invalid or unavailable.", "INVALID_REFERRAL_CODE", 403);
      }
      const record = {
        uid: input.user.uid,
        email: input.user.email,
        tenantId: referral.tenantId,
        worksiteId: referral.worksiteId,
        role: "worker",
        status: "pending_approval",
        referralCodeId: referralSnapshot.id,
        submittedAt: Timestamp.fromDate(input.now),
      };
      transaction.update(referralRef, { useCount: referral.useCount + 1 });
      transaction.create(membershipRef, record);
      return membership(membershipRef.id, record);
    });
  }

  async getMembershipForUser(uid: string) {
    const snapshot = await this.db.collection("memberships").doc(uid).get();
    return snapshot.exists ? membership(snapshot.id, snapshot.data()!) : null;
  }

  async getMembershipById(id: string) {
    return this.getMembershipForUser(id);
  }

  async listMemberships(input: { tenantId: string; worksiteId: string; status: MembershipRecord["status"]; limit: number }) {
    const snapshot = await this.db.collection("memberships")
      .where("tenantId", "==", input.tenantId)
      .where("worksiteId", "==", input.worksiteId)
      .where("status", "==", input.status)
      .limit(input.limit)
      .get();
    return snapshot.docs.map((item) => membership(item.id, item.data()));
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
    const reference = this.db.collection("memberships").doc(input.membershipId);
    return this.db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists) throw new MembershipError("That membership was not found.", "MEMBERSHIP_NOT_FOUND", 404);
      const current = membership(snapshot.id, snapshot.data()!);
      if (current.tenantId !== input.tenantId || current.worksiteId !== input.worksiteId) {
        throw new MembershipError("That membership was not found.", "MEMBERSHIP_NOT_FOUND", 404);
      }
      if (current.status !== "pending_approval") {
        throw new MembershipError("That membership has already been decided.", "MEMBERSHIP_ALREADY_DECIDED", 409);
      }
      const changes = {
        status: input.status,
        decidedAt: Timestamp.fromDate(input.now),
        decidedBy: input.actorId,
        decisionReason: input.reason,
      };
      transaction.update(reference, changes);
      transaction.create(this.db.collection("auditEvents").doc(input.audit.id), {
        ...input.audit,
        occurredAt: Timestamp.fromDate(input.audit.occurredAt),
      });
      return {
        ...current,
        status: input.status,
        decidedAt: input.now,
        decidedBy: input.actorId,
        decisionReason: input.reason,
      };
    });
  }
}
