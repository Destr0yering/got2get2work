import { randomUUID } from "node:crypto";

import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

function argument(name: string): string {
  const index = process.argv.indexOf(`--${name}`);
  const value = index >= 0 ? process.argv[index + 1]?.trim() : "";
  if (!value || value.startsWith("--") || value.length > 128) throw new Error(`A valid --${name} value is required.`);
  return value;
}

async function main() {
  const email = argument("email").toLowerCase();
  const tenantId = argument("tenant");
  const worksiteId = argument("worksite");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("A valid administrator email is required.");
  if (!getApps().length) initializeApp({ credential: applicationDefault() });
  const user = await getAuth().getUserByEmail(email);
  if (!user.emailVerified) throw new Error("The Firebase account email must be verified before administrator bootstrap.");
  const db = getFirestore();
  const membershipRef = db.collection("memberships").doc(user.uid);
  const auditRef = db.collection("auditEvents").doc(randomUUID());
  const now = Timestamp.now();
  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(membershipRef);
    if (existing.exists) {
      const value = existing.data();
      if (value?.role === "employer_admin" && value?.status === "active" && value?.tenantId === tenantId && value?.worksiteId === worksiteId) return;
      throw new Error("A different membership already exists for this Firebase account; no changes were made.");
    }
    transaction.create(membershipRef, {
      uid: user.uid, email, tenantId, worksiteId, role: "employer_admin", status: "active",
      referralCodeId: "operator-bootstrap", submittedAt: now, decidedAt: now,
      decidedBy: "operator-bootstrap", decisionReason: "Initial employer administrator bootstrap",
    });
    transaction.create(auditRef, {
      id: auditRef.id, tenantId, actorId: "operator-bootstrap", action: "membership.admin_bootstrapped",
      resourceType: "membership", resourceId: user.uid, reason: "Initial employer administrator bootstrap", occurredAt: now,
    });
  });
  process.stdout.write(`Employer administrator bootstrapped for ${email} (${user.uid}).\n`);
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Administrator bootstrap failed."}\n`);
  process.exitCode = 1;
});
