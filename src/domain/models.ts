export type CommuteRole = "passenger" | "driver" | "either";
export type PersonaId = "maya" | "jordan";
export type TabId = "today" | "matches" | "schedule" | "benefit" | "profile";
export type AvatarId = "sun" | "leaf" | "bolt" | "star";
export type VehicleColorId = "blue" | "green" | "red" | "silver";
export type VehicleType = "Compact SUV" | "Sedan" | "Hatchback" | "Pickup";
export type VehicleApproachStatus = "waiting" | "en_route" | "nearby" | "arrived";

export type RouteId =
  | "welcome"
  | "sign-in"
  | "sign-up"
  | "privacy"
  | "profile-setup"
  | "schedule-agent"
  | "schedule-review"
  | "main"
  | "match-detail"
  | "ride-thread"
  | "pickup-tracker"
  | "recovery"
  | "safety-help"
  | "privacy-controls"
  | "feedback-help"
  | "employer-dashboard"
  | "appearance"
  | "terms"
  | "privacy-policy";

export type TripStatus =
  | "needs_plan"
  | "options_ready"
  | "request_pending"
  | "confirmed"
  | "cancelled"
  | "recovery_ready"
  | "recovered"
  | "completed";

export type AgentSource = "demo" | "live_gpt" | "live_gemini";

export interface AgentMeta {
  source: AgentSource;
  model?: string;
  fallbackReason?: string;
}

export interface Persona {
  id: PersonaId;
  firstName: string;
  initials: string;
  role: CommuteRole;
  workplace: string;
  workEmail: string;
  areaLabel: string;
  trustLine: string;
}

export interface CommuteProfile {
  displayName: string;
  areaLabel: string;
  role: CommuteRole;
  toWorkRole: Exclude<CommuteRole, "either">;
  homeRole: Exclude<CommuteRole, "either">;
  maxDetourMinutes: number;
  seats: number;
  comfortablePassengerSeats?: number;
  centerRearSeatEnabled?: boolean;
  earliestEmbarkmentTime?: string;
  driverArrivalTime?: string;
  earlyArrivalMinutes?: number;
}

export interface IdentityAppearance {
  avatarId: AvatarId;
  vehicleColorId: VehicleColorId;
  vehicleType: VehicleType;
  vehicleNickname: string;
}

export interface ParsedShift {
  id: string;
  weekday: string;
  dateLabel: string;
  startLabel: string;
  endLabel: string;
  worksite: string;
  roleLabel: string;
}

export interface ScheduleParseResult extends AgentMeta {
  summary: string;
  shifts: ParsedShift[];
}

export interface MatchFact {
  id: string;
  label: string;
  value: string;
}

export interface MatchOption {
  id: string;
  personName: string;
  initials: string;
  areaLabel: string;
  workplace: string;
  vehicleLabel: string;
  meetingArea: string;
  meetingPoint: string;
  pickupTime: string;
  arrivalTime: string;
  departureTime: string;
  returnArrivalTime: string;
  detourMinutes: number;
  overlapMinutes: number;
  departureOverlapMinutes: number;
  suggestedShare: string;
  suggestedRoundTripShare: string;
  fitLabel: "Best fit" | "Good backup";
  completedRides: number;
  onTimeRate: string;
  deterministicScore: number;
  standingBackupOffer?: boolean;
  reasonCodes: string[];
  facts: MatchFact[];
}

export interface MatchExplanation extends AgentMeta {
  message: string;
  bullets: string[];
  reasonCodes: string[];
}

export interface TripPlan {
  id: string;
  status: TripStatus;
  activeMatchId?: string;
  requesterId?: PersonaId;
  requestedDriverId?: PersonaId;
  cancelledDriverName?: string;
}

export interface RideMessage {
  id: string;
  matchId: string;
  senderId: PersonaId;
  text: string;
}

export interface ImpactSummary {
  shiftsCovered: number;
  monthlySavings: string;
  fewerSoloTrips: number;
}

export interface BenefitEnrollment {
  sponsorName: string;
  siteName: string;
  planName: string;
  status: "eligible" | "enrolled";
  employeeMonthlyCost: number;
  monthlyRideCredit: number;
  guaranteedRideHomeRemaining: number;
  driverFuelDiscountCents?: number;
  fuelPerkTripThreshold?: number;
}

export interface PilotMetrics {
  eligibleEmployees: number;
  enrolledEmployees: number;
  activeCarpools: number;
  protectedShifts: number;
  successfulRecoveries: number;
  recoveryAttempts: number;
  estimatedAvoidedAbsences: number;
  valuePerAvoidedAbsence: number;
  monthlyPlatformFee: number;
  monthlySubsidyBudget: number;
}

export interface AppState {
  route: RouteId;
  activeTab: TabId;
  actorId: PersonaId;
  acceptedTerms: boolean;
  termsReviewed: boolean;
  privacyReviewed: boolean;
  schedulePermission: boolean;
  notificationPermission: boolean;
  demoMode: boolean;
  profile: CommuteProfile;
  scheduleText: string;
  parsedSchedule: ScheduleParseResult | null;
  selectedMatchId: string;
  selectedPickupOptionId: "library" | "transit";
  matchScenario: "matches" | "none";
  matchExplanation: MatchExplanation | null;
  agentBusy: boolean;
  agentError: string | null;
  trip: TripPlan;
  rideMessages: RideMessage[];
  relationshipPreference: "again" | "preferred" | "blocked" | null;
  blockedMatchIds: string[];
  appearances: Record<PersonaId, IdentityAppearance>;
  proximityOptIn: Record<PersonaId, boolean>;
  vehicleApproachStatus: VehicleApproachStatus;
  passengerAtPickup: boolean;
  notice: string | null;
  demoControlsOpen: boolean;
  benefit: BenefitEnrollment;
  pilotMetrics: PilotMetrics;
}
