import assert from "node:assert/strict";
import test from "node:test";
import { buildApi } from "../src/app";
import type { ApiConfig } from "../src/config";
import { MemoryAgreementStore } from "../src/modules/agreement/memory-store";
import { AgreementService } from "../src/modules/agreement/service";
import { MemoryCommuteStore } from "../src/modules/commute/memory-store";
import { MemoryMatchingStore } from "../src/modules/matching/memory-store";
import { MatchingService } from "../src/modules/matching/service";
import { MemoryMembershipStore } from "../src/modules/membership/memory-store";
import type { FirebaseTokenVerifier } from "../src/modules/membership/ports";
import { MembershipService } from "../src/modules/membership/service";
import { MemoryVehicleStore } from "../src/modules/vehicle/memory-store";
const now = new Date("2026-08-12T14:00:00Z");
const config: ApiConfig = { environment: "test", host: "127.0.0.1", port: 4100, release: "matching-test", exposeDocumentation: false, referralCodePepper: "test-referral-pepper-value", firebase: { apiKey: null, authDomain: null, projectId: "test", appId: null } };
async function fixture() {
  const memberships = new MemoryMembershipStore();
  for (const uid of ["crew", "captain-a", "captain-b"]) memberships.memberships.set(uid, { id: uid, uid, email: `${uid}@test.invalid`, tenantId: "tenant-a", worksiteId: "site-a", role: "worker", status: "active", referralCodeId: "seed", submittedAt: now });
  const commutes = new MemoryCommuteStore();
  for (const [uid, name] of [["crew", "Crew Member"], ["captain-a", "Captain A"], ["captain-b", "Captain B"]]) commutes.profiles.set(uid!, { uid: uid!, tenantId: "tenant-a", worksiteId: "site-a", displayName: name!, adultConfirmed: true, toWorkRole: uid === "crew" ? "crew" : "captain", homeRole: "none", maximumDetourMinutes: 15, seatsAvailable: uid === "crew" ? 0 : 3, pickupAreaId: "zone-1", notificationsEnabled: true, updatedAt: now });
  for (const [id, uid, arrivalTime] of [["crew-shift", "crew", "08:00"], ["a-shift", "captain-a", "08:05"], ["b-shift", "captain-b", "08:15"]]) commutes.shifts.set(id!, { id: id!, uid: uid!, tenantId: "tenant-a", worksiteId: "site-a", weekdays: ["MO", "WE"], arrivalTime: arrivalTime!, departureTime: "17:00", timeZone: "America/New_York", effectiveFrom: "2026-08-01", source: "manual", status: "confirmed", updatedAt: now });
  const vehicles = new MemoryVehicleStore();
  for (const uid of ["captain-a", "captain-b"]) vehicles.vehicles.set(uid, { id: `v-${uid}`, uid, tenantId: "tenant-a", worksiteId: "site-a", make: "PrivateMake", model: "PrivateModel", color: "Blue", year: 2022, seatsAvailable: 3, wheelchairAccessible: true, plateCiphertext: "private-ciphertext", updatedAt: now });
  const agreementStore = new MemoryAgreementStore();
  for (const kind of ["terms", "privacy", "captain"] as const) {
    await agreementStore.putAgreement({ id: kind, kind, version: "1", title: kind, documentUrl: `https://example.test/${kind}`, effectiveAt: new Date("2026-01-01"), retiredAt: null, required: true });
    for (const uid of ["captain-a", "captain-b", ...(kind === "captain" ? [] : ["crew"])]) agreementStore.acceptances.push({ id: `${uid}-${kind}`, uid, tenantId: "tenant-a", agreementId: kind, kind, version: "1", acceptedAt: now, appVersion: null, userAgent: null });
  }
  for (const uid of ["captain-a", "captain-b"]) agreementStore.attestations.set(uid, { id: uid, uid, tenantId: "tenant-a", worksiteId: "site-a", licenseValidThrough: new Date("2027-01-01"), registrationValidThrough: new Date("2027-01-01"), insuranceValidThrough: new Date("2027-01-01"), vehicleSafe: true, conductAcknowledged: true, noImpairmentAcknowledged: true, informationAccurate: true, submittedAt: now });
  const agreements = new AgreementService({ store: agreementStore, now: () => now }); const restrictions = new MemoryMatchingStore();
  const matching = new MatchingService({ matches: restrictions, memberships, commutes, vehicles, agreements, now: () => now }); const membershipService = new MembershipService({ store: memberships, referralPepper: config.referralCodePepper!, now: () => now });
  const verifier: FirebaseTokenVerifier = { verifyIdToken: async (token) => ({ uid: token, email: `${token}@test.invalid`, email_verified: true }) };
  const app = await buildApi({ config, logger: false, membership: { verifier, service: membershipService }, matching: { verifier, memberships: membershipService, matching } });
  return { app, commutes, vehicles, agreementStore, restrictions };
}
const request = (app: Awaited<ReturnType<typeof buildApi>>) => app.inject({ method: "POST", url: "/v1/matches/search", headers: { authorization: "Bearer crew" }, payload: { shiftId: "crew-shift", leg: "to_work" } });
test("matching ranks deterministically and excludes protected data", async () => { const f = await fixture(); try { const response = await request(f.app); assert.equal(response.statusCode, 200); assert.deepEqual(response.json().candidates.map((v: { displayName: string }) => v.displayName), ["Captain A", "Captain B"]); const body = JSON.stringify(response.json()); for (const forbidden of ["captain-a", "PrivateMake", "PrivateModel", "private-ciphertext", "zone-1", "plate"]) assert.equal(body.includes(forbidden), false); assert.equal(f.restrictions.runs[0]?.policyVersion, "coarse-area-v1"); } finally { await f.app.close(); } });
test("every launch hard gate fails closed", async () => { const cases: Array<(f: Awaited<ReturnType<typeof fixture>>) => void> = [f => { f.commutes.profiles.get("captain-a")!.pickupAreaId = "zone-2"; f.commutes.profiles.get("captain-b")!.pickupAreaId = "zone-2"; }, f => { f.commutes.profiles.get("captain-a")!.toWorkRole = "crew"; f.commutes.profiles.get("captain-b")!.toWorkRole = "crew"; }, f => { f.vehicles.vehicles.get("captain-a")!.seatsAvailable = 0; f.vehicles.vehicles.get("captain-b")!.seatsAvailable = 0; }, f => { f.commutes.shifts.get("a-shift")!.arrivalTime = "09:00"; f.commutes.shifts.get("b-shift")!.arrivalTime = "09:00"; }, f => { f.restrictions.restrict("crew", "captain-a"); f.restrictions.restrict("crew", "captain-b"); }, f => { f.agreementStore.attestations.clear(); }, f => { f.commutes.profiles.get("crew")!.accessibilityRequired = true; f.vehicles.vehicles.get("captain-a")!.wheelchairAccessible = false; f.vehicles.vehicles.get("captain-b")!.wheelchairAccessible = false; }]; for (const mutate of cases) { const f = await fixture(); try { mutate(f); const response = await request(f.app); assert.equal(response.statusCode, 200); assert.equal(response.json().candidates.length, 0); assert.equal(response.json().emptyReason, "no_eligible_coworkers"); } finally { await f.app.close(); } } });
test("requester requires current agreements, confirmed shift, and crew role", async () => { const f = await fixture(); try { f.agreementStore.acceptances.splice(f.agreementStore.acceptances.findIndex((v) => v.uid === "crew"), 1); let response = await request(f.app); assert.equal(response.json().error.code, "AGREEMENTS_REQUIRED"); f.agreementStore.acceptances.push({ id: "crew-terms-new", uid: "crew", tenantId: "tenant-a", agreementId: "terms", kind: "terms", version: "1", acceptedAt: now, appVersion: null, userAgent: null }); f.commutes.shifts.get("crew-shift")!.status = "candidate"; response = await request(f.app); assert.equal(response.json().error.code, "SHIFT_NOT_ELIGIBLE"); f.commutes.shifts.get("crew-shift")!.status = "confirmed"; f.commutes.profiles.get("crew")!.toWorkRole = "captain"; response = await request(f.app); assert.equal(response.json().error.code, "ROLE_NOT_ELIGIBLE"); } finally { await f.app.close(); } });
