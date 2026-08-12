import { CommuteProfile, IdentityAppearance, MatchExplanation, PersonaId, RouteId, ScheduleParseResult, TabId } from "../domain/models";

export type AppAction =
  | { type: "HYDRATE_ACCOUNT"; state: Partial<import("../domain/models").AppState> }
  | { type: "NAVIGATE"; route: RouteId }
  | { type: "SET_TAB"; tab: TabId }
  | { type: "SET_CONSENT"; acceptedTerms: boolean; schedulePermission: boolean; notificationPermission: boolean }
  | { type: "REVIEW_POLICY"; kind: "terms" | "privacy" }
  | { type: "UPDATE_PERMISSIONS"; schedulePermission: boolean; notificationPermission: boolean }
  | { type: "SAVE_PROFILE"; profile: CommuteProfile }
  | { type: "SET_SCHEDULE_TEXT"; text: string }
  | { type: "AGENT_STARTED" }
  | { type: "PARSE_SUCCEEDED"; result: ScheduleParseResult }
  | { type: "EXPLANATION_SUCCEEDED"; result: MatchExplanation }
  | { type: "AGENT_FAILED"; message: string }
  | { type: "SAVE_SCHEDULE" }
  | { type: "SELECT_MATCH"; matchId: string }
  | { type: "SELECT_PICKUP_OPTION"; pickupOptionId: "library" | "transit" }
  | { type: "SET_MATCH_SCENARIO"; scenario: "matches" | "none" }
  | { type: "SEND_REQUEST" }
  | { type: "SWITCH_ACTOR"; actorId: PersonaId }
  | { type: "ACCEPT_REQUEST" }
  | { type: "CANCEL_RIDE" }
  | { type: "OPEN_RECOVERY" }
  | { type: "ACCEPT_BACKUP_OFFER" }
  | { type: "COMPLETE_RIDE" }
  | { type: "SEND_RIDE_MESSAGE"; text: string }
  | { type: "SET_RELATIONSHIP_PREFERENCE"; preference: "again" | "preferred" | "blocked" }
  | { type: "UPDATE_APPEARANCE"; appearance: IdentityAppearance }
  | { type: "SET_PROXIMITY_OPT_IN"; enabled: boolean }
  | { type: "SET_PASSENGER_AT_PICKUP"; present: boolean }
  | { type: "ADVANCE_VEHICLE_APPROACH" }
  | { type: "SET_NOTICE"; notice: string | null }
  | { type: "SET_DEMO_CONTROLS"; open: boolean }
  | { type: "RESET_DEMO" }
  | { type: "SKIP_TO_DEMO" };
