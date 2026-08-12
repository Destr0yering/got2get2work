import { randomUUID } from "node:crypto";
import type { CommuteLeg, MatchCandidate, MatchSearchResult } from "../../../../../packages/contracts/src";
import type { AgreementService } from "../agreement/service"; import type { CommuteStore } from "../commute/ports"; import type { MembershipRecord, RequestIdentity } from "../membership/domain"; import type { MembershipStore } from "../membership/ports"; import type { VehicleStore } from "../vehicle/ports"; import { MatchingError } from "./domain"; import type { MatchingStore } from "./ports";
const policyVersion = "coarse-area-v1"; const minutes = (v: string) => Number(v.slice(0, 2)) * 60 + Number(v.slice(3));
const role = (profile: { toWorkRole: string; homeRole: string }, leg: CommuteLeg) => leg === "to_work" ? profile.toWorkRole : profile.homeRole;
export interface MatchingServiceOptions { matches: MatchingStore; memberships: MembershipStore; commutes: CommuteStore; vehicles: VehicleStore; agreements: AgreementService; now?: () => Date }
export class MatchingService {
  private readonly now: () => Date; constructor(private readonly o: MatchingServiceOptions) { this.now = o.now ?? (() => new Date()); }
  async search(identity: RequestIdentity, shiftId: string, leg: CommuteLeg): Promise<MatchSearchResult> {
    const [requesterProfile, requesterShift, memberships, profiles, requesterAgreements] = await Promise.all([this.o.commutes.getProfile(identity.uid), this.o.commutes.getShift(shiftId), this.o.memberships.listMemberships({ tenantId: identity.tenantId, worksiteId: identity.worksiteId, status: "active", limit: 200 }), this.o.commutes.listProfiles(identity.tenantId, identity.worksiteId), this.o.agreements.required(identity, false)]);
    if (requesterAgreements.some((v) => v.required && !v.accepted)) throw new MatchingError("Current worker agreements are required.", "AGREEMENTS_REQUIRED", 409);
    if (!requesterProfile?.pickupAreaId || requesterProfile.adultConfirmed !== true) throw new MatchingError("Complete the adult and pickup-area profile requirements before matching.", "PROFILE_INCOMPLETE", 409);
    if (!requesterShift || requesterShift.uid !== identity.uid || requesterShift.status !== "confirmed" || requesterShift.tenantId !== identity.tenantId || requesterShift.worksiteId !== identity.worksiteId) throw new MatchingError("A confirmed shift is required.", "SHIFT_NOT_ELIGIBLE", 409);
    if (!["crew", "either"].includes(role(requesterProfile, leg))) throw new MatchingError("Your selected commute role cannot request a captain for this leg.", "ROLE_NOT_ELIGIBLE", 409);
    const byUid = new Map(profiles.map((v) => [v.uid, v])); const ranked: Array<MatchCandidate & { uid: string }> = [];
    for (const member of memberships.filter((v) => v.uid !== identity.uid)) {
      const candidateProfile = byUid.get(member.uid); if (!candidateProfile || candidateProfile.adultConfirmed !== true || candidateProfile.pickupAreaId !== requesterProfile.pickupAreaId || !["captain", "either"].includes(role(candidateProfile, leg))) continue;
      const [vehicle, shifts, restricted, captain] = await Promise.all([this.o.vehicles.getByOwner(member.uid), this.o.commutes.listShifts(member.uid), this.o.matches.isRestricted(identity.tenantId, identity.uid, member.uid), this.o.agreements.eligibility(this.candidateIdentity(member))]);
      if (!vehicle || vehicle.tenantId !== identity.tenantId || vehicle.worksiteId !== identity.worksiteId || vehicle.seatsAvailable < 1 || restricted || !captain.eligible || (requesterProfile.accessibilityRequired === true && vehicle.wheelchairAccessible !== true)) continue;
      const candidates = shifts.filter((s) => s.status === "confirmed" && s.tenantId === identity.tenantId && s.worksiteId === identity.worksiteId); let best: { days: string[]; difference: number } | null = null;
      for (const shift of candidates) { const days = requesterShift.weekdays.filter((d) => shift.weekdays.includes(d)); const field = leg === "to_work" ? "arrivalTime" : "departureTime"; const difference = Math.abs(minutes(requesterShift[field]) - minutes(shift[field])); if (days.length && difference <= 30 && (!best || difference < best.difference || (difference === best.difference && days.length > best.days.length))) best = { days, difference }; }
      if (!best) continue; const score = Math.round((70 * (1 - best.difference / 30) + 30 * (best.days.length / 7)) * 10) / 10;
      ranked.push({ uid: member.uid, id: randomUUID(), displayName: candidateProfile.displayName, score, sharedWeekdays: best.days, scheduleDifferenceMinutes: best.difference, detourMinutes: 0, routeMode: "coarse_area", expenseEstimate: null });
    }
    ranked.sort((a, b) => b.score - a.score || a.uid.localeCompare(b.uid)); const runId = randomUUID(); await this.o.matches.saveRun({ id: runId, uid: identity.uid, tenantId: identity.tenantId, worksiteId: identity.worksiteId, shiftId, leg, policyVersion, candidates: ranked.map((v) => ({ id: v.id, uid: v.uid })), createdAt: this.now() });
    return { runId, policyVersion, candidates: ranked.slice(0, 20).map(({ uid: _uid, ...v }) => v), emptyReason: ranked.length ? "none" : "no_eligible_coworkers" };
  }
  private candidateIdentity(v: MembershipRecord): RequestIdentity { return { uid: v.uid, email: v.email, emailVerified: true, membershipId: v.id, tenantId: v.tenantId, worksiteId: v.worksiteId, role: v.role }; }
}
