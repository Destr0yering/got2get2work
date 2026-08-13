import { randomUUID, timingSafeEqual } from "node:crypto";
import { AuthorizationError } from "./identity.mjs";

const CONSENT_KINDS = new Set(["terms", "privacy", "schedule", "notifications", "proximity"]);
const REPORT_CATEGORIES = new Set(["safety", "harassment", "no_show", "unsafe_driving", "other"]);

function cleanText(value, max, label) {
  const text = String(value ?? "").trim();
  if (!text || text.length > max) throw new Error(`${label} is required and must be under ${max} characters.`);
  return text;
}

function userRef(services, identity) {
  return services.db.collection("tenants").doc(identity.tenantId).collection("users").doc(identity.uid);
}

function inviteMatches(provided, expected) {
  const left = Buffer.from(String(provided || "").trim());
  const right = Buffer.from(String(expected || "").trim());
  return left.length > 0 && left.length === right.length && timingSafeEqual(left, right);
}

export async function enrollBetaMember(services, decoded, body) {
  const expectedCode = process.env.BETA_INVITE_CODE;
  if (!expectedCode) throw new Error("Beta enrollment is temporarily unavailable.");
  if (!inviteMatches(body.inviteCode, expectedCode)) throw new AuthorizationError("That beta invite code is not valid.", "INVALID_BETA_INVITE");
  if (!decoded.email || decoded.email_verified !== true) throw new AuthorizationError("A verified email address is required.", "VERIFIED_EMAIL_REQUIRED");

  const tenantId = process.env.BETA_TENANT_ID || "galaxy-beta-2026";
  const membershipRef = services.db.collection("memberships").doc(decoded.uid);
  const existing = await membershipRef.get();
  if (existing.exists && existing.data()?.status === "active") {
    return { enrolled: true, tenantId: existing.data().tenantId, role: existing.data().role };
  }
  const membership = {
    uid: decoded.uid,
    email: decoded.email.toLowerCase(),
    tenantId,
    role: "employee",
    status: "active",
    source: "galaxy_closed_beta",
    createdAt: services.serverTimestamp,
  };
  await membershipRef.set(membership);
  await services.db.collection("tenants").doc(tenantId).collection("users").doc(decoded.uid).set({
    email: membership.email,
    betaStatus: "onboarding",
    createdAt: services.serverTimestamp,
    updatedAt: services.serverTimestamp,
  }, { merge: true });
  return { enrolled: true, tenantId, role: "employee" };
}

export async function saveConsent(services, identity, body, metadata = {}) {
  if (!CONSENT_KINDS.has(body.kind) || typeof body.granted !== "boolean") {
    throw new Error("A valid consent kind and granted value are required.");
  }
  const policyVersion = cleanText(body.policyVersion, 40, "Policy version");
  const record = {
    uid: identity.uid,
    tenantId: identity.tenantId,
    kind: body.kind,
    granted: body.granted,
    policyVersion,
    recordedAt: services.serverTimestamp,
    userAgent: String(metadata.userAgent || "").slice(0, 300),
  };
  const id = `${identity.uid}_${body.kind}_${Date.now()}_${randomUUID().slice(0, 8)}`;
  await services.db.collection("consentRecords").doc(id).set(record);
  await userRef(services, identity).set({
    consents: { [body.kind]: { granted: body.granted, policyVersion, recordedAt: services.serverTimestamp } },
    updatedAt: services.serverTimestamp,
  }, { merge: true });
  return { id, kind: body.kind, granted: body.granted, policyVersion };
}

export async function loadAppState(services, identity) {
  const snap = await userRef(services, identity).get();
  return { state: snap.exists ? snap.data()?.appState ?? null : null };
}

export async function saveAppState(services, identity, body) {
  const encoded = JSON.stringify(body.state ?? null);
  if (!body.state || encoded.length > 100_000) throw new Error("App state is required and must be under 100 KB.");
  await userRef(services, identity).set({
    appState: body.state,
    updatedAt: services.serverTimestamp,
  }, { merge: true });
  return { saved: true };
}

