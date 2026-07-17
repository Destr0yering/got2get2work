import { TripStatus } from "./models";

const transitions: Record<TripStatus, TripStatus[]> = {
  needs_plan: ["options_ready"],
  options_ready: ["request_pending"],
  request_pending: ["confirmed", "cancelled"],
  confirmed: ["cancelled", "completed"],
  cancelled: ["recovery_ready"],
  recovery_ready: ["recovered"],
  recovered: ["completed", "cancelled"],
  completed: []
};

export function canTransitionTrip(current: TripStatus, next: TripStatus) {
  return transitions[current].includes(next);
}

export function transitionTrip(current: TripStatus, next: TripStatus) {
  if (!canTransitionTrip(current, next)) {
    throw new Error(`Invalid trip transition: ${current} -> ${next}`);
  }
  return next;
}

export function tripStatusLabel(status: TripStatus) {
  const labels: Record<TripStatus, string> = {
    needs_plan: "Needs a plan",
    options_ready: "Matches ready",
    request_pending: "Request pending",
    confirmed: "Ride confirmed",
    cancelled: "Ride cancelled",
    recovery_ready: "Backup ready",
    recovered: "Backup confirmed",
    completed: "Commute complete"
  };
  return labels[status];
}
