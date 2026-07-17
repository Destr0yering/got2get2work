import { ImpactSummary, MatchOption, Persona, PersonaId } from "../domain/models";
import { CandidateFacts, MatchPolicy, rankCandidates } from "../domain/matcher";

export const personas: Record<PersonaId, Persona> = {
  maya: {
    id: "maya",
    firstName: "Maya",
    initials: "MP",
    role: "passenger",
    workplace: "Northstar Fulfillment · North Campus",
    workEmail: "maya@northstar.demo",
    areaLabel: "Pine & 4th area",
    trustLine: "Demo work email verified"
  },
  jordan: {
    id: "jordan",
    firstName: "Jordan",
    initials: "JL",
    role: "driver",
    workplace: "Northstar Fulfillment · North Campus",
    workEmail: "jordan@northstar.demo",
    areaLabel: "West River area",
    trustLine: "Demo work email verified"
  }
};

const matchPolicy: MatchPolicy = {
  worksiteId: "north-campus",
  commuteLeg: "to_work",
  maxArrivalOverlapMinutes: 15,
  maxDepartureOverlapMinutes: 15,
  maxDetourMinutes: 10,
  needsAccessibleVehicle: false
};

const candidateFacts: CandidateFacts[] = [
  {
    id: "match-jordan", worksiteId: "north-campus", commuteLeg: "to_work", canDrive: true, seatsAvailable: 2,
    arrivalOverlapMinutes: 8, departureOverlapMinutes: 12, detourMinutes: 5, recurringDays: 4, fairnessRotation: 0.7,
    accessibleVehicle: true, activeConsent: true, blocked: false,
    detourMiles: 1, sharedMiles: 9, operatingCostPerMile: 0.4, tolls: 1,
    estimatedTripCost: 8, comparableSoloCost: 18
  },
  {
    id: "match-avery", worksiteId: "north-campus", commuteLeg: "to_work", canDrive: true, seatsAvailable: 1,
    arrivalOverlapMinutes: 11, departureOverlapMinutes: 9, detourMinutes: 9, recurringDays: 3, fairnessRotation: 0.9,
    accessibleVehicle: true, activeConsent: true, blocked: false,
    detourMiles: 0.5, sharedMiles: 8, operatingCostPerMile: 0.5, tolls: 0.55,
    estimatedTripCost: 7, comparableSoloCost: 18
  }
];

const seededMatches: Record<string, Omit<MatchOption, "suggestedShare" | "suggestedRoundTripShare" | "deterministicScore">> = {
  "match-jordan": {
    id: "match-jordan",
    personName: "Jordan L.",
    initials: "JL",
    areaLabel: "Passes near Pine & 4th",
    workplace: "Northstar Fulfillment · North Campus",
    vehicleLabel: "Blue compact SUV · plate ending 42K",
    meetingArea: "Pine & 4th area",
    meetingPoint: "Pine Street Library entrance",
    pickupTime: "6:22 AM",
    arrivalTime: "6:52 AM",
    departureTime: "3:42 PM",
    returnArrivalTime: "4:12 PM",
    detourMinutes: 5,
    overlapMinutes: 8,
    departureOverlapMinutes: 12,
    fitLabel: "Best fit",
    completedRides: 12,
    onTimeRate: "96%",
    reasonCodes: ["SAME_WORKSITE", "ARRIVAL_OVERLAP_8M", "DEPARTURE_OVERLAP_12M", "DETOUR_5M", "RECURRING_4_DAYS"],
    facts: [
      { id: "worksite", label: "Workplace", value: "Same seeded North Campus workplace group" },
      { id: "time", label: "Schedule", value: "Arrives within 8 minutes of your shift" },
      { id: "return-time", label: "Return schedule", value: "Leaves within 12 minutes of shift end" },
      { id: "route", label: "Route", value: "Pickup adds about 5 minutes" },
      { id: "cost", label: "Expense share", value: "$3.20 suggested gas and toll contribution" }
    ]
  },
  "match-avery": {
    id: "match-avery",
    personName: "Avery R.",
    initials: "AR",
    areaLabel: "Crosses the East Market corridor",
    workplace: "Northstar Fulfillment · North Campus",
    vehicleLabel: "Silver sedan · plate ending 18R",
    meetingArea: "East Market area",
    meetingPoint: "East Market transit shelter",
    pickupTime: "6:15 AM",
    arrivalTime: "6:49 AM",
    departureTime: "3:50 PM",
    returnArrivalTime: "4:24 PM",
    detourMinutes: 9,
    overlapMinutes: 11,
    departureOverlapMinutes: 9,
    fitLabel: "Good backup",
    completedRides: 7,
    onTimeRate: "94%",
    standingBackupOffer: true,
    reasonCodes: ["SAME_WORKSITE", "ARRIVAL_OVERLAP_11M", "DEPARTURE_OVERLAP_9M", "DETOUR_9M"],
    facts: [
      { id: "worksite", label: "Workplace", value: "Same seeded North Campus workplace group" },
      { id: "time", label: "Schedule", value: "Arrives within 11 minutes of your shift" },
      { id: "return-time", label: "Return schedule", value: "Leaves within 9 minutes of shift end" },
      { id: "route", label: "Route", value: "Pickup adds about 9 minutes" },
      { id: "cost", label: "Expense share", value: "$2.80 suggested gas contribution" }
    ]
  }
};

export const matches: MatchOption[] = rankCandidates(matchPolicy, candidateFacts).map((ranked) => ({
  ...seededMatches[ranked.id],
  deterministicScore: ranked.score,
  suggestedShare: `$${ranked.suggestedExpenseShare.toFixed(2)}`,
  suggestedRoundTripShare: `$${(ranked.suggestedExpenseShare * 2).toFixed(2)}`
}));

export const jordanPickupOptions = {
  library: {
    label: "Library entrance",
    meetingPoint: "Pine Street Library entrance",
    meetingArea: "Pine & 4th area",
    pickupTime: "6:22 AM",
    arrivalTime: "6:52 AM",
    detourMinutes: 5,
    suggestedShare: "$3.20",
    suggestedRoundTripShare: "$6.40"
  },
  transit: {
    label: "Transit shelter",
    meetingPoint: "Pine & 4th transit shelter",
    meetingArea: "Pine & 4th area",
    pickupTime: "6:18 AM",
    arrivalTime: "6:50 AM",
    detourMinutes: 7,
    suggestedShare: "$3.40",
    suggestedRoundTripShare: "$6.80"
  }
} as const;

export function applyPickupOption(match: MatchOption, pickupOptionId: "library" | "transit") {
  if (match.id !== "match-jordan") return match;
  return { ...match, ...jordanPickupOptions[pickupOptionId] };
}

export const impactSummary: ImpactSummary = {
  shiftsCovered: 4,
  monthlySavings: "$64",
  fewerSoloTrips: 3
};

export const defaultScheduleText = "Warehouse A, Mon–Thu, 7–3:30";