export async function createSafetyReport(services, identity, body) {
  const category = String(body.category || "");
  if (!REPORT_CATEGORIES.has(category)) throw new Error("Choose a valid report category.");
  const description = cleanText(body.description, 3000, "Description");
  const reportedUserId = body.reportedUserId ? cleanText(body.reportedUserId, 128, "Reported user") : null;
  if (reportedUserId === identity.uid) throw new Error("You cannot report your own account.");

  if (reportedUserId) {
    const reportedMembership = await services.db.collection("memberships").doc(reportedUserId).get();
    if (!reportedMembership.exists || reportedMembership.data()?.tenantId !== identity.tenantId) {
      throw new AuthorizationError("The reported account is not in your employer benefit.", "CROSS_TENANT_ACCESS");
    }
  }
  const id = randomUUID();
  await services.db.collection("tenants").doc(identity.tenantId).collection("safetyReports").doc(id).set({
    reporterId: identity.uid,
    reportedUserId,
    category,
    description,
    status: "open",
    createdAt: services.serverTimestamp,
  });
  return { id, status: "open" };
}

export async function blockUser(services, identity, body) {
  const blockedUserId = cleanText(body.blockedUserId, 128, "Blocked user");
  if (blockedUserId === identity.uid) throw new Error("You cannot block your own account.");
  const membership = await services.db.collection("memberships").doc(blockedUserId).get();
  if (!membership.exists || membership.data()?.tenantId !== identity.tenantId) {
    throw new AuthorizationError("The account is not in your employer benefit.", "CROSS_TENANT_ACCESS");
  }
  const userIds = [identity.uid, blockedUserId].sort();
  await services.db.collection("tenants").doc(identity.tenantId).collection("matchingRestrictions").doc(userIds.join("__")).set({
    userIds,
    kind: "user_block",
    blockedBy: identity.uid,
    createdAt: services.serverTimestamp,
  });
  return { blockedUserId, blocked: true };
}

export async function exportAccount(services, identity) {
  const [profile, consents, restrictions, reports] = await Promise.all([
    userRef(services, identity).get(),
    services.db.collection("consentRecords").where("uid", "==", identity.uid).get(),
    services.db.collection("tenants").doc(identity.tenantId).collection("matchingRestrictions").where("userIds", "array-contains", identity.uid).get(),
    services.db.collection("tenants").doc(identity.tenantId).collection("safetyReports").where("reporterId", "==", identity.uid).get(),
  ]);
  const serialize = (snap) => snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return {
    generatedAt: new Date().toISOString(),
    account: { uid: identity.uid, email: identity.email, tenantId: identity.tenantId, role: identity.role },
    profile: profile.exists ? profile.data() : null,
    consents: serialize(consents),
    blocks: serialize(restrictions),
    safetyReports: serialize(reports),
  };
}

export async function deleteAccount(services, identity, body) {
  if (body.confirmation !== "DELETE") throw new Error('Type "DELETE" to confirm account deletion.');
  const root = userRef(services, identity);
  const [restrictions, consents, reports] = await Promise.all([
    services.db.collection("tenants").doc(identity.tenantId).collection("matchingRestrictions").where("userIds", "array-contains", identity.uid).get(),
    services.db.collection("consentRecords").where("uid", "==", identity.uid).get(),
    services.db.collection("tenants").doc(identity.tenantId).collection("safetyReports").where("reporterId", "==", identity.uid).get(),
  ]);
  const batch = services.db.batch();
  for (const doc of restrictions.docs) batch.delete(doc.ref);
  for (const doc of consents.docs) batch.delete(doc.ref);
  for (const doc of reports.docs) batch.update(doc.ref, {
    reporterId: services.deleteField,
    reporterAccountDeleted: true,
  });
  batch.delete(root);
  batch.delete(services.db.collection("memberships").doc(identity.uid));
  await batch.commit();
  await services.auth.deleteUser(identity.uid);
  return { deleted: true };
}
