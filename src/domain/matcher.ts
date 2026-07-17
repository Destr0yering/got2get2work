export interface MatchPolicy {
  worksiteId: string;
  commuteLeg: "to_work" | "from_work";
  maxArrivalOverlapMinutes: number;
  maxDepartureOverlapMinutes: number;
  maxDetourMinutes: number;
  needsAccessibleVehicle: boolean;
}

export interface CandidateFacts {
  id: string;
  worksiteId: string;
  commuteLeg: "to_work" | "from_work";
  canDrive: boolean;
  seatsAvailable: number;
  arrivalOverlapMinutes: number;
  departureOverlapMinutes: number;
  detourMinutes: number;
  recurringDays: number;
  fairnessRotation: number;
  accessibleVehicle: boolean;
  activeConsent: boolean;
  blocked: boolean;
  detourMiles: number;
  sharedMiles: number;
  operatingCostPerMile: number;
  tolls: number;
  estimatedTripCost: number;
  comparableSoloCost: number;
}

export interface RankedCandidate {
  id: string;
  score: number;
  suggestedExpenseShare: number;
}

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function isEligibleCandidate(policy: MatchPolicy, candidate: CandidateFacts) {
  return (
    candidate.worksiteId === policy.worksiteId &&
    candidate.commuteLeg === policy.commuteLeg &&
    candidate.canDrive &&
    candidate.seatsAvailable > 0 &&
    candidate.arrivalOverlapMinutes <= policy.maxArrivalOverlapMinutes &&
    candidate.departureOverlapMinutes <= policy.maxDepartureOverlapMinutes &&
    candidate.detourMinutes <= policy.maxDetourMinutes &&
    (!policy.needsAccessibleVehicle || candidate.accessibleVehicle) &&
    candidate.activeConsent &&
    !candidate.blocked
  );
}

export function calculateExpenseShare(candidate: CandidateFacts) {
  const incrementalCost = candidate.detourMiles * candidate.operatingCostPerMile + candidate.tolls;
  const sharedSegmentCost = candidate.sharedMiles * candidate.operatingCostPerMile * 0.5;
  const capped = Math.min(incrementalCost + sharedSegmentCost, candidate.estimatedTripCost, candidate.comparableSoloCost);
  return Math.round(Math.max(0, capped) * 100) / 100;
}

export function scoreCandidate(policy: MatchPolicy, candidate: CandidateFacts) {
  const arrivalFit = 1 - clamp(candidate.arrivalOverlapMinutes / policy.maxArrivalOverlapMinutes);
  const departureFit = 1 - clamp(candidate.departureOverlapMinutes / policy.maxDepartureOverlapMinutes);
  const detourFit = 1 - clamp(candidate.detourMinutes / policy.maxDetourMinutes);
  const recurringFit = clamp(candidate.recurringDays / 5);
  const fairnessFit = clamp(candidate.fairnessRotation);
  return Math.round((arrivalFit * 25 + departureFit * 25 + detourFit * 30 + recurringFit * 10 + fairnessFit * 10) * 10) / 10;
}

export function rankCandidates(policy: MatchPolicy, candidates: CandidateFacts[]): RankedCandidate[] {
  return candidates
    .filter((candidate) => isEligibleCandidate(policy, candidate))
    .map((candidate) => ({
      id: candidate.id,
      score: scoreCandidate(policy, candidate),
      suggestedExpenseShare: calculateExpenseShare(candidate)
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
